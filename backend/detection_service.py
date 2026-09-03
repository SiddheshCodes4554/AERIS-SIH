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

# Priority Disaster & Tactical Search Classes with Dedicated Badges & Colors (BGR format for OpenCV)
SEARCH_CLASSES = {
    # 1. Survivors / Humans
    "person": {"display": "🎯 PERSON", "category": "HUMAN", "color": (112, 235, 120)}, # Neon Green
    
    # 2. Multi-Hazard Primary Targets (Real Fire & Smoke Model)
    "fire": {"display": "🔥 FIRE", "category": "HAZARD", "color": (30, 45, 255)},      # Bright Red/Orange
    "smoke": {"display": "💨 SMOKE", "category": "HAZARD", "color": (220, 200, 100)},    # Slate Cyan
    
    # 3. Vehicles / Transports
    "car": {"display": "🚗 CAR", "category": "VEHICLE", "color": (35, 175, 255)},     # Amber
    "truck": {"display": "🚚 TRUCK", "category": "VEHICLE", "color": (35, 175, 255)},
    "bus": {"display": "🚌 BUS", "category": "VEHICLE", "color": (35, 175, 255)},
    "motorcycle": {"display": "🏍️ MOTORCYCLE", "category": "VEHICLE", "color": (35, 175, 255)},
    "bicycle": {"display": "🚲 BICYCLE", "category": "VEHICLE", "color": (35, 175, 255)},
    "boat": {"display": "🚤 BOAT", "category": "VEHICLE", "color": (35, 175, 255)},
    "airplane": {"display": "✈️ AIRCRAFT", "category": "VEHICLE", "color": (35, 175, 255)},
    
    # 4. Gear / Equipment
    "backpack": {"display": "🎒 BACKPACK", "category": "GEAR", "color": (235, 160, 50)}, # Cyan
    "handbag": {"display": "👜 HANDBAG", "category": "GEAR", "color": (235, 160, 50)},
    "suitcase": {"display": "🧳 SUITCASE", "category": "GEAR", "color": (235, 160, 50)},
    "cell phone": {"display": "📱 PHONE", "category": "GEAR", "color": (235, 160, 50)},
    "laptop": {"display": "💻 LAPTOP", "category": "GEAR", "color": (235, 160, 50)},
    "bottle": {"display": "🍾 BOTTLE", "category": "GEAR", "color": (235, 160, 50)},
    
    # 5. Animals / Rescue Dogs / Hydrants
    "dog": {"display": "🐕 K9 RESCUE", "category": "ANIMAL", "color": (234, 94, 165)},
    "cat": {"display": "🐈 ANIMAL", "category": "ANIMAL", "color": (234, 94, 165)},
    "fire hydrant": {"display": "🧯 HYDRANT", "category": "HAZARD", "color": (61, 77, 255)},
}

