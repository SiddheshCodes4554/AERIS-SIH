import os
import time
import threading
import logging
from datetime import datetime
from collections import deque
import cv2
import numpy as np
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aeris.detection")
logging.basicConfig(level=logging.INFO)

# Prioritized Genuine Detection Classes
ALLOWED_CLASSES = {
    "person": "PERSON DETECTED",
    "car": "VEHICLE DETECTED",
    "truck": "VEHICLE DETECTED",
    "bus": "VEHICLE DETECTED",
    "motorcycle": "VEHICLE DETECTED",
    "bicycle": "VEHICLE DETECTED",
    "backpack": "EQUIPMENT DETECTED",
    "handbag": "EQUIPMENT DETECTED",
    "suitcase": "EQUIPMENT DETECTED",
}

# Distinct Tactical HUD Colors (BGR format for OpenCV)
CLASS_COLORS = {
    "person": (98, 195, 112),      # Neon Green #62C370
    "car": (35, 166, 245),         # Amber #F5A623
    "truck": (35, 166, 245),
    "bus": (35, 166, 245),
    "motorcycle": (35, 166, 245),
    "bicycle": (35, 166, 245),
    "backpack": (219, 158, 59),    # Electric Cyan #3B9EFF
    "handbag": (219, 158, 59),
    "suitcase": (219, 158, 59),
}

