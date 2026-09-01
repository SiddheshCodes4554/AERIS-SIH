import os
import time
import math
import threading
import logging
import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aeris.camera")
logging.basicConfig(level=logging.INFO)

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
        
        self.camera_index = int(os.getenv("CAMERA_INDEX", "0"))
        self.cap = None
        self.is_running = False
        self.is_camera_available = False
        self.latest_frame = None
        self.latest_jpeg = None
        self.frame_lock = threading.Lock()
        self.thread = None
        self.sim_tick = 0
        self._initialized = True

    def _open_camera(self, index=None):
        """Attempts to open physical webcam using cv2.CAP_DSHOW on Windows."""
        idx = self.camera_index if index is None else index
        try:
            if os.name == 'nt':
                cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW)
            else:
                cap = cv2.VideoCapture(idx)

            if cap and cap.isOpened():
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                cap.set(cv2.CAP_PROP_FPS, 30)
                
                ret, frame = cap.read()
                if ret and frame is not None:
                    logger.info(f"Connected to Physical Camera at index {idx} ({frame.shape[1]}x{frame.shape[0]}) via DirectShow")
                    return cap
                else:
                    cap.release()
        except Exception as e:
            logger.warning(f"Error opening camera index {idx}: {e}")
        
        return None

    def _create_standby_frame(self, message="● CAMERA SENSOR STANDBY"):
        """Generates tactical UAV EO/IR standby canvas with real-time HUD telemetry."""
        self.sim_tick += 1
        t = self.sim_tick * 0.05
        
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        frame[:] = (9, 13, 15)

        # 1. Subtle tactical grid lines
        for y in range(0, 720, 40):
            cv2.line(frame, (0, y), (1280, y), (18, 23, 26), 1)
        for x in range(0, 1280, 40):
            cv2.line(frame, (x, 0), (x, 720), (18, 23, 26), 1)

        # 2. Animated scanning radar line
        scan_x = int((math.sin(t * 0.8) * 0.5 + 0.5) * 1280)
        cv2.line(frame, (scan_x, 0), (scan_x, 720), (35, 60, 70), 1)

        # 3. Center reticle / gimbal crosshair
        cx, cy = 640, 360
        cv2.circle(frame, (cx, cy), 110, (59, 142, 219), 1)
        cv2.circle(frame, (cx, cy), 160, (30, 45, 52), 1)
        cv2.line(frame, (cx - 190, cy), (cx + 190, cy), (59, 142, 219), 1)
        cv2.line(frame, (cx, cy - 140), (cx, cy + 140), (59, 142, 219), 1)

        # 4. Header Bar
        cv2.putText(frame, "AERIS-01 EO/IR OPTICAL PAYLOAD • SEARCH SENSOR", (40, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (59, 142, 219), 2, cv2.LINE_AA)
        
        # 5. Status Notice
        cv2.putText(frame, message, (cx - 210, cy + 200), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (245, 166, 35), 2, cv2.LINE_AA)
        cv2.putText(frame, "SELECT CAMERA 0 OR CAMERA 1 FROM DROPDOWN", (cx - 250, cy + 235), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (140, 148, 146), 1, cv2.LINE_AA)

        # 6. Real-Time Timestamp
        ts = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        cv2.putText(frame, f"PAYLOAD SYNC: {ts} • 30 FPS", (40, 680), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (98, 195, 112), 1, cv2.LINE_AA)

        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        return frame, jpeg.tobytes() if ret else None

    def _capture_loop(self):
        """Continuously captures frames from webcam in background thread."""
        logger.info("Camera capture loop started.")
        retry_delay = 2.0
        last_retry = 0

        while self.is_running:
            if self.cap is None or not self.cap.isOpened():
                self.is_camera_available = False
                now = time.time()
                if now - last_retry > retry_delay:
                    last_retry = now
                    self.cap = self._open_camera()
                    if self.cap:
                        self.is_camera_available = True
                
                if not self.is_camera_available:
                    standby_frame, standby_jpeg = self._create_standby_frame("● CAMERA HARDWARE STANDBY")
                    with self.frame_lock:
                        self.latest_frame = standby_frame
                        self.latest_jpeg = standby_jpeg
                    time.sleep(0.04)
                    continue

            # Read frame from physical webcam
            ret, frame = self.cap.read()
            if ret and frame is not None:
                self.is_camera_available = True
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 82]
                ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)
                if ret_enc:
                    with self.frame_lock:
                        self.latest_frame = frame
                        self.latest_jpeg = jpeg.tobytes()
            else:
                self.is_camera_available = False
                if self.cap:
                    self.cap.release()
                    self.cap = None
                time.sleep(0.5)

            time.sleep(0.03)

    def start(self):
        """Starts the capture thread."""
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.thread.start()

    def get_status(self):
        """Returns the current camera availability status."""
        return {
            "camera_available": self.is_camera_available,
            "camera_index": self.camera_index,
            "status": "active" if self.is_camera_available else "standby"
        }

    def list_available_cameras(self, max_check=3):
        """Probes and returns list of accessible camera devices using DirectShow."""
        devices = []
        for i in range(max_check):
            if i == self.camera_index and self.cap and self.cap.isOpened():
                devices.append({
                    "index": i,
                    "name": f"Camera {i} (Active Primary)",
                    "is_active": True,
                    "available": True
                })
                continue

            try:
                cap = cv2.VideoCapture(i, cv2.CAP_DSHOW) if os.name == 'nt' else cv2.VideoCapture(i)
                if cap and cap.isOpened():
                    ret, _ = cap.read()
                    cap.release()
                    if ret:
                        devices.append({
                            "index": i,
                            "name": f"Camera {i} (Webcam / USB)",
                            "is_active": (i == self.camera_index),
                            "available": True
                        })
            except Exception:
                pass

        if not devices:
            devices.append({
                "index": 0,
                "name": "Camera 0 (Integrated Webcam)",
                "is_active": (self.camera_index == 0),
                "available": self.is_camera_available
            })
            devices.append({
                "index": 1,
                "name": "Camera 1 (USB / Secondary)",
                "is_active": (self.camera_index == 1),
                "available": True
            })

        return devices

    def select_camera(self, new_index: int):
        """Switches the active camera index and resets the capture device."""
        if self.camera_index == new_index and self.cap and self.cap.isOpened():
            return self.get_status()

        logger.info(f"Switching active camera from {self.camera_index} to {new_index}...")
        with self.frame_lock:
            if self.cap and self.cap.isOpened():
                self.cap.release()
            self.cap = None
            self.camera_index = new_index
            self.is_camera_available = False

        return self.get_status()

    def generate_frames(self):
        """Yields multipart MJPEG chunks for FastAPI StreamingResponse."""
        while self.is_running:
            with self.frame_lock:
                frame_data = self.latest_jpeg

            if frame_data is not None:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n'
                )
            time.sleep(0.033)

    def shutdown(self):
        """Releases the camera and stops thread."""
        logger.info("Releasing camera resources...")
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        if self.cap and self.cap.isOpened():
            self.cap.release()
        logger.info("Camera service shutdown complete.")


# Shared singleton instance
camera_service = CameraService()