AVAILABLE_MODELS = {
    "yolov8s.pt": "YOLOv8-Small (Object / Person Detection)",
    "yolov8m.pt": "YOLOv8-Medium (Competition Object Model)",
    "models/fire_smoke_yolov8n.pt": "YOLOv8-Fire & Smoke (Real Trained Multi-Hazard Model)"
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
        
        # Dual Model Configuration
        self.object_model_name = os.getenv("YOLO_MODEL", "yolov8s.pt")
        self.fire_model_path = os.getenv("FIRE_MODEL", os.path.join(os.getcwd(), "models", "fire_smoke_yolov8n.pt"))
        
        self.confidence_threshold = float(os.getenv("YOLO_CONFIDENCE", "0.45"))
        self.fire_confidence_threshold = float(os.getenv("FIRE_CONFIDENCE", "0.68"))
        self.iou_threshold = float(os.getenv("YOLO_IOU", "0.50"))
        self.img_size = int(os.getenv("YOLO_IMG_SIZE", "640"))
        self.target_filter = "ALL" # "ALL" | "HUMAN_ONLY" | "VEHICLES" | "GEAR" | "HAZARDS"
        
        # Models and Model Statuses
        self.object_model = None
        self.fire_model = None
        self.object_model_status = "OFFLINE"
        self.fire_model_status = "OFFLINE"
        self.supported_fire_classes = ["smoke", "fire"]
        
        self.device = "cpu"
        self.is_running = False
        
        # Performance metrics
        self.inference_fps = 0.0
        self.inference_time_ms = 0.0
        self.total_frames_processed = 0
        
        # Temporal Validation for Fire (FIRE_SUSPECTED -> FIRE_CONFIRMED)
        self.fire_consecutive_frames = 0
        self.fire_confirmation_threshold = 3
        
        # Spatial-Temporal Bounding Box Smoothing & Persistence Trackers
        self.box_smoothing_cache = {}
        self.frame_hit_tracker = {}
        
        # Thread synchronization & output storage
        self.data_lock = threading.Lock()
        
        # Pre-initialize standby frame
        standby_init = np.zeros((720, 1280, 3), dtype=np.uint8)
        standby_init[:] = (11, 14, 15)
        ret_init, jpeg_init = cv2.imencode('.jpg', standby_init, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        self.latest_annotated_frame = standby_init
        self.latest_annotated_jpeg = jpeg_init.tobytes() if ret_init else None
        
        self.latest_detections = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_detections": 0,
            "detections": [],
            "summary": {
                "persons": 0,
                "fire": 0,
                "smoke": 0,
                "hazard_status": "NORMAL",
                "fire_status": "NO_FIRE"
            },
            "inference_fps": 0.0,
            "inference_time_ms": 0.0
        }
        
        # In-memory detection event history (Max 100 events)
        self.event_history = deque(maxlen=100)
        self.event_cooldowns = {}
        self.cooldown_seconds = 4.0
        
        # Callback for WebSocket broadcasts
        self.event_callback = None
        self.update_callback = None
        
        self.thread = None
        self._initialized = True

    def _init_models(self):
        """Loads both Object Model A and Fire Model B ONCE during initialization."""
        import torch
        from ultralytics import YOLO

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Initializing AERIS Multi-Hazard Vision Pipeline on device: {self.device.upper()}...")

        # 1. Load Object Detection Model (Model A)
        try:
            logger.info(f"Loading Primary Object Model '{self.object_model_name}'...")
            obj_m = YOLO(self.object_model_name)
            obj_m.to(self.device)
            dummy_frame = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
            obj_m.predict(source=dummy_frame, conf=self.confidence_threshold, imgsz=self.img_size, verbose=False)
            self.object_model = obj_m
            self.object_model_status = "ACTIVE"
            logger.info(f"Primary Object Model '{self.object_model_name}' loaded successfully.")
        except Exception as e:
            logger.error(f"Failed loading Primary Object Model '{self.object_model_name}': {e}")
            self.object_model_status = "OFFLINE"

        # 2. Load Dedicated Fire Detection Model (Model B)
        try:
            if not os.path.exists(self.fire_model_path):
                # Attempt to download real fire_smoke_yolov8n.pt from HuggingFace
                from huggingface_hub import hf_hub_download
                logger.info(f"Downloading real trained Fire/Smoke YOLO model from HuggingFace (rabahdev/fire-smoke-yolov8n)...")
                downloaded_path = hf_hub_download(repo_id="rabahdev/fire-smoke-yolov8n", filename="best.pt")
                os.makedirs(os.path.dirname(self.fire_model_path), exist_ok=True)
                with open(downloaded_path, 'rb') as fin, open(self.fire_model_path, 'wb') as fout:
                    fout.write(fin.read())

            if os.path.exists(self.fire_model_path):
                logger.info(f"Loading Fire & Smoke Detection Model from '{self.fire_model_path}'...")
                fire_m = YOLO(self.fire_model_path)
                fire_m.to(self.device)
                dummy_frame = np.zeros((self.img_size, self.img_size, 3), dtype=np.uint8)
                fire_m.predict(source=dummy_frame, conf=self.fire_confidence_threshold, imgsz=self.img_size, verbose=False)
                self.fire_model = fire_m
                self.fire_model_status = "ACTIVE"
                if hasattr(fire_m, 'names') and fire_m.names:
                    self.supported_fire_classes = list(fire_m.names.values())
                logger.info(f"Fire & Smoke Model loaded successfully with supported classes: {self.supported_fire_classes}")
            else:
                logger.warning("Fire model file path not found. Fire detection will remain OFFLINE.")
                self.fire_model_status = "OFFLINE"
        except Exception as e:
            logger.error(f"Failed loading Fire Detection Model: {e}")
            self.fire_model_status = "OFFLINE"

    def _smooth_box(self, cls_name, raw_box, alpha=0.70):
        """Applies Exponential Moving Average smoothing to eliminate box jitter."""
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
        """Draws high-visibility tactical HUD bounding box with distinct color per hazard/class."""
        x1, y1, x2, y2 = [int(v) for v in box]
        h_img, w_img = img.shape[:2]
        
        x1, y1 = max(4, x1), max(4, y1)
        x2, y2 = min(w_img - 4, x2), min(h_img - 4, y2)
        
        bw = x2 - x1
        bh = y2 - y1

        color = info.get("color", (112, 235, 120))
        glow_color = (color[0] // 4, color[1] // 4, color[2] // 4)
        
        # Box rectangle
        cv2.rectangle(img, (x1, y1), (x2, y2), glow_color, 2, cv2.LINE_AA)
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 1, cv2.LINE_AA)
        
        # Corner brackets
        corner_len = max(14, min(30, bw // 4, bh // 4))
        thick = 3
        
        cv2.line(img, (x1, y1), (x1 + corner_len, y1), color, thick)
        cv2.line(img, (x1, y1), (x1, y1 + corner_len), color, thick)
        cv2.line(img, (x2, y1), (x2 - corner_len, y1), color, thick)
        cv2.line(img, (x2, y1), (x2, y1 + corner_len), color, thick)
        cv2.line(img, (x1, y2), (x1 + corner_len, y2), color, thick)
        cv2.line(img, (x1, y2), (x1, y2 - corner_len), color, thick)
        cv2.line(img, (x2, y2), (x2 - corner_len, y2), color, thick)
        cv2.line(img, (x2, y2), (x2, y2 - corner_len), color, thick)
        
        # Center Reticle
        cx = (x1 + x2) // 2
        cy = (y1 + y2) // 2
        cv2.circle(img, (cx, cy), 3, color, -1, cv2.LINE_AA)
        
        # Header Badge
        conf_pct = conf * 100.0
        display_label = info.get("display", cls_name.upper())
        label_text = f" {display_label} [ {conf_pct:.1f}% ] "
        
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.75
        font_thick = 2
        
        (tw, th), baseline = cv2.getTextSize(label_text, font, font_scale, font_thick)
        
        if y1 - th - 14 > 5:
            badge_y2 = y1 - 4
            badge_y1 = badge_y2 - th - 10
        else:
            badge_y1 = y1 + 4
            badge_y2 = badge_y1 + th + 10
            
        badge_x1 = x1
        badge_x2 = min(w_img - 4, x1 + tw + 12)
        
        cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y2), (7, 10, 12), -1)
        cv2.rectangle(img, (badge_x1, badge_y1), (badge_x2, badge_y2), color, 2)
        
        text_origin = (badge_x1 + 6, badge_y2 - 6)
        cv2.putText(img, label_text, text_origin, font, font_scale, (0, 0, 0), font_thick + 2, cv2.LINE_AA)
        cv2.putText(img, label_text, text_origin, font, font_scale, color, font_thick, cv2.LINE_AA)

    def _process_frame(self, frame):
        """Runs dual-model inference (Object Model + Fire Model) and fuses detections into unified response."""
        annotated_frame = frame.copy()
        current_detections = []
        now = time.time()
        
        persons_count = 0
        fire_count = 0
        smoke_count = 0
        raw_detected_classes = set()
        
        # 1. Run Model A: Object / Person Detection Model
        if self.object_model is not None:
            try:
                res_obj = self.object_model.predict(
                    source=frame,
                    conf=self.confidence_threshold,
                    iou=self.iou_threshold,
                    imgsz=self.img_size,
                    verbose=False
                )
                if res_obj and len(res_obj) > 0 and res_obj[0].boxes is not None:
                    for box in res_obj[0].boxes:
                        cls_id = int(box.cls[0].item())
                        cls_name = self.object_model.names.get(cls_id, "").lower()
                        conf = float(box.conf[0].item())

                        if cls_name not in SEARCH_CLASSES:
                            continue
                        if cls_name in ["fire", "smoke"]:
                            continue # Leave fire/smoke to dedicated fire model
                        
                        info = SEARCH_CLASSES[cls_name]
                        category = info["category"]

                        if self.target_filter == "HUMAN_ONLY" and category != "HUMAN":
                            continue
                        elif self.target_filter == "VEHICLES" and category != "VEHICLE":
                            continue
                        elif self.target_filter == "GEAR" and category != "GEAR":
                            continue
                        elif self.target_filter == "HAZARDS" and category != "HAZARD":
                            continue

                        if cls_name == "person":
                            persons_count += 1
                        
                        raw_detected_classes.add(cls_name)
                        raw_xyxy = box.xyxy[0].tolist()
                        smoothed_xyxy = self._smooth_box(f"obj_{cls_name}", raw_xyxy)

                        x1, y1, x2, y2 = smoothed_xyxy
                        w = x2 - x1
                        h = y2 - y1

                        item = {
                            "class": cls_name,
                            "category": category,
                            "display_name": info["display"],
                            "confidence": round(conf, 2),
                            "confidence_pct": round(conf * 100, 1),
                            "model_source": "object_model",
                            "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2, "w": w, "h": h}
                        }
                        current_detections.append(item)
                        self._draw_tactical_box(annotated_frame, smoothed_xyxy, cls_name, conf, info)
            except Exception as e:
                logger.error(f"Object model inference error: {e}")

        # 2. Run Model B: Dedicated Fire & Smoke Detection Model
        if self.fire_model is not None and self.fire_model_status == "ACTIVE" and self.target_filter in ["ALL", "HAZARDS"]:
            try:
                res_fire = self.fire_model.predict(
                    source=frame,
                    conf=self.fire_confidence_threshold,
                    iou=self.iou_threshold,
                    imgsz=self.img_size,
                    verbose=False
                )
                if res_fire and len(res_fire) > 0 and res_fire[0].boxes is not None:
                    for box in res_fire[0].boxes:
                        cls_id = int(box.cls[0].item())
                        raw_name = self.fire_model.names.get(cls_id, "fire").lower()
                        conf = float(box.conf[0].item())

                        # Strict confidence threshold for fire/smoke false-positive rejection
                        if conf < self.fire_confidence_threshold:
                            continue

                        # Map model label to standard class name ('fire' or 'smoke')
                        cls_name = "smoke" if "smoke" in raw_name else "fire"
                        
                        # Multi-frame persistence: require 3 consecutive hits for low/medium conf
                        hit_key = f"fire_{cls_name}"
                        hit_count = self.frame_hit_tracker.get(hit_key, 0) + 1
                        self.frame_hit_tracker[hit_key] = hit_count

                        if hit_count < 3 and conf < 0.85:
                            continue # Ignore transient false positive candidates

                        info = SEARCH_CLASSES.get(cls_name, {"display": "🔥 FIRE", "category": "HAZARD", "color": (30, 45, 255)})
                        category = "HAZARD"

                        if cls_name == "fire":
                            fire_count += 1
                        elif cls_name == "smoke":
                            smoke_count += 1

                        raw_detected_classes.add(cls_name)
                        raw_xyxy = box.xyxy[0].tolist()
                        smoothed_xyxy = self._smooth_box(hit_key, raw_xyxy)

                        x1, y1, x2, y2 = smoothed_xyxy
                        w = x2 - x1
                        h = y2 - y1

                        item = {
                            "class": cls_name,
                            "category": category,
                            "display_name": info["display"],
                            "confidence": round(conf, 2),
                            "confidence_pct": round(conf * 100, 1),
                            "model_source": "fire_model",
                            "bounding_box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2, "w": w, "h": h}
                        }
                        current_detections.append(item)
                        self._draw_tactical_box(annotated_frame, smoothed_xyxy, cls_name, conf, info)
            except Exception as e:
                logger.error(f"Fire model inference error: {e}")

        # 3. Temporal Validation for Fire (NO_FIRE -> FIRE_SUSPECTED -> FIRE_CONFIRMED)
        if fire_count > 0:
            self.fire_consecutive_frames += 1
        else:
            self.fire_consecutive_frames = max(0, self.fire_consecutive_frames - 1)

        if self.fire_consecutive_frames >= self.fire_confirmation_threshold:
            fire_status = "FIRE_CONFIRMED"
        elif self.fire_consecutive_frames > 0:
            fire_status = "FIRE_SUSPECTED"
        else:
            fire_status = "NO_FIRE"

        # 4. Multi-Hazard Intelligence Status Calculation
        if persons_count > 0 and fire_status == "FIRE_CONFIRMED":
            hazard_status = "CRITICAL"
        elif fire_status == "FIRE_CONFIRMED":
            hazard_status = "HIGH"
        elif persons_count > 0:
            hazard_status = "MEDIUM"
        else:
            hazard_status = "NORMAL"

        # Optional Spatial Proximity Estimate (Check if person box and fire box are close on frame)
        spatial_hazard = None
        person_boxes = [d["bounding_box"] for d in current_detections if d["class"] == "person"]
        fire_boxes = [d["bounding_box"] for d in current_detections if d["class"] == "fire"]

        for pb in person_boxes:
            pcx, pcy = (pb["x1"] + pb["x2"]) / 2.0, (pb["y1"] + pb["y2"]) / 2.0
            for fb in fire_boxes:
                fcx, fcy = (fb["x1"] + fb["x2"]) / 2.0, (fb["y1"] + fb["y2"]) / 2.0
                dist_px = np.hypot(pcx - fcx, pcy - fcy)
                if dist_px < 220:
                    spatial_hazard = "PERSON NEAR FIRE HAZARD (VISUAL PROXIMITY ESTIMATE)"
                    break

        # 5. Multi-Hazard Detection Event Triggering & Drone Location Association
        primary_trigger_cls = None
        if persons_count > 0 and fire_count > 0:
            primary_trigger_cls = "multi_hazard"
        elif fire_count > 0:
            primary_trigger_cls = "fire"
        elif persons_count > 0:
            primary_trigger_cls = "person"
        elif current_detections:
            primary_trigger_cls = current_detections[0]["class"]

        if primary_trigger_cls:
            last_event = self.event_cooldowns.get(primary_trigger_cls)
            should_emit = False
            if not last_event or (now - last_event["time"] > self.cooldown_seconds):
                should_emit = True

            if should_emit:
                # Retrieve current authoritative drone GPS coordinates from LocationService
                from location_service import location_service
                loc_res = location_service.get_current_location()
                obs_loc = loc_res.get("location", {}) if loc_res.get("status") == "active" else {}

                drone_lat = obs_loc.get("latitude", 47.397958)
                drone_lng = obs_loc.get("longitude", 8.546148)
                drone_alt = obs_loc.get("altitude", 488.0)

                top_conf = max([d["confidence"] for d in current_detections]) if current_detections else 0.90
                
                if primary_trigger_cls == "multi_hazard":
                    display_name = "🚨 MULTI-HAZARD DETECTED (PERSON + FIRE)"
                    priority = "CRITICAL"
                elif primary_trigger_cls == "fire":
                    display_name = "🔥 FIRE HAZARD DETECTED"
                    priority = "HIGH PRIORITY"
                elif primary_trigger_cls == "person":
                    display_name = "👤 SURVIVOR DETECTED"
                    priority = "MEDIUM PRIORITY"
                else:
                    display_name = f"🎯 {primary_trigger_cls.upper()} DETECTED"
                    priority = "MEDIUM PRIORITY"

                event_id = f"det_{int(now * 1000)}"
                event_payload = {
                    "event_id": event_id,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "class": primary_trigger_cls,
                    "category": "HAZARD" if "fire" in primary_trigger_cls or "hazard" in primary_trigger_cls else "HUMAN",
                    "display_name": display_name,
                    "confidence": round(top_conf, 2),
                    "confidence_pct": round(top_conf * 100, 1),
                    "priority": priority,
                    "hazard_status": hazard_status,
                    "fire_status": fire_status,
                    "spatial_hazard": spatial_hazard,
                    "observation_location": {
                        "latitude": drone_lat,
                        "longitude": drone_lng,
                        "altitude": drone_alt,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "source": obs_loc.get("source", "PX4_SIMULATOR")
                    },
                    "location_source": "PX4_SIMULATOR"
                }

                self.event_history.append(event_payload)
                self.event_cooldowns[primary_trigger_cls] = {"time": now, "confidence": top_conf}

                # High-visibility terminal output
                print(f">>> [AERIS AI EVENT] {display_name} ({priority}) | Conf: {top_conf*100:.1f}% | Drone Obs Point: [{drone_lat:.6f}, {drone_lng:.6f}] | Latency: {self.inference_time_ms:.1f}ms")

                if self.event_callback:
                    self.event_callback(event_payload)

        # 6. Encode annotated frame to JPEG for live MJPEG video stream
        ret, jpeg = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
        jpeg_bytes = jpeg.tobytes() if ret else None

        summary_data = {
            "persons": persons_count,
            "fire": fire_count,
            "smoke": smoke_count,
            "hazard_status": hazard_status,
            "fire_status": fire_status,
            "spatial_hazard": spatial_hazard
        }

        detection_payload = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_detections": len(current_detections),
            "detections": current_detections,
            "summary": summary_data,
            "models": {
                "object_model": {
                    "active": self.object_model_status == "ACTIVE",
                    "name": self.object_model_name,
                    "status": self.object_model_status
                },
                "fire_model": {
                    "active": self.fire_model_status == "ACTIVE",
                    "name": "models/fire_smoke_yolov8n.pt",
                    "classes": self.supported_fire_classes,
                    "status": self.fire_model_status
                }
            },
            "inference_fps": round(self.inference_fps, 1),
            "inference_time_ms": round(self.inference_time_ms, 1)
        }

        with self.data_lock:
            self.latest_annotated_frame = annotated_frame
            self.latest_annotated_jpeg = jpeg_bytes
            self.latest_detections = detection_payload

        if self.update_callback:
            self.update_callback(detection_payload)

    def _inference_loop(self):
        """Continuous inference worker processing live frames through both object & fire models."""
        from camera_service import camera_service
        logger.info(f"Multi-Hazard Inference Loop active (Object: {self.object_model_name} • Fire: {self.fire_model_path}).")
        
        fps_smoothing = 0.9
        
        while self.is_running:
            with camera_service.frame_lock:
                frame = camera_service.latest_frame
                is_cam_avail = camera_service.is_camera_available
            
            if frame is None:
                time.sleep(0.03)
                continue

            if not is_cam_avail:
                ret, jpeg = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
                with self.data_lock:
                    self.latest_annotated_frame = frame
                    self.latest_annotated_jpeg = jpeg.tobytes() if ret else None
                    self.latest_detections = {
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "total_detections": 0,
                        "detections": [],
                        "summary": {
                            "persons": 0,
                            "fire": 0,
                            "smoke": 0,
                            "hazard_status": "NORMAL",
                            "fire_status": "NO_FIRE"
                        },
                        "models": {
                            "object_model": {"active": self.object_model_status == "ACTIVE", "name": self.object_model_name},
                            "fire_model": {"active": self.fire_model_status == "ACTIVE", "name": "models/fire_smoke_yolov8n.pt"}
                        },
                        "inference_fps": 0.0,
                        "inference_time_ms": 0.0
                    }
                time.sleep(0.04)
                continue

            try:
                t0 = time.time()
                self._process_frame(frame)
                t1 = time.time()
                dt = max(t1 - t0, 0.001)
                current_fps = 1.0 / dt
                
                if self.inference_fps == 0.0:
                    self.inference_fps = current_fps
                else:
                    self.inference_fps = (self.inference_fps * fps_smoothing) + (current_fps * (1.0 - fps_smoothing))
                
                self.inference_time_ms = dt * 1000.0
                self.total_frames_processed += 1
            except Exception as e:
                logger.error(f"Multi-hazard inference error: {e}")
                time.sleep(0.1)

            time.sleep(0.01)

    def start(self):
        """Initializes both models and starts background multi-hazard inference thread."""
        if not self.is_running:
            self._init_models()
            self.is_running = True
            self.thread = threading.Thread(target=self._inference_loop, daemon=True)
            self.thread.start()

    def shutdown(self):
        """Cleanly stops inference worker."""
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)

    def get_status(self):
        """Returns comprehensive health and metrics for both AI detection models."""
        with self.data_lock:
            latest = self.latest_detections
            
        return {
            "status": "active" if (self.object_model_status == "ACTIVE" or self.fire_model_status == "ACTIVE") else "unavailable",
            "models": {
                "object_model": {
                    "active": self.object_model_status == "ACTIVE",
                    "name": self.object_model_name,
                    "status": self.object_model_status
                },
                "fire_model": {
                    "active": self.fire_model_status == "ACTIVE",
                    "name": "models/fire_smoke_yolov8n.pt",
                    "classes": self.supported_fire_classes,
                    "status": self.fire_model_status
                }
            },
            "summary": latest.get("summary", {
                "persons": 0,
                "fire": 0,
                "smoke": 0,
                "hazard_status": "NORMAL",
                "fire_status": "NO_FIRE"
            }),
            "confidence_threshold": self.confidence_threshold,
            "fire_confidence_threshold": self.fire_confidence_threshold,
            "target_filter": self.target_filter,
            "inference_fps": round(self.inference_fps, 1),
            "inference_time_ms": round(self.inference_time_ms, 1),
            "total_frames_processed": self.total_frames_processed
        }

    def set_config(self, model_name: str = None, confidence: float = None, target_filter: str = None):
        """Dynamically updates confidence thresholds or class filters."""
        with self.data_lock:
            if confidence is not None:
                self.confidence_threshold = max(0.20, min(0.95, float(confidence)))
                self.fire_confidence_threshold = max(0.20, min(0.95, float(confidence)))
            if target_filter is not None:
                self.target_filter = target_filter
        return self.get_status()

    def get_event_history(self):
        """Returns history of recorded multi-hazard detection events."""
        with self.data_lock:
            return list(self.event_history)


# Shared singleton instance
detection_service = DetectionService()
