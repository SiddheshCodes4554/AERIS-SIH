import os
import time
import asyncio
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

# Priority Disaster & Tactical Search Classes with Dedicated Badges
SEARCH_CLASSES = {
    # 1. Survivors / Humans
    "person": {"display": "🎯 PERSON", "category": "HUMAN", "color": (112, 235, 120)}, # Neon Green
    
    # 2. Vehicles / Transports
    "car": {"display": "🚗 CAR", "category": "VEHICLE", "color": (35, 175, 255)},     # Amber
    "truck": {"display": "🚚 TRUCK", "category": "VEHICLE", "color": (35, 175, 255)},
    "bus": {"display": "🚌 BUS", "category": "VEHICLE", "color": (35, 175, 255)},
    "motorcycle": {"display": "🏍️ MOTORCYCLE", "category": "VEHICLE", "color": (35, 175, 255)},
    "bicycle": {"display": "🚲 BICYCLE", "category": "VEHICLE", "color": (35, 175, 255)},
    "boat": {"display": "🚤 BOAT", "category": "VEHICLE", "color": (35, 175, 255)},
    "airplane": {"display": "✈️ AIRCRAFT", "category": "VEHICLE", "color": (35, 175, 255)},
    
    # 3. Gear / Equipment
    "backpack": {"display": "🎒 BACKPACK", "category": "GEAR", "color": (235, 160, 50)}, # Cyan
    "handbag": {"display": "👜 HANDBAG", "category": "GEAR", "color": (235, 160, 50)},
    "suitcase": {"display": "🧳 SUITCASE", "category": "GEAR", "color": (235, 160, 50)},
    "cell phone": {"display": "📱 PHONE", "category": "GEAR", "color": (235, 160, 50)},
    "laptop": {"display": "💻 LAPTOP", "category": "GEAR", "color": (235, 160, 50)},
    "bottle": {"display": "🍾 BOTTLE", "category": "GEAR", "color": (235, 160, 50)},
    
    # 4. Animals / Rescue Dogs / Hazards
    "dog": {"display": "🐕 K9 RESCUE", "category": "ANIMAL", "color": (234, 94, 165)},   # Purple/Pink
    "cat": {"display": "🐈 ANIMAL", "category": "ANIMAL", "color": (234, 94, 165)},
    "fire hydrant": {"display": "🧯 HYDRANT", "category": "EQUIPMENT", "color": (61, 77, 255)},
    "fire": {"display": "FIRE", "category": "HAZARD", "color": (30, 75, 255)} # Fiery Red-Orange (BGR)
}

