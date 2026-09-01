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
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

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
    "person": (112, 220, 120),     # Neon Tactical Green
    "car": (35, 175, 255),         # Amber Orange
    "truck": (35, 175, 255),
    "bus": (35, 175, 255),
    "motorcycle": (35, 175, 255),
    "bicycle": (35, 175, 255),
    "backpack": (235, 160, 50),    # High-vis Cyan
    "handbag": (235, 160, 50),
    "suitcase": (235, 160, 50),
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
        self.confidence_threshold = float(os.getenv("YOLO_CONFIDENCE", "0.40")) # Enhanced sensitivity
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
        
        # Spatial-Temporal Bounding Box Smoothing Cache {cls_name: [x1, y1, x2, y2]}
        self.box_smoothing_cache = {}
        
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
        self.cooldown_seconds = 2.5
        
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

    def _smooth_box(self, cls_name, raw_box, alpha=0.75):
        """Applies Exponential Moving Average smoothing to stabilize bounding boxes."""
        if cls_name not in self.box_smoothing_cache:
            self.box_smoothing_cache[cls_name] = [float(v) for v in raw_box]
            return [int(v) for v in raw_box]
        
        prev = self.box_smoothing_cache[cls_name]
        smoothed = [
            alpha * raw_box[i] + (1.0 - alpha) * prev[i]
            for i in range(4)
        ]
        self.box_smoothing_cache[cls_name] = smoothed
        return [int(v) for v in smoothed]

    def _draw_tactical_box(self, img, box, cls_name, conf):
        """Draws prominent, high-contrast tactical HUD bounding box with large confidence badge."""
        x1, y1, x2, y2 = [int(v) for v in box]
        h_img, w_img = img.shape[:2]
        
        # Clamp coordinates
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w_img - 1, x2), min(h_img - 1, y2)
        
        color = CLASS_COLORS.get(cls_name, (112, 220, 120))
        glow_color = (color[0] // 3, color[1] // 3, color[2] // 3)
        
        # 1. Subtle bounding box border
        cv2.rectangle(img, (x1, y1), (x2, y2), glow_color, 2, cv2.LINE_AA)
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 1, cv2.LINE_AA)
        
        # 2. Prominent tactical corner reticle brackets (3px thick, length 24px)
        bw = x2 - x1
        bh = y2 - y1
        corner_len = max(12, min(28, bw // 4, bh // 4))
        thick = 3
        
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
        
        # 3. Center Target Lock Crosshair
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2
        ch_len = 8
        cv2.line(img, (cx - ch_len, cy), (cx + ch_len, cy), color, 1, cv2.LINE_AA)
        cv2.line(img, (cx, cy - ch_len), (cx, cy + ch_len), color, 1, cv2.LINE_AA)
        cv2.circle(img, (cx, cy), 3, color, -1, cv2.LINE_AA)
        
        # 4. High-Visibility Tactical Header Badge: e.g. "TARGET: PERSON  [ 94.8% ]"
        conf_pct = conf * 100.0
        label_text = f" {cls_name.upper()} [ {conf_pct:.1f}% ] "
        
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.62
        font_thick = 2
        
        (tw, th), baseline = cv2.getTextSize(label_text, font, font_scale, font_thick)
        
        # Position badge above box if space permits, otherwise inside
        badge_y2 = y1 - 4 if y1 - th - 12 > 0 else y1 + th + 14
        badge_y1 = badge_y2 - th - 10
        badge_x1 = x1
        badge_x2 = min(w_img - 2, x1 + tw + 12)
        
        # Draw solid dark badge with colored double border
        cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y2), (7, 11, 14), -1) # Dark solid fill
        cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y2), color, 2)       # Crisp colored border
        
        # Draw text with dark drop shadow for maximum outdoor readability
        cv2.putText(img, label_text, (badge_x1 + 6, badge_y2 - 6), font, font_scale, (0, 0, 0), font_thick + 2, cv2.LINE_AA)
        cv2.putText(img, label_text, (badge_x1 + 6, badge_y2 - 6), font, font_scale, color, font_thick, cv2.LINE_AA)

    def _process_detections(self, frame, results):
        """Extracts genuine YOLO detections, applies smoothing, prints logs, and annotates frame."""
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
                
                raw_xyxy = box.xyxy[0].tolist()
                smoothed_xyxy = self._smooth_box(cls_name, raw_xyxy)
                display_name = ALLOWED_CLASSES[cls_name]
                
                x1, y1, x2, y2 = smoothed_xyxy
                w = x2 - x1
                h = y2 - y1
                
                detection_item = {
                    "class": cls_name,
                    "display_name": display_name,
                    "confidence": round(conf, 2),
                    "confidence_pct": round(conf * 100, 1),
                    "bounding_box": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                        "w": w,
                        "h": h
                    }
                }
                current_detections.append(detection_item)
                
                # Draw high-visibility tactical HUD bounding box
                self._draw_tactical_box(annotated_frame, smoothed_xyxy, cls_name, conf)
                
                # Terminal Console Logging & Event Emission
                last_event = self.event_cooldowns.get(cls_name)
                should_emit = False
                if not last_event or (now - last_event["time"] > self.cooldown_seconds):
                    should_emit = True
                elif conf > (last_event["confidence"] + 0.12):
                    should_emit = True
                
                if should_emit:
                    event_id = f"det_{int(now * 1000)}"
                    event_payload = {
                        "event_id": event_id,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "class": cls_name,
                        "display_name": display_name,
                        "confidence": round(conf, 2),
                        "confidence_pct": round(conf * 100, 1),
                        "bounding_box": {"x1": x1, "y1": y1, "w": w, "h": h}
                    }
                    self.event_history.append(event_payload)
                    self.event_cooldowns[cls_name] = {"time": now, "confidence": conf}
                    
                    # Highlighted Terminal Log Output
                    print(f"\n>>> [AERIS AI DETECTED] 🎯 {cls_name.upper()} | Conf: {conf*100:.1f}% | Box: [x:{x1}, y:{y1}, w:{w}, h:{h}] | Latency: {self.inference_time_ms:.1f}ms")
                    
                    if self.event_callback:
                        self.event_callback(event_payload)

        # Clear smoothing cache for classes no longer in frame
        active_classes = {d["class"] for d in current_detections}
        for cached_cls in list(self.box_smoothing_cache.keys()):
            if cached_cls not in active_classes:
                del self.box_smoothing_cache[cached_cls]

        # Encode annotated frame to JPEG
        ret, jpeg = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
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