class DetectionService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(DetectionService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.model_name = os.getenv("YOLO_MODEL", "yolov8n.pt")
        self.confidence_threshold = float(os.getenv("YOLO_CONFIDENCE", "0.50"))
        self.high_conf_threshold = float(os.getenv("HIGH_CONFIDENCE_PERSON", "0.70"))
        self.iou_threshold = float(os.getenv("YOLO_IOU", "0.45"))
        self.img_size = int(os.getenv("YOLO_IMG_SIZE", "640"))
        
        self.model = None
        self.device = "cpu"
        self.is_running = False
        self.is_model_loaded = False
        
        # Performance metrics
        self.inference_fps = 0.0
        self.inference_time_ms = 0.0
        self.total_frames_processed = 0
        
        # Thread synchronization & output storage
        self.data_lock = threading.Lock()
        self.latest_annotated_frame = None
        self.latest_annotated_jpeg = None
        self.latest_detections = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_detections": 0,
            "detections": [],
            "inference_fps": 0.0,
            "inference_time_ms": 0.0
        }
        
        # In-memory detection event history (Max 100 events)
        self.event_history = deque(maxlen=100)
        self.event_cooldowns = {} # {cls_name: {"time": float, "confidence": float}}
        self.cooldown_seconds = 3.5
        
        # Callback for WebSocket broadcasts
        self.event_callback = None
        self.update_callback = None
        
        self.thread = None
        self._initialized = True

    def _init_model(self):
        """Loads Ultralytics YOLO model once and warms it up."""
        if self.is_model_loaded and self.model is not None:
            return
        try:
            import torch
            from ultralytics import YOLO
            
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Loading AERIS Vision YOLO model '{self.model_name}' on device: {self.device.upper()}...")
            
            self.model = YOLO(self.model_name)
            self.model.to(self.device)
            
            # Warm up model with a dummy frame
            dummy_frame = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
            self.model.predict(
                source=dummy_frame, 
                conf=self.confidence_threshold, 
                iou=self.iou_threshold, 
                imgsz=self.img_size, 
                verbose=False
            )
            
            self.is_model_loaded = True
            logger.info(f"AERIS Vision YOLO model '{self.model_name}' loaded successfully and warmed up.")
        except Exception as e:
            logger.error(f"Failed to load YOLO model '{self.model_name}': {e}")
            self.is_model_loaded = False

    def _draw_tactical_box(self, img, box, cls_name, conf):
        """Draws high-contrast cinematic tactical bounding box with corner reticle brackets."""
        x1, y1, x2, y2 = [int(v) for v in box]
        color = CLASS_COLORS.get(cls_name, (98, 195, 112))
        
        # 1. Subtle bounding box outline
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 1, cv2.LINE_AA)
        
        # 2. Corner reticle brackets
        corner_len = min(16, max(6, (x2 - x1) // 4), max(6, (y2 - y1) // 4))
        thick = 2
        # Top-Left
        cv2.line(img, (x1, y1), (x1 + corner_len, y1), color, thick)
        cv2.line(img, (x1, y1), (x1, y1 + corner_len), color, thick)
        # Top-Right
        cv2.line(img, (x2, y1), (x2 - corner_len, y1), color, thick)
        cv2.line(img, (x2, y1), (x2, y1 + corner_len), color, thick)
        # Bottom-Left
        cv2.line(img, (x1, y2), (x1 + corner_len, y2), color, thick)
        cv2.line(img, (x1, y2), (x1, y2 - corner_len), color, thick)
        # Bottom-Right
        cv2.line(img, (x2, y2), (x2 - corner_len, y2), color, thick)
        cv2.line(img, (x2, y2), (x2, y2 - corner_len), color, thick)
        
        # 3. Tactical Header Badge: e.g. "PERSON 96%"
        pct = int(conf * 100)
        label = f"{cls_name.upper()} {pct}%"
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.42
        font_thick = 1
        
        (w, h), baseline = cv2.getTextSize(label, font, font_scale, font_thick)
        pill_y1 = max(0, y1 - h - 6)
        pill_y2 = pill_y1 + h + 6
        pill_x2 = x1 + w + 10
        
        # Background badge
        cv2.rectangle(img, (x1, pill_y1), (pill_x2, pill_y2), (11, 14, 15), -1)
        cv2.rectangle(img, (x1, pill_y1), (pill_x2, pill_y2), color, 1)
        
        # Label text
        cv2.putText(img, label, (x1 + 5, pill_y2 - 4), font, font_scale, color, font_thick, cv2.LINE_AA)

    def _process_detections(self, frame, results):
        """Extracts genuine YOLO detections from the real camera frame."""
        annotated_frame = frame.copy()
        current_detections = []
        now = time.time()
        
        if results and len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                cls_name = self.model.names.get(cls_id, "").lower()
                conf = float(box.conf[0].item())
                
                # Apply confidence and class filter
                if cls_name not in ALLOWED_CLASSES or conf < self.confidence_threshold:
                    continue
                
                xyxy = box.xyxy[0].tolist()
                display_name = ALLOWED_CLASSES[cls_name]
                
                detection_item = {
                    "class": cls_name,
                    "display_name": display_name,
                    "confidence": round(conf, 2),
                    "bounding_box": {
                        "x1": int(xyxy[0]),
                        "y1": int(xyxy[1]),
                        "x2": int(xyxy[2]),
                        "y2": int(xyxy[3])
                    }
                }
                current_detections.append(detection_item)
                
                # Draw tactical box on annotated frame
                self._draw_tactical_box(annotated_frame, xyxy, cls_name, conf)
                
                # Temporal debouncing for event emission
                last_event = self.event_cooldowns.get(cls_name)
                should_emit = False
                if not last_event or (now - last_event["time"] > self.cooldown_seconds):
                    should_emit = True
                elif conf > (last_event["confidence"] + 0.15):
                    should_emit = True
                
                if should_emit:
                    event_id = f"det_{int(now * 1000)}"
                    event_payload = {
                        "event_id": event_id,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "class": cls_name,
                        "display_name": display_name,
                        "confidence": round(conf, 2)
                    }
                    self.event_history.append(event_payload)
                    self.event_cooldowns[cls_name] = {"time": now, "confidence": conf}
                    
                    if self.event_callback:
                        self.event_callback(event_payload)

        # Encode annotated frame to JPEG
        ret, jpeg = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 82])
        jpeg_bytes = jpeg.tobytes() if ret else None

        detection_payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_detections": len(current_detections),
            "detections": current_detections,
            "inference_fps": round(self.inference_fps, 1),
            "inference_time_ms": round(self.inference_time_ms, 1)
        }

        with self.data_lock:
            self.latest_annotated_frame = annotated_frame
            self.latest_annotated_jpeg = jpeg_bytes
            self.latest_detections = detection_payload

        # Broadcast update to WebSocket
        if self.update_callback:
            self.update_callback(detection_payload)

    def _inference_loop(self):
        """Continuous inference worker reading from shared real hardware camera."""
        from camera_service import camera_service
        logger.info("Real YOLO inference loop started.")
        
        fps_smoothing = 0.9
        
        while self.is_running:
            if not self.is_model_loaded or self.model is None:
                time.sleep(0.5)
                continue
            
            with camera_service.frame_lock:
                frame = camera_service.latest_frame
                is_cam_avail = camera_service.is_camera_available
            
            if frame is None:
                time.sleep(0.04)
                continue

            try:
                t0 = time.time()
                
                # Single shared genuine YOLO inference
                results = self.model.predict(
                    source=frame,
                    conf=self.confidence_threshold,
                    iou=self.iou_threshold,
                    imgsz=self.img_size,
                    verbose=False
                )
                
                t1 = time.time()
                dt = max(t1 - t0, 0.001)
                current_fps = 1.0 / dt
                
                if self.inference_fps == 0.0:
                    self.inference_fps = current_fps
                else:
                    self.inference_fps = (self.inference_fps * fps_smoothing) + (current_fps * (1.0 - fps_smoothing))
                
                self.inference_time_ms = dt * 1000.0
                self.total_frames_processed += 1
                
                self._process_detections(frame, results)
            except Exception as e:
                logger.error(f"Inference error: {e}")
                time.sleep(0.1)

            time.sleep(0.01)

    def start(self):
        """Initializes model and starts background inference thread."""
        if not self.is_running:
            self._init_model()
            self.is_running = True
            self.thread = threading.Thread(target=self._inference_loop, daemon=True)
            self.thread.start()

    def get_status(self):
        """Returns real AI engine metrics."""
        return {
            "status": "active" if self.is_model_loaded else "unavailable",
            "model": self.model_name,
            "device": self.device,
            "confidence_threshold": self.confidence_threshold,
            "iou_threshold": self.iou_threshold,
            "inference_fps": round(self.inference_fps, 1),
            "inference_time_ms": round(self.inference_time_ms, 1),
            "total_frames_processed": self.total_frames_processed
        }

    def get_latest_detections(self):
        """Returns the latest genuine detection results."""
        with self.data_lock:
            return self.latest_detections

    def get_event_history(self):
        """Returns the debounced chronological history of confirmed events."""
        with self.data_lock:
            return list(self.event_history)

    def generate_annotated_frames(self):
        """Yields MJPEG stream of YOLO annotated frames for /api/video/detection-feed."""
        while self.is_running:
            with self.data_lock:
                frame_data = self.latest_annotated_jpeg

            if frame_data is not None:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + frame_data + b'\r\n'
                )
            time.sleep(0.033)

    def shutdown(self):
        """Releases resources and stops inference thread."""
        logger.info("Stopping YOLO detection service...")
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)
        logger.info("YOLO detection service stopped.")


# Shared singleton instance
detection_service = DetectionService()