AVAILABLE_MODELS = {
    "yolov8s.pt": "YOLOv8-Small (High Precision • Recommended)",
    "yolov8m.pt": "YOLOv8-Medium (Competition Ultra-Precision)",
    "yolov8n.pt": "YOLOv8-Nano (Ultra Fast)"
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
        
        # Default to High-Precision YOLOv8-Small for Competition Accuracy
        self.model_name = os.getenv("YOLO_MODEL", "yolov8s.pt")
        self.confidence_threshold = float(os.getenv("YOLO_CONFIDENCE", "0.58")) # Clean false-positive rejection
        self.iou_threshold = float(os.getenv("YOLO_IOU", "0.50"))
        self.img_size = int(os.getenv("YOLO_IMG_SIZE", "640"))
        self.target_filter = "ALL" # "ALL" | "HUMAN_ONLY" | "VEHICLES" | "GEAR"
        
        self.model = None
        self.device = "cpu"
        self.is_running = False
        self.is_model_loaded = False
        
        # Dedicated Fire Detection Model
        self.fire_model_name = os.getenv("FIRE_MODEL_PATH", "models/fire_smoke_yolov8n.pt")
        self.fire_confidence_threshold = float(os.getenv("FIRE_CONFIDENCE_THRESHOLD", os.getenv("FIRE_CONFIDENCE", "0.40")))
        self.fire_model = None
        self.is_fire_model_loaded = False
        self.fire_detected = False
        self.hazard_level = "NORMAL"
        self.person_count = 0
        self.fire_count = 0
        
        # Performance metrics
        self.inference_fps = 0.0
        self.inference_time_ms = 0.0
        self.total_frames_processed = 0
        
        # Spatial-Temporal Bounding Box Smoothing & Persistence Trackers
        self.box_smoothing_cache = {} # {cls_name: [x1, y1, x2, y2]}
        self.frame_hit_tracker = {}   # {cls_name: hit_count}
        
        # Thread synchronization & output storage
        self.data_lock = threading.Lock()
        
        # Pre-initialize standby frame so stream never hangs on startup
        standby_init = np.zeros((720, 1280, 3), dtype=np.uint8)
        standby_init[:] = (11, 14, 15)
        ret_init, jpeg_init = cv2.imencode('.jpg', standby_init, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        self.latest_annotated_frame = standby_init
        self.latest_annotated_jpeg = jpeg_init.tobytes() if ret_init else None
        
        self.latest_detections = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_detections": 0,
            "detections": [],
            "person_count": 0,
            "fire_count": 0,
            "fire_detected": False,
            "hazard_level": "NORMAL",
            "inference_fps": 0.0,
            "inference_time_ms": 0.0
        }
        
        # In-memory detection event history (Max 100 events)
        self.event_history = deque(maxlen=100)
        self.event_cooldowns = {} # {cls_name: {"time": float, "confidence": float}}
        self.cooldown_seconds = 5.0
        
        # Callback for WebSocket broadcasts
        self.event_callback = None
        self.update_callback = None
        
        self.thread = None
        self._initialized = True

    def _init_model(self, model_to_load=None):
        """Loads Ultralytics YOLO model once and warms it up."""
        target_model = model_to_load or self.model_name
        try:
            import torch
            from ultralytics import YOLO
            
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Loading High-Accuracy YOLO Model '{target_model}' on device: {self.device.upper()}...")
            
            new_model = YOLO(target_model)
            new_model.to(self.device)
            
            # Warm up model with a dummy frame
            dummy_frame = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
            new_model.predict(
                source=dummy_frame, 
                conf=self.confidence_threshold, 
                iou=self.iou_threshold, 
                imgsz=self.img_size, 
                verbose=False
            )
            
            self.model = new_model
            self.model_name = target_model
            self.is_model_loaded = True
            logger.info(f"YOLO Model '{self.model_name}' loaded successfully with competition-grade accuracy.")
        except Exception as e:
            logger.error(f"Failed to load YOLO model '{target_model}': {e}")
            self.is_model_loaded = False

    def _init_fire_model(self):
        """Loads dedicated YOLO fire detection model once and warms it up."""
        candidate_paths = [
            self.fire_model_name,
            "models/fire_smoke_yolov8n.pt",
            "models/fire_detection.pt",
            os.path.join(os.path.dirname(__file__), "models", "fire_smoke_yolov8n.pt"),
            os.path.join(os.path.dirname(__file__), "models", "fire_detection.pt")
        ]
        model_path_to_load = None
        for p in candidate_paths:
            if p and os.path.exists(p):
                model_path_to_load = p
                break
        
        if not model_path_to_load:
            logger.warning(
                f"Fire detection model unavailable at '{self.fire_model_name}'. "
                f"Person detection continues normally."
            )
            self.fire_model = None
            self.is_fire_model_loaded = False
            return

        try:
            from ultralytics import YOLO
            logger.info(f"Loading Dedicated Fire Detection Model from '{model_path_to_load}' on {self.device.upper()}...")
            fire_m = YOLO(model_path_to_load)
            fire_m.to(self.device)
            
            # Warm up with dummy frame
            dummy = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
            fire_m.predict(
                source=dummy,
                conf=self.fire_confidence_threshold,
                iou=self.iou_threshold,
                imgsz=self.img_size,
                verbose=False
            )
            self.fire_model = fire_m
            self.fire_model_name = model_path_to_load
            self.is_fire_model_loaded = True
            logger.info(f"Dedicated Fire Detection Model loaded successfully (Classes: {fire_m.names}).")
        except Exception as e:
            logger.warning(f"Fire detection model unavailable: {e}. Person detection continues normally.")
            self.fire_model = None
            self.is_fire_model_loaded = False

    def set_config(self, model_name: str = None, confidence: float = None, target_filter: str = None, fire_confidence: float = None):
        """Dynamically switches YOLO model, confidence thresholds, or filter mode."""
        with self.data_lock:
            if confidence is not None:
                self.confidence_threshold = max(0.20, min(0.95, float(confidence)))
                logger.info(f"Updated confidence threshold to: {self.confidence_threshold:.2f}")
            
            if fire_confidence is not None:
                self.fire_confidence_threshold = max(0.15, min(0.95, float(fire_confidence)))
                logger.info(f"Updated fire confidence threshold to: {self.fire_confidence_threshold:.2f}")

            if target_filter is not None:
                self.target_filter = target_filter
                logger.info(f"Updated target filter mode to: {self.target_filter}")
            
            if model_name and model_name in AVAILABLE_MODELS and model_name != self.model_name:
                self._init_model(model_name)

        return self.get_status()

    def _smooth_box(self, cls_name, raw_box, alpha=0.72):
        """Applies Exponential Moving Average smoothing to eliminate frame-to-frame box jitter."""
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

    def _draw_tactical_box(self, img, box, cls_name, conf, info):
        """Draws prominent, high-contrast tactical HUD bounding box with large confidence badge."""
        x1, y1, x2, y2 = [int(v) for v in box]
        h_img, w_img = img.shape[:2]
        
        # Clamp coordinates tightly within frame with margin
        x1, y1 = max(4, x1), max(4, y1)
        x2, y2 = min(w_img - 4, x2), min(h_img - 4, y2)
        
        bw = x2 - x1
        bh = y2 - y1
        
        # Prevent huge edge-to-edge box when standing close
        if bw > 0.88 * w_img:
            margin_x = int(bw * 0.08)
            x1 += margin_x
            x2 -= margin_x
            bw = x2 - x1

        if bh > 0.88 * h_img:
            margin_y = int(bh * 0.06)
            y1 += margin_y
            y2 -= margin_y
            bh = y2 - y1

        color = info.get("color", (112, 235, 120))
        glow_color = (color[0] // 4, color[1] // 4, color[2] // 4)
        
        # 1. Subtle bounding box border outline
        cv2.rectangle(img, (x1, y1), (x2, y2), glow_color, 2, cv2.LINE_AA)
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 1, cv2.LINE_AA)
        
        # 2. Prominent tactical corner reticle brackets (4px thick, length 30px)
        corner_len = max(16, min(34, bw // 4, bh // 4))
        thick = 4
        
        # Top-Left Corner
        cv2.line(img, (x1, y1), (x1 + corner_len, y1), color, thick)
        cv2.line(img, (x1, y1), (x1, y1 + corner_len), color, thick)
        # Top-Right Corner
        cv2.line(img, (x2, y1), (x2 - corner_len, y1), color, thick)
        cv2.line(img, (x2, y1), (x2, y1 + corner_len), color, thick)
        # Bottom-Left Corner
        cv2.line(img, (x1, y2), (x1 + corner_len, y2), color, thick)
        cv2.line(img, (x1, y2), (x1, y2 - corner_len), color, thick)
        # Bottom-Right Corner
        cv2.line(img, (x2, y2), (x2 - corner_len, y2), color, thick)
        cv2.line(img, (x2, y2), (x2, y2 - corner_len), color, thick)
        
        # 3. Target Center Crosshair Reticle
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2
        ch_len = 10
        cv2.line(img, (cx - ch_len, cy), (cx + ch_len, cy), color, 1, cv2.LINE_AA)
        cv2.line(img, (cx, cy - ch_len), (cx, cy + ch_len), color, 1, cv2.LINE_AA)
        cv2.circle(img, (cx, cy), 3, color, -1, cv2.LINE_AA)
        
        # 4. LARGE & CLEAR Tactical Header Badge
        conf_pct = conf * 100.0
        display_label = info.get("display", cls_name.upper())
        label_text = f" {display_label} [ {conf_pct:.1f}% ] "
        
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.80
        font_thick = 2
        
        (tw, th), baseline = cv2.getTextSize(label_text, font, font_scale, font_thick)
        
        # Position badge above box if space permits, otherwise top-inside box
        if y1 - th - 18 > 10:
            badge_y2 = y1 - 4
            badge_y1 = badge_y2 - th - 14
        else:
            badge_y1 = y1 + 6
            badge_y2 = badge_y1 + th + 14
            
        badge_x1 = x1
        badge_x2 = min(w_img - 6, x1 + tw + 16)
        
        # Solid matte black badge background
        cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y2), (7, 10, 12), -1)
        # Bright tactical border
        cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y2), color, 2)
        
        # Large Crisp Text with Black Drop Shadow
        text_origin = (badge_x1 + 8, badge_y2 - 8)
        cv2.putText(img, label_text, text_origin, font, font_scale, (0, 0, 0), font_thick + 3, cv2.LINE_AA)
        cv2.putText(img, label_text, text_origin, font, font_scale, color, font_thick, cv2.LINE_AA)

    def _process_detections(self, frame, results, fire_results=None):
        """Extracts genuine YOLO detections (person/objects + dedicated fire), draws HUD boxes, and emits updates."""
        annotated_frame = frame.copy()
        current_detections = []
        now = time.time()
        
        raw_detected_classes = set()
        
        # 1. Process standard YOLO model detections (PERSON & supported objects)
        if results and len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            for box in boxes:
                cls_id = int(box.cls[0].item())
                cls_name = self.model.names.get(cls_id, "").lower()
                conf = float(box.conf[0].item())
                
                # Filter out unknown/unwanted classes
                if cls_name not in SEARCH_CLASSES:
                    continue
                
                # Exclude fire from general object detector (fire comes strictly from dedicated model)
                if cls_name == "fire":
                    continue

                info = SEARCH_CLASSES[cls_name]
                category = info["category"]
                
                # Apply category filter if set by operator
                if self.target_filter == "HUMAN_ONLY" and category != "HUMAN":
                    continue
                elif self.target_filter == "VEHICLES" and category != "VEHICLE":
                    continue
                elif self.target_filter == "GEAR" and category != "GEAR":
                    continue
                
                # Apply strict confidence threshold for competition-grade precision
                if conf < self.confidence_threshold:
                    continue
                
                raw_detected_classes.add(cls_name)
                
                # Multi-Frame Persistence Filter
                hit_count = self.frame_hit_tracker.get(cls_name, 0) + 1
                self.frame_hit_tracker[cls_name] = hit_count
                
                if hit_count < 2 and conf < 0.70:
                    continue
                
                raw_xyxy = box.xyxy[0].tolist()
                smoothed_xyxy = self._smooth_box(cls_name, raw_xyxy)
                display_name = info["display"]
                
                x1, y1, x2, y2 = smoothed_xyxy
                w = x2 - x1
                h = y2 - y1
                
                detection_item = {
                    "class": cls_name,
                    "category": category,
                    "display_name": display_name,
                    "confidence": round(conf, 2),
                    "confidence_pct": round(conf * 100, 1),
                    "bounding_box": {
                        "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                        "w": w, "h": h
                    }
                }
                current_detections.append(detection_item)
                
                # Draw high-visibility tactical HUD bounding box (Green for person)
                self._draw_tactical_box(annotated_frame, smoothed_xyxy, cls_name, conf, info)
                
                # Terminal Console Logging & Event Emission
                last_event = self.event_cooldowns.get(cls_name)
                should_emit = False
                if not last_event or (now - last_event["time"] > self.cooldown_seconds):
                    should_emit = True
                elif conf > (last_event["confidence"] + 0.10):
                    should_emit = True
                
                if should_emit:
                    # Retrieve current drone telemetry location context from TelemetryService
                    from telemetry_service import telemetry_service
                    telem = telemetry_service.get_telemetry()

                    # Rule-based priority determination
                    priority = "HIGH PRIORITY" if conf >= 0.85 else ("MEDIUM PRIORITY" if conf >= 0.65 else "LOW PRIORITY")

                    event_id = f"det_{int(now * 1000)}"
                    event_payload = {
                        "event_id": event_id,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "class": cls_name,
                        "category": category,
                        "display_name": display_name,
                        "confidence": round(conf, 2),
                        "confidence_pct": round(conf * 100, 1),
                        "priority": priority,
                        "bounding_box": {"x1": x1, "y1": y1, "w": w, "h": h},
                        "observation_location": {
                            "latitude": telem.get("lat", 30.4158),
                            "longitude": telem.get("lng", 79.3245),
                            "altitude": telem.get("altitudeM", 42.5),
                            "speed": telem.get("speedMs", 8.6),
                            "heading": telem.get("heading", 142.0),
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "source": "SIMULATOR_DRONE"
                        },
                        "location_source": "SIMULATOR TELEMETRY"
                    }
                    self.event_history.append(event_payload)
                    self.event_cooldowns[cls_name] = {"time": now, "confidence": conf}
                    
                    # Highlighted Formatted Terminal Output with Drone Telemetry Location
                    drone_lat = telem.get('lat', 30.4158)
                    drone_lng = telem.get('lng', 79.3245)
                    print(f">>> [AERIS TARGET ACQUIRED] {display_name} ({priority}) | Conf: {conf*100:.1f}% | Drone Obs Point: [{drone_lat:.5f}, {drone_lng:.5f}] | Latency: {self.inference_time_ms:.1f}ms")
                    
                    if self.event_callback:
                        self.event_callback(event_payload)

        # 2. Process dedicated fire detection model detections (FIRE)
        if fire_results and len(fire_results) > 0 and fire_results[0].boxes is not None:
            fire_boxes = fire_results[0].boxes
            for f_box in fire_boxes:
                f_cls_id = int(f_box.cls[0].item())
                f_cls_name = self.fire_model.names.get(f_cls_id, "").lower() if self.fire_model else ""
                f_conf = float(f_box.conf[0].item())
                
                # Only the dedicated fire model produces FIRE
                if f_cls_name in ["fire", "flame"] and f_conf >= self.fire_confidence_threshold:
                    raw_detected_classes.add("fire")
                    f_raw_xyxy = f_box.xyxy[0].tolist()
                    f_smoothed_xyxy = self._smooth_box("fire", f_raw_xyxy)
                    
                    fx1, fy1, fx2, fy2 = f_smoothed_xyxy
                    fw = fx2 - fx1
                    fh = fy2 - fy1
                    
                    fire_info = {
                        "display": "FIRE",
                        "category": "HAZARD",
                        "color": (30, 75, 255) # High-visibility Fiery Red-Orange (BGR)
                    }
                    
                    # Draw tactical hazard bounding box in Red-Orange
                    self._draw_tactical_box(annotated_frame, f_smoothed_xyxy, "fire", f_conf, fire_info)
                    
                    fire_item = {
                        "class": "fire",
                        "category": "HAZARD",
                        "display_name": "🔥 FIRE",
                        "confidence": round(f_conf, 2),
                        "confidence_pct": round(f_conf * 100, 1),
                        "bounding_box": {
                            "x1": fx1, "y1": fy1, "x2": fx2, "y2": fy2,
                            "w": fw, "h": fh
                        }
                    }
                    current_detections.append(fire_item)

        # 3. Calculate multi-hazard metrics
        person_count = sum(1 for d in current_detections if d.get("class") == "person" or d.get("category") == "HUMAN")
        fire_count = sum(1 for d in current_detections if d.get("class") == "fire" or d.get("category") == "HAZARD")

        if fire_count > 0 and person_count > 0:
            hazard_level = "CRITICAL"
        elif fire_count > 0:
            hazard_level = "HAZARD"
        elif person_count > 0:
            hazard_level = "WATCH"
        else:
            hazard_level = "NORMAL"

        self.person_count = person_count
        self.fire_count = fire_count
        self.fire_detected = (fire_count > 0)
        self.hazard_level = hazard_level

        # 4. Fire event debouncing & emission
        if fire_count > 0:
            now_f = time.time()
            last_fire_event = self.event_cooldowns.get("fire")
            max_fire_conf = max((d["confidence"] for d in current_detections if d.get("class") == "fire"), default=0.5)
            should_emit_fire = False
            if not last_fire_event or (now_f - last_fire_event["time"] > self.cooldown_seconds):
                should_emit_fire = True
            elif max_fire_conf > (last_fire_event["confidence"] + 0.10):
                should_emit_fire = True
            
            if should_emit_fire:
                from telemetry_service import telemetry_service
                telem = telemetry_service.get_telemetry()
                fire_prio = "CRITICAL HAZARD" if hazard_level == "CRITICAL" else "HAZARD"
                fire_event_payload = {
                    "event_id": f"fire_{int(now_f * 1000)}",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "class": "fire",
                    "category": "HAZARD",
                    "display_name": "🔥 FIRE",
                    "confidence": round(max_fire_conf, 2),
                    "confidence_pct": round(max_fire_conf * 100, 1),
                    "priority": fire_prio,
                    "hazard_level": hazard_level,
                    "observation_location": {
                        "latitude": telem.get("lat", 30.4158),
                        "longitude": telem.get("lng", 79.3245),
                        "altitude": telem.get("altitudeM", 42.5),
                        "speed": telem.get("speedMs", 8.6),
                        "heading": telem.get("heading", 142.0),
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "source": "SIMULATOR_DRONE"
                    },
                    "location_source": "SIMULATOR TELEMETRY"
                }
                self.event_history.append(fire_event_payload)
                self.event_cooldowns["fire"] = {"time": now_f, "confidence": max_fire_conf}
                print(f">>> [AERIS HAZARD DETECTED] 🔥 FIRE ({fire_prio}) | Conf: {max_fire_conf*100:.1f}% | Hazard Level: {hazard_level}")
                if self.event_callback:
                    self.event_callback(fire_event_payload)

        # Decay hit tracker for absent classes
        for tracked_cls in list(self.frame_hit_tracker.keys()):
            if tracked_cls not in raw_detected_classes:
                del self.frame_hit_tracker[tracked_cls]
                if tracked_cls in self.box_smoothing_cache:
                    del self.box_smoothing_cache[tracked_cls]

        # Encode annotated frame to JPEG
        ret, jpeg = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        jpeg_bytes = jpeg.tobytes() if ret else None

        detection_payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_detections": len(current_detections),
            "detections": current_detections,
            "person_count": person_count,
            "fire_count": fire_count,
            "fire_detected": fire_count > 0,
            "hazard_level": hazard_level,
            "model": self.model_name,
            "fire_model": self.fire_model_name if self.is_fire_model_loaded else "unavailable",
            "fire_model_available": self.is_fire_model_loaded,
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
        logger.info(f"High-Precision YOLO Detection Loop started using '{self.model_name}'.")
        if self.is_fire_model_loaded:
            logger.info(f"Dedicated Fire Detection Active using '{self.fire_model_name}'.")
        else:
            logger.warning("Fire detection model unavailable. Person detection continues normally.")
        
        fps_smoothing = 0.9
        
        while self.is_running:
            if not self.is_model_loaded or self.model is None:
                time.sleep(0.3)
                continue
            
            with camera_service.frame_lock:
                frame = camera_service.latest_frame
                is_cam_avail = camera_service.is_camera_available
            
            if frame is None:
                time.sleep(0.03)
                continue

            # If camera is in standby mode, deliver the standby frame directly without wasting CPU on YOLO
            if not is_cam_avail:
                ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                with self.data_lock:
                    self.latest_annotated_frame = frame
                    self.latest_annotated_jpeg = jpeg.tobytes() if ret else None
                    self.latest_detections = {
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "total_detections": 0,
                        "detections": [],
                        "person_count": 0,
                        "fire_count": 0,
                        "fire_detected": False,
                        "hazard_level": "NORMAL",
                        "model": self.model_name,
                        "fire_model": self.fire_model_name if self.is_fire_model_loaded else "unavailable",
                        "fire_model_available": self.is_fire_model_loaded,
                        "inference_fps": 0.0,
                        "inference_time_ms": 0.0
                    }
                time.sleep(0.04)
                continue

            try:
                t0 = time.time()
                
                # 1. Existing YOLO inference on real camera frame (person, objects)
                results = self.model.predict(
                    source=frame,
                    conf=self.confidence_threshold,
                    iou=self.iou_threshold,
                    imgsz=self.img_size,
                    verbose=False
                )
                
                # 2. Dedicated fire detection model inference on the SAME camera frame
                fire_results = None
                if self.is_fire_model_loaded and self.fire_model is not None:
                    try:
                        fire_results = self.fire_model.predict(
                            source=frame,
                            conf=self.fire_confidence_threshold,
                            iou=self.iou_threshold,
                            imgsz=self.img_size,
                            verbose=False
                        )
                    except Exception as fe:
                        logger.warning(f"Fire inference error: {fe}")
                        fire_results = None
                
                t1 = time.time()
                dt = max(t1 - t0, 0.001)
                current_fps = 1.0 / dt
                
                if self.inference_fps == 0.0:
                    self.inference_fps = current_fps
                else:
                    self.inference_fps = (self.inference_fps * fps_smoothing) + (current_fps * (1.0 - fps_smoothing))
                
                self.inference_time_ms = dt * 1000.0
                self.total_frames_processed += 1
                
                self._process_detections(frame, results, fire_results)
            except Exception as e:
                logger.error(f"Inference error: {e}")
                time.sleep(0.1)

            time.sleep(0.01)

    def start(self):
        """Initializes both models and starts background inference thread."""
        if not self.is_running:
            self._init_model()
            self._init_fire_model()
            self.is_running = True
            self.thread = threading.Thread(target=self._inference_loop, daemon=True)
            self.thread.start()

    def shutdown(self):
        """Stops inference worker cleanly."""
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)

    def get_status(self):
        """Returns real AI engine metrics including fire detection."""
        return {
            "status": "active" if self.is_model_loaded else "unavailable",
            "model": self.model_name,
            "model_label": AVAILABLE_MODELS.get(self.model_name, self.model_name),
            "available_models": AVAILABLE_MODELS,
            "confidence_threshold": self.confidence_threshold,
            "target_filter": self.target_filter,
            "iou_threshold": self.iou_threshold,
            "fire_model": self.fire_model_name if self.is_fire_model_loaded else "unavailable",
            "fire_model_available": self.is_fire_model_loaded,
            "fire_confidence_threshold": self.fire_confidence_threshold,
            "fire_detected": self.fire_detected,
            "hazard_level": self.hazard_level,
            "person_count": self.person_count,
            "fire_count": self.fire_count,
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

    async def generate_annotated_frames(self):
        """Yields MJPEG stream of YOLO annotated frames for /api/video/detection-feed asynchronously."""
        while self.is_running:
            with self.data_lock:
                jpeg_bytes = self.latest_annotated_jpeg

            if jpeg_bytes is not None:
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' + jpeg_bytes + b'\r\n'
                )
            
            await asyncio.sleep(0.033)


# Shared singleton instance
detection_service = DetectionService()
