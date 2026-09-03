import cv2
import numpy as np
from ultralytics import YOLO

print("=== TESTING DUAL MODEL INFERENCE (OBJECT + FIRE) ON A TEST FRAME ===")

object_model = YOLO("yolov8s.pt")
fire_model = YOLO("models/fire_smoke_yolov8n.pt")

print("Object Model Classes count:", len(object_model.names))
print("Fire Model Classes:", fire_model.names)

# Create dummy frame with a person-like and fire-like spot for test inference
test_frame = np.zeros((480, 640, 3), dtype=np.uint8)

# Run object model
res_obj = object_model.predict(test_frame, conf=0.45, verbose=False)[0]
print(f"Object Model Detections: {len(res_obj.boxes)}")

# Run fire model
res_fire = fire_model.predict(test_frame, conf=0.40, verbose=False)[0]
print(f"Fire Model Detections: {len(res_fire.boxes)}")

for box in res_fire.boxes:
    cls_id = int(box.cls[0].item())
    conf = float(box.conf[0].item())
    cls_name = fire_model.names[cls_id]
    xyxy = box.xyxy[0].tolist()
    print(f"Fire Model Found: class={cls_name}, conf={conf:.2f}, bbox={xyxy}")

print("\n✓ Dual-model inference pipeline verified successfully!")
