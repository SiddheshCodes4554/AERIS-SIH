import os
import time
import asyncio
import math
import threading
import logging
import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aeris.camera")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class CameraService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(CameraService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        # Default to 1 (Phone Link) if available, otherwise 0
        self.camera_index = int(os.getenv("CAMERA_INDEX", "1"))
        self.cap = None
        self.is_running = False
        self.is_camera_available = False
        
        # Pre-allocate initial standby frame
        standby_frame, standby_jpeg = self._create_standby_frame("● INITIALIZING AERIS CAMERA SENSOR...")
        self.latest_frame = standby_frame
        self.latest_jpeg = standby_jpeg
        
        self.frame_lock = threading.Lock()
        self.cap_lock = threading.Lock()
        self.thread = None
        self._initialized = True

    def _open_camera(self, index=None):
        """Attempts to open physical or virtual (Phone Link) camera using DirectShow with handshake buffer."""
        idx = self.camera_index if index is None else index
        
        # On Windows, DirectShow is fastest and avoids MSMF hanging on virtual cameras
        backends = [cv2.CAP_DSHOW, cv2.CAP_ANY] if os.name == 'nt' else [cv2.CAP_ANY]

        for b in backends:
            try:
                cap = cv2.VideoCapture(idx, b)
                if cap and cap.isOpened():
                    # Set minimal buffer size for low latency
                    try:
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    except Exception:
                        pass

                    # Handshake loop: allow virtual camera driver up to 6 frames to synchronize
                    for attempt in range(6):
                        ret, frame = cap.read()
                        if ret and frame is not None and frame.size > 0:
                            h, w = frame.shape[:2]
                            logger.info(f"Connected to Camera [{idx}] ({w}x{h}) via DirectShow.")
                            return cap
                        time.sleep(0.04)

                    cap.release()
            except Exception as e:
                logger.debug(f"Failed opening camera index {idx}: {e}")
        return None

    def _create_standby_frame(self, message="● SEARCHING FOR CAMERA SIGNAL..."):
        """Generates clean tactical payload standby screen when hardware camera is disconnected."""
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        frame[:] = (11, 14, 15)

        # Tactical Grid Lines
        for y in range(0, 720, 40):
            cv2.line(frame, (0, y), (1280, y), (18, 23, 26), 1)
        for x in range(0, 1280, 40):
            cv2.line(frame, (x, 0), (x, 720), (18, 23, 26), 1)

        # Center Reticle
        cx, cy = 640, 360
        cv2.circle(frame, (cx, cy), 110, (59, 142, 219), 1)
        cv2.circle(frame, (cx, cy), 160, (30, 45, 52), 1)
        cv2.line(frame, (cx - 190, cy), (cx + 190, cy), (59, 142, 219), 1)
        cv2.line(frame, (cx, cy - 140), (cx, cy + 140), (59, 142, 219), 1)

        # Header Bar
        cv2.putText(frame, "AERIS-01 EO/IR OPTICAL PAYLOAD • SEARCH SENSOR", (40, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (59, 142, 219), 2, cv2.LINE_AA)
        
        # Status
        cv2.putText(frame, message, (cx - 210, cy + 200), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (245, 166, 35), 2, cv2.LINE_AA)
        cv2.putText(frame, f"ACTIVE DEVICE: CAMERA {self.camera_index} • DIRECTSHOW ACTIVE", (cx - 270, cy + 235), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (140, 148, 146), 1, cv2.LINE_AA)

        # Timestamp
        ts = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        cv2.putText(frame, f"PAYLOAD SYNC: {ts} • 30 FPS", (40, 680), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (98, 195, 112), 1, cv2.LINE_AA)

        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        return frame, (jpeg.tobytes() if ret else None)

    def _capture_loop(self):
        """Continuously captures frames from the active camera in background thread without crashes."""
        logger.info("Real camera capture loop started.")
        retry_delay = 1.0
        last_retry = 0

        while self.is_running:
            with self.cap_lock:
                if self.cap is None or not self.cap.isOpened():
                    now = time.time()
                    if now - last_retry > retry_delay:
                        last_retry = now
                        self.cap = self._open_camera(self.camera_index)
                    self.is_camera_available = (self.cap is not None)
                
                active_cap = self.cap

            if active_cap is None or not self.is_camera_available:
                standby_frame, standby_jpeg = self._create_standby_frame("● SEARCHING FOR CAMERA SIGNAL...")
                with self.frame_lock:
                    self.latest_frame = standby_frame
                    self.latest_jpeg = standby_jpeg
                time.sleep(0.1)
                continue

            try:
                ret, frame = active_cap.read()
                if ret and frame is not None and frame.size > 0:
                    self.is_camera_available = True
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                    ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)
                    if ret_enc:
                        with self.frame_lock:
                            self.latest_frame = frame
                            self.latest_jpeg = jpeg.tobytes()
                else:
                    logger.warning("Camera frame read failed, resetting device handle...")
                    with self.cap_lock:
                        if self.cap:
                            self.cap.release()
                            self.cap = None
                    self.is_camera_available = False
                    time.sleep(0.2)
            except Exception as e:
                logger.error(f"Unexpected capture loop error: {e}")
                with self.cap_lock:
                    if self.cap:
                        self.cap.release()
                        self.cap = None
                self.is_camera_available = False
                time.sleep(0.2)

            time.sleep(0.015)

    def start(self):
        """Starts the physical camera capture thread."""
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.thread.start()

    def get_status(self):
        """Returns the current camera availability status."""
        return {
            "camera_available": self.is_camera_available,
            "camera_index": self.camera_index,
            "status": "active" if self.is_camera_available else "disconnected"
        }

    def list_available_cameras(self, max_check=3):
        """Returns list of camera devices without colliding with active capture handle."""
        devices = []
        for i in range(max_check):
            if i == self.camera_index:
                name = f"Camera {i} (Phone Link / Phone Cam)" if i == 1 else f"Camera {i} (Primary Webcam)"
                devices.append({
                    "index": i,
                    "name": name,
                    "is_active": True,
                    "available": self.is_camera_available
                })
                continue

            # For other inactive devices
            try:
                test_cap = cv2.VideoCapture(i, cv2.CAP_DSHOW) if os.name == 'nt' else cv2.VideoCapture(i)
                if test_cap and test_cap.isOpened():
                    ret, frame = test_cap.read()
                    test_cap.release()
                    if ret and frame is not None:
                        h, w = frame.shape[:2]
                        label = f"Camera {i} (Primary - {w}x{h})" if i == 0 else f"Camera {i} (Phone Link / USB)"
                        devices.append({
                            "index": i,
                            "name": label,
                            "is_active": False,
                            "available": True
                        })
            except Exception:
                pass

        if not devices:
            devices = [
                {
                    "index": 1,
                    "name": "Camera 1 (Phone Link / Phone Cam)",
                    "is_active": (self.camera_index == 1),
                    "available": True
                },
                {
                    "index": 0,
                    "name": "Camera 0 (Primary Webcam)",
                    "is_active": (self.camera_index == 0),
                    "available": self.is_camera_available
                }
            ]
        return devices

    def select_camera(self, new_index: int):
        """Switches active camera index with immediate driver release and fast reconnect."""
        logger.info(f"Switching active camera to index {new_index}...")
        with self.cap_lock:
            if self.cap and self.cap.isOpened():
                self.cap.release()
            self.cap = None
            self.camera_index = new_index
            self.is_camera_available = False
            
            # Immediate fast open with handshaking
            new_cap = self._open_camera(new_index)
            if new_cap:
                self.cap = new_cap
                self.is_camera_available = True
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                    ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)
                    if ret_enc:
                        with self.frame_lock:
                            self.latest_frame = frame
                            self.latest_jpeg = jpeg.tobytes()

        return self.get_status()

    def force_reconnect(self):
        """Forcefully resets video capture driver and immediately reconnects active camera."""
        logger.info(f"Force reconnecting Camera [{self.camera_index}]...")
        return self.select_camera(self.camera_index)

    async def generate_frames(self):
        """Yields multipart MJPEG chunks for FastAPI StreamingResponse asynchronously."""
        while self.is_running:
            with self.frame_lock:
                frame_data = self.latest_jpeg

            if frame_data is not None:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n'
                )
            await asyncio.sleep(0.033)

    def shutdown(self):
        """Releases the hardware camera and stops capture thread."""
        logger.info("Releasing hardware camera resources...")
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        with self.cap_lock:
            if self.cap and self.cap.isOpened():
                self.cap.release()
        logger.info("Camera service shutdown complete.")


# Shared singleton instance
camera_service = CameraService()
