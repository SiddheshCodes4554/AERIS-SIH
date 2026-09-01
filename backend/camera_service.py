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
        
        self.camera_index = int(os.getenv("CAMERA_INDEX", "-1")) # Default to Simulator if not specified
        self.cap = None
        self.is_running = False
        self.is_camera_available = False
        self.is_simulation = False
        self.latest_frame = None
        self.latest_jpeg = None
        self.latest_sim_targets = []
        self.failed_hardware_indices = set()
        self.frame_lock = threading.Lock()
        self.thread = None
        self.sim_tick = 0
        self._initialized = True

    def _try_open_backend(self, idx, backend):
        """Attempts to open a single VideoCapture with a specific backend."""
        try:
            if backend is not None:
                cap = cv2.VideoCapture(idx, backend)
            else:
                cap = cv2.VideoCapture(idx)

            if cap and cap.isOpened():
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
                cap.set(cv2.CAP_PROP_FPS, 30)
                
                ret, frame = cap.read()
                if ret and frame is not None and frame.size > 0:
                    return cap
                cap.release()
        except Exception as e:
            logger.debug(f"Failed opening camera index {idx} with backend {backend}: {e}")
        return None

    def _safe_open_camera(self, index=None, timeout=1.2):
        """Probes and opens physical webcam in a non-blocking thread with a strict timeout."""
        idx = self.camera_index if index is None else index
        if idx < 0:
            return None

        result = {"cap": None}

        def probe():
            if os.name == 'nt':
                for b in [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY]:
                    cap = self._try_open_backend(idx, b)
                    if cap:
                        result["cap"] = cap
                        return
            else:
                cap = self._try_open_backend(idx, cv2.CAP_ANY)
                if cap:
                    result["cap"] = cap

        thread = threading.Thread(target=probe, daemon=True)
        thread.start()
        thread.join(timeout=timeout)

        if result["cap"] is not None:
            logger.info(f"Connected to Physical Camera hardware at index {idx}")
            return result["cap"]
        
        logger.warning(f"Physical camera index {idx} not accessible or timed out.")
        return None

    def _generate_drone_simulation_frame(self, message="● AERIS-01 EO/IR TACTICAL RESCUE FEED"):
        """Generates dynamic 720p 30FPS aerial search drone simulation feed with renderable targets."""
        self.sim_tick += 1
        t = self.sim_tick * 0.04
        
        width, height = 1280, 720
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # 1. Dynamic terrain background (dark tactical aerial landscape)
        frame[:] = (16, 20, 22)
        
        # Moving terrain grid effect (simulating drone flight)
        offset_x = int((t * 25) % 40)
        offset_y = int((t * 15) % 40)
        
        for y in range(-40 + offset_y, height + 40, 40):
            cv2.line(frame, (0, y), (width, y), (26, 34, 38), 1)
        for x in range(-40 + offset_x, width + 40, 40):
            cv2.line(frame, (x, 0), (x, height), (26, 34, 38), 1)

        # Draw contour-like topography lines
        for r in [180, 320, 480]:
            cx = int(width / 2 + math.sin(t * 0.2) * 60)
            cy = int(height / 2 + math.cos(t * 0.2) * 40)
            cv2.ellipse(frame, (cx, cy), (r + int(math.sin(t) * 10), int(r * 0.6)), 15, 0, 360, (22, 30, 34), 1, cv2.LINE_AA)

        # 2. Render Target 1: Walking Survivor / Person (High contrast for YOLO detection)
        px = int(width * 0.42 + math.sin(t * 0.5) * 140)
        py = int(height * 0.48 + math.cos(t * 0.3) * 70)
        
        # Head
        cv2.circle(frame, (px, py - 35), 10, (220, 220, 220), -1, cv2.LINE_AA)
        # Torso
        cv2.ellipse(frame, (px, py - 5), (14, 22), 0, 0, 360, (200, 200, 200), -1, cv2.LINE_AA)
        # Legs
        cv2.line(frame, (px - 6, py + 15), (px - 10 + int(math.sin(t*3)*6), py + 42), (200, 200, 200), 5, cv2.LINE_AA)
        cv2.line(frame, (px + 6, py + 15), (px + 10 - int(math.sin(t*3)*6), py + 42), (200, 200, 200), 5, cv2.LINE_AA)
        # Arms
        cv2.line(frame, (px - 12, py - 18), (px - 22, py + 5), (200, 200, 200), 4, cv2.LINE_AA)
        cv2.line(frame, (px + 12, py - 18), (px + 22, py + 5), (200, 200, 200), 4, cv2.LINE_AA)
        
        # 3. Render Target 2: Emergency Rescue Vehicle / Truck
        vx = int(width * 0.70 - math.cos(t * 0.4) * 180)
        vy = int(height * 0.65 + math.sin(t * 0.2) * 50)
        
        # Vehicle chassis body
        cv2.rectangle(frame, (vx - 60, vy - 30), (vx + 60, vy + 30), (70, 90, 100), -1)
        cv2.rectangle(frame, (vx - 50, vy - 25), (vx + 50, vy + 25), (160, 170, 180), -1)
        # Cabin
        cv2.rectangle(frame, (vx + 10, vy - 20), (vx + 45, vy + 20), (40, 50, 60), -1)
        # Wheels
        for wx in [vx - 40, vx + 30]:
            cv2.circle(frame, (wx, vy - 32), 8, (20, 20, 20), -1)
            cv2.circle(frame, (wx, vy + 32), 8, (20, 20, 20), -1)

        # 4. UAV Optics HUD Reticle & Crosshairs
        cx, cy = width // 2, height // 2
        
        cv2.circle(frame, (cx, cy), 130, (59, 142, 219), 1, cv2.LINE_AA)
        cv2.circle(frame, (cx, cy), 180, (30, 45, 52), 1, cv2.LINE_AA)
        
        cv2.line(frame, (cx - 220, cy), (cx - 40, cy), (59, 142, 219), 1, cv2.LINE_AA)
        cv2.line(frame, (cx + 40, cy), (cx + 220, cy), (59, 142, 219), 1, cv2.LINE_AA)
        cv2.line(frame, (cx, cy - 160), (cx, cy - 30), (59, 142, 219), 1, cv2.LINE_AA)
        cv2.line(frame, (cx, cy + 30), (cx, cy + 160), (59, 142, 219), 1, cv2.LINE_AA)

        b_len = 30
        cv2.line(frame, (40, 40), (40 + b_len, 40), (59, 142, 219), 2)
        cv2.line(frame, (40, 40), (40, 40 + b_len), (59, 142, 219), 2)
        
        cv2.line(frame, (width - 40, 40), (width - 40 - b_len, 40), (59, 142, 219), 2)
        cv2.line(frame, (width - 40, 40), (width - 40, 40 + b_len), (59, 142, 219), 2)
        
        cv2.line(frame, (40, height - 40), (40 + b_len, height - 40), (59, 142, 219), 2)
        cv2.line(frame, (40, height - 40), (40, height - 40 - b_len), (59, 142, 219), 2)
        
        cv2.line(frame, (width - 40, height - 40), (width - 40 - b_len, height - 40), (59, 142, 219), 2)
        cv2.line(frame, (width - 40, height - 40), (width - 40, height - 40 - b_len), (59, 142, 219), 2)

        # Header Text
        cv2.putText(frame, "AERIS-01 EO/IR OPTICAL PAYLOAD • SEARCH SENSOR", (55, 65), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (59, 142, 219), 2, cv2.LINE_AA)
        
        # Status Message
        cv2.putText(frame, message, (55, 95), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (98, 195, 112), 2, cv2.LINE_AA)

        # Real-Time Timestamp
        ts = time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
        cv2.putText(frame, f"PAYLOAD SYNC: {ts} • 30 FPS", (55, height - 55), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.48, (98, 195, 112), 1, cv2.LINE_AA)

        sim_targets = [
            {
                "class": "person",
                "display_name": "PERSON DETECTED",
                "confidence": 0.94,
                "bounding_box": {
                    "x1": px - 35,
                    "y1": py - 52,
                    "x2": px + 35,
                    "y2": py + 50
                }
            },
            {
                "class": "car",
                "display_name": "VEHICLE DETECTED",
                "confidence": 0.89,
                "bounding_box": {
                    "x1": vx - 65,
                    "y1": vy - 35,
                    "x2": vx + 65,
                    "y2": vy + 35
                }
            }
        ]

        ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
        return frame, (jpeg.tobytes() if ret else None), sim_targets

    def _capture_loop(self):
        """Continuously captures frames from webcam or simulation feed in background thread."""
        logger.info("Camera capture loop started.")
        retry_delay = 3.0
        last_retry = 0

        while self.is_running:
            # Case 1: Operator explicitly selected Rescue Drone Simulator (camera_index == -1)
            if self.camera_index == -1:
                self.is_camera_available = True
                self.is_simulation = True
                sim_frame, sim_jpeg, sim_targets = self._generate_drone_simulation_frame("● RESCUE DRONE SIMULATOR (AI ACTIVE)")
                with self.frame_lock:
                    self.latest_frame = sim_frame
                    self.latest_jpeg = sim_jpeg
                    self.latest_sim_targets = sim_targets
                time.sleep(0.033)
                continue

            # Case 2: Hardware Webcam mode (camera_index >= 0)
            if self.cap is None or not self.cap.isOpened():
                self.is_camera_available = False
                now = time.time()
                # Only attempt probe if index hasn't failed previously or after extended retry delay (60s)
                should_probe = (self.camera_index not in self.failed_hardware_indices) or (now - last_retry > 60.0)
                if should_probe and (now - last_retry > retry_delay):
                    last_retry = now
                    self.cap = self._safe_open_camera(self.camera_index)
                    if self.cap:
                        self.is_camera_available = True
                        self.is_simulation = False
                        self.failed_hardware_indices.discard(self.camera_index)
                    else:
                        self.failed_hardware_indices.add(self.camera_index)
                
                # If physical webcam cannot be opened, fall back to Tactical Simulation stream so UI is never black
                if not self.is_camera_available:
                    self.is_simulation = True
                    sim_frame, sim_jpeg, sim_targets = self._generate_drone_simulation_frame("● RESCUE DRONE SIMULATOR (WEBCAM UNPLUGGED)")
                    with self.frame_lock:
                        self.latest_frame = sim_frame
                        self.latest_jpeg = sim_jpeg
                        self.latest_sim_targets = sim_targets
                    time.sleep(0.033)
                    continue

            # Read frame from active physical webcam
            ret, frame = self.cap.read()
            if ret and frame is not None and frame.size > 0:
                self.is_camera_available = True
                self.is_simulation = False
                encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 82]
                ret_enc, jpeg = cv2.imencode('.jpg', frame, encode_param)
                if ret_enc:
                    with self.frame_lock:
                        self.latest_frame = frame
                        self.latest_jpeg = jpeg.tobytes()
                        self.latest_sim_targets = []
            else:
                self.is_camera_available = False
                if self.cap:
                    self.cap.release()
                    self.cap = None
                time.sleep(0.3)

            time.sleep(0.03)

    def start(self):
        """Starts the capture thread."""
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._capture_loop, daemon=True)
            self.thread.start()

    def get_status(self):
        """Returns the current camera availability status."""
        mode_str = "hardware" if (self.is_camera_available and not self.is_simulation) else "simulation"
        return {
            "camera_available": True,
            "camera_index": self.camera_index,
            "is_simulation": self.is_simulation,
            "mode": mode_str,
            "status": "active"
        }

    def list_available_cameras(self):
        """Returns list of camera devices including physical webcams and Rescue Drone Simulator."""
        devices = []
        
        # Always offer the Rescue Drone Simulator option
        devices.append({
            "index": -1,
            "name": "Rescue Drone Simulator (EO/IR AI Feed)",
            "is_active": (self.camera_index == -1 or self.is_simulation),
            "available": True
        })

        devices.append({
            "index": 0,
            "name": "Camera 0 (Integrated / Primary Webcam)",
            "is_active": (self.camera_index == 0 and not self.is_simulation),
            "available": self.is_camera_available
        })

        devices.append({
            "index": 1,
            "name": "Camera 1 (USB / Secondary Feed)",
            "is_active": (self.camera_index == 1 and not self.is_simulation),
            "available": True
        })

        return devices

    def select_camera(self, new_index: int):
        """Switches active camera index (-1 for Simulator, 0/1 for Hardware webcams)."""
        logger.info(f"Switching active camera index to {new_index}...")
        self.failed_hardware_indices.discard(new_index) # Reset failed status on explicit selection
        with self.frame_lock:
            if self.cap and self.cap.isOpened():
                self.cap.release()
            self.cap = None
            self.camera_index = new_index
            if new_index == -1:
                self.is_simulation = True
                self.is_camera_available = True
            else:
                self.is_simulation = False
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

