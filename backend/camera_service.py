import os
import time
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
        self._initialized = True
        
        self.start()

    def _open_camera(self):
        """Attempts to open the camera using OpenCV with appropriate backend."""
        try:
            # On Windows, cv2.CAP_DSHOW provides fast and reliable USB/Webcam initialization
            if os.name == 'nt':
                cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
            else:
                cap = cv2.VideoCapture(self.camera_index)

            if cap and cap.isOpened():
                # Configure 720p / standard 16:9 resolution & 30 FPS
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                cap.set(cv2.CAP_PROP_FPS, 30)
                
                # Test reading a single frame
                ret, frame = cap.read()
                if ret and frame is not None:
                    logger.info(f"Successfully connected to Camera at index {self.camera_index} ({frame.shape[1]}x{frame.shape[0]})")
                    return cap
                else:
                    cap.release()
        except Exception as e:
            logger.warning(f"Error opening camera index {self.camera_index}: {e}")
        
        return None

    def _create_standby_frame(self, message="AERIS-01 CAMERA STANDBY"):
        """Generates a technical dark standby frame when physical webcam is unavailable."""
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        frame[:] = (9, 13, 15) # Dark #0B0E0F

        # Grid lines
        for y in range(0, 720, 40):
            cv2.line(frame, (0, y), (1280, y), (20, 25, 28), 1)
        for x in range(0, 1280, 40):
            cv2.line(frame, (x, 0), (x, 720), (20, 25, 28), 1)

        # Center reticle / crosshair
        cx, cy = 640, 360
        cv2.circle(frame, (cx, cy), 90, (59, 142, 219), 1)
        cv2.circle(frame, (cx, cy), 130, (30, 40, 45), 1)
        cv2.line(frame, (cx - 150, cy), (cx + 150, cy), (59, 142, 219), 1)
        cv2.line(frame, (cx, cy - 110), (cx, cy + 110), (59, 142, 219), 1)

        # Header Text
        cv2.putText(frame, "AERIS-01 EO/IR OPTICAL PAYLOAD", (40, 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (59, 142, 219), 2, cv2.LINE_AA)
        
        # Center Status Text
        cv2.putText(frame, message, (cx - 240, cy + 170), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (245, 166, 35), 2, cv2.LINE_AA)
        cv2.putText(frame, "CONNECT USB WEBCAM OR CHECK CAMERA INDEX", (cx - 280, cy + 205), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (140, 148, 146), 1, cv2.LINE_AA)

        # Timestamp
        ts = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        cv2.putText(frame, ts, (40, 680), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (98, 195, 112), 1, cv2.LINE_AA)

        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        return jpeg.tobytes()

    def _capture_loop(self):
        """Continuously captures frames from webcam in background thread."""
        logger.info("Camera capture loop started.")
        retry_delay = 3.0
        last_retry = 0

        while self.is_running:
            if self.cap is None or not self.cap.isOpened():
                self.is_camera_available = False
                now = time.time()
                if now - last_retry > retry_delay:
                    last_retry = now
                    logger.info(f"Attempting to connect to camera {self.camera_index}...")
                    self.cap = self._open_camera()
                    if self.cap:
                        self.is_camera_available = True
                
                if not self.is_camera_available:
                    standby_jpeg = self._create_standby_frame("● CAMERA HARDWARE OFFLINE")
                    with self.frame_lock:
                        self.latest_jpeg = standby_jpeg
                    time.sleep(0.1)
                    continue

            # Read frame from hardware webcam
            ret, frame = self.cap.read()
            if ret and frame is not None:
                self.is_camera_available = True
                # Encode to JPEG with high performance
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 82]
                ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)
                if ret_enc:
                    with self.frame_lock:
                        self.latest_frame = frame
                        self.latest_jpeg = jpeg.tobytes()
            else:
                logger.warning("Failed to grab frame from camera, reconnecting...")
                self.is_camera_available = False
                if self.cap:
                    self.cap.release()
                    self.cap = None
                time.sleep(0.5)

            # Cap frame rate to ~30 FPS
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
            "status": "active" if self.is_camera_available else "unavailable"
        }

    def generate_frames(self):
        """Generator function that yields multipart MJPEG chunks for FastAPI StreamingResponse."""
        while self.is_running:
            with self.frame_lock:
                frame_data = self.latest_jpeg

            if frame_data is not None:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n'
                )
            time.sleep(0.033) # ~30 FPS

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
