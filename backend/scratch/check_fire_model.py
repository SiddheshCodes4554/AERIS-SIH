import os
import sys

print("=== TESTING REAL FIRE MODEL DOWNLOAD AND CLASS DISCOVERY ===")

from ultralytics import YOLO

# Models to test
test_models = [
    "foduucom/fire-and-smoke-detection-yolov8",
    "keremberke/yolov8n-fire-detection",
    "slicing-aids/yolov8s-fire-detection",
    "fire_detection.pt"
]

successful_model = None

for m_name in test_models:
    try:
        print(f"\nAttempting to load model: '{m_name}'...")
        model = YOLO(m_name)
        print(f"SUCCESS loading '{m_name}'!")
        print(f"Model classes: {model.names}")
        successful_model = (m_name, model)
        break
    except Exception as e:
        print(f"Failed '{m_name}': {e}")

if not successful_model:
    # Try huggingface hub download directly using huggingface_hub or torch
    try:
        from huggingface_hub import hf_hub_download
        print("\nAttempting huggingface_hub download for fire model...")
        path = hf_hub_download(repo_id="foduucom/fire-and-smoke-detection-yolov8", filename="model.pt")
        print(f"Downloaded model path: {path}")
        model = YOLO(path)
        print(f"SUCCESS! Classes: {model.names}")
        successful_model = ("foduucom/fire-and-smoke-detection-yolov8", model)
    except Exception as e:
        print(f"HF Download failed: {e}")

if not successful_model:
    try:
        from huggingface_hub import hf_hub_download
        print("\nAttempting huggingface_hub download for keremberke/yolov8n-fire-detection...")
        path = hf_hub_download(repo_id="keremberke/yolov8n-fire-detection", filename="best.pt")
        print(f"Downloaded model path: {path}")
        model = YOLO(path)
        print(f"SUCCESS! Classes: {model.names}")
        successful_model = ("keremberke/yolov8n-fire-detection", model)
    except Exception as e:
        print(f"HF Download keremberke failed: {e}")
