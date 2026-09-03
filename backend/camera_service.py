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
        
        # Default camera index: 1 (OBS Virtual Camera / Phone Link) or 0
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
        """Attempts to open physical or virtual (OBS Virtual Camera) camera using DirectShow."""
        idx = self.camera_index if index is None else index
        
        backends = [cv2.CAP_DSHOW, cv2.CAP_ANY] if os.name == 'nt' else [cv2.CAP_ANY]

        for b in backends:
            try:
                cap = cv2.VideoCapture(idx, b)
                if cap and cap.isOpened():
                    try:
                        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    except Exception:
                        pass

                    # Handshake loop: allow virtual camera driver up to 8 frames to synchronize
                    for attempt in range(8):
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

        for y in range(0, 720, 40):
            cv2.line(frame, (0, y), (1280, y), (18, 23, 26), 1)
        for x in range(0, 1280, 40):
            cv2.line(frame, (x, 0), (x, 720), (18, 23, 26), 1)

        cx, cy = 640, 360
        cv2.circle(frame, (cx, cy), 110, (59, 142, 219), 1)
        cv2.circle(frame, (cx, cy), 160, (30, 45, 52), 1)
        cv2.line(frame, (cx - 190, cy), (cx + 190, cy), (59, 142, 219), 1)
        cv2.line(frame, (cx, cy - 140), (cx, cy + 140), (59, 142, 219), 1)

        cv2.putText(frame, "AERIS-01 EO/IR OPTICAL PAYLOAD • SEARCH SENSOR", (40, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (59, 142, 219), 2, cv2.LINE_AA)
        
        cv2.putText(frame, message, (cx - 240, cy + 220), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (35, 175, 255), 2, cv2.LINE_AA)

        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 80]
        ret, jpeg = cv2.imencode('.jpg', frame, encode_param)
        return frame, (jpeg.tobytes() if ret else None)

    def _camera_loop(self):
        """Continuous camera grabber worker keeping latest frame buffer fresh."""
        logger.info(f"Camera grabber thread started for Camera [{self.camera_index}].")
        
        consecutive_failures = 0

        while self.is_running:
            if not self.is_camera_available or self.cap is None or not self.cap.isOpened():
                with self.cap_lock:
                    self.cap = self._open_camera()
                    if self.cap and self.cap.isOpened():
                        self.is_camera_available = True
                        consecutive_failures = 0
                    else:
                        self.is_camera_available = False
                        consecutive_failures += 1

                if not self.is_camera_available:
                    standby_frame, standby_jpeg = self._create_standby_frame("● CAMERA SENSOR OFFLINE • RETRYING LINK...")
                    with self.frame_lock:
                        self.latest_frame = standby_frame
                        self.latest_jpeg = standby_jpeg
                    time.sleep(1.0)
                    continue

            try:
                ret, frame = self.cap.read()
                if ret and frame is not None and frame.size > 0:
                    consecutive_failures = 0
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                    ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)

                    with self.frame_lock:
                        self.latest_frame = frame
                        self.latest_jpeg = jpeg.tobytes() if ret_enc else None
                else:
                    consecutive_failures += 1
                    if consecutive_failures > 15:
                        logger.warning(f"Camera [{self.camera_index}] read dropped. Reconnecting driver...")
                        self.is_camera_available = False
                        with self.cap_lock:
                            if self.cap:
                                self.cap.release()
                            self.cap = None
                    time.sleep(0.03)
            except Exception as e:
                logger.error(f"Error reading frame from camera [{self.camera_index}]: {e}")
                consecutive_failures += 1
                time.sleep(0.05)

            time.sleep(0.01)

    def start(self):
        """Starts background hardware camera reader."""
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._camera_loop, daemon=True)
            self.thread.start()

    def get_latest_frame(self):
        with self.frame_lock:
            return self.latest_frame, self.latest_jpeg

    def get_status(self):
        return {
            "camera_index": self.camera_index,
            "camera_available": self.is_camera_available,
            "status": "active" if self.is_camera_available else "disconnected"
        }

    def list_available_cameras(self, max_check=6):
        """Returns comprehensive list of camera devices (Integrated Webcam, OBS Virtual Camera, USB Cam)."""
        devices = []
        found_indices = set()

        for i in range(max_check):
            name = f"🎥 OBS Virtual Camera / Phone Link (CAM-{i})" if i == 1 else (f"📷 Primary Laptop Webcam (CAM-{i})" if i == 0 else f"🎥 OBS Virtual Camera / USB (CAM-{i})")
            
            if i == self.camera_index:
                devices.append({
                    "index": i,
                    "name": name,
                    "is_active": True,
                    "available": self.is_camera_available
                })
                found_indices.add(i)
                continue

            try:
                test_cap = cv2.VideoCapture(i, cv2.CAP_DSHOW) if os.name == 'nt' else cv2.VideoCapture(i)
                if test_cap and test_cap.isOpened():
                    test_cap.release()
                    devices.append({
                        "index": i,
                        "name": name,
                        "is_active": False,
                        "available": True
                    })
                    found_indices.add(i)
            except Exception:
                pass

        # Guarantee standard camera options (CAM-0, CAM-1, CAM-2) are always present in the selection menu
        defaults = [
            {"index": 1, "name": "🎥 OBS Virtual Camera / Phone Link (CAM-1)"},
            {"index": 0, "name": "📷 Primary Laptop Webcam (CAM-0)"},
            {"index": 2, "name": "🎥 OBS Virtual Camera / External USB (CAM-2)"},
            {"index": 3, "name": "🎥 OBS Virtual Camera (CAM-3)"}
        ]

        for def_item in defaults:
            idx = def_item["index"]
            if idx not in found_indices:
                devices.append({
                    "index": idx,
                    "name": def_item["name"],
                    "is_active": (self.camera_index == idx),
                    "available": (self.camera_index == idx and self.is_camera_available)
                })

        devices.sort(key=lambda x: x["index"])
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
            
            new_cap = self._open_camera(new_index)
            if new_cap:
                self.cap = new_cap
                self.is_camera_available = True
                ret, frame = self.cap.read()
                if ret and frame is not None:
                    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 85]
                    ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)
                    with self.frame_lock:
                        self.latest_frame = frame
                        self.latest_jpeg = jpeg.tobytes() if ret_enc else None
                logger.info(f"Successfully switched active camera to index [{new_index}].")
            else:
                logger.warning(f"Could not open camera at index [{new_index}]. Operating in standby mode.")

        return self.get_status()

    def reconnect(self):
        """Force reconnect current camera driver."""
        return self.select_camera(self.camera_index)


# Shared singleton instance
camera_service = CameraService()
