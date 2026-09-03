import urllib.request
import json
import os
from ultralytics import YOLO

print("=== TESTING DIRECT URL DOWNLOADS FOR REAL TRAINED YOLO FIRE MODELS ===")

# Test URLs of real trained YOLO fire detection model weights from HuggingFace
urls_to_test = [
    ("https://huggingface.co/foduucom/stock-market-fire-detection/resolve/main/model.pt", "fire_stock_market.pt"),
    ("https://huggingface.co/Subhrajit/fire-detection-yolov8/resolve/main/best.pt", "fire_subhrajit.pt"),
    ("https://huggingface.co/keremberke/yolov8n-fire-detection/resolve/main/best.pt", "fire_keremberke.pt"),
    ("https://huggingface.co/arnabdhar/YOLOv8-Fire-Detection/resolve/main/best.pt", "fire_arnabdhar.pt"),
    ("https://huggingface.co/mharis/yolov8s-fire/resolve/main/best.pt", "fire_mharis.pt")
]

successful = []

for url, filename in urls_to_test:
    target_path = os.path.join(os.getcwd(), "models", filename)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    print(f"\nTesting download from: {url} -> {filename}...")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response, open(target_path, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"Downloaded {len(data)} bytes.")
        
        # Test loading with Ultralytics YOLO
        model = YOLO(target_path)
        print(f"SUCCESS! Loaded model '{filename}' with classes: {model.names}")
        successful.append((filename, model.names, target_path))
        break # Found working model!
    except Exception as e:
        print(f"Failed {filename}: {e}")
        if os.path.exists(target_path):
            os.remove(target_path)

print("\n=== SUMMARY OF WORKING FIRE MODELS ===")
for fn, classes, pth in successful:
    print(f"File: {fn} | Path: {pth} | Classes: {classes}")
