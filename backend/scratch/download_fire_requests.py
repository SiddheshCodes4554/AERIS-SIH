import requests
import os
from ultralytics import YOLO

print("=== TESTING FIRE MODEL DOWNLOAD WITH REQUESTS & REDIRECTS ===")

urls_to_test = [
    # HuggingFace raw models (with follow redirects)
    ("https://huggingface.co/keremberke/yolov8n-fire-detection/resolve/main/best.pt", "fire_keremberke.pt"),
    ("https://huggingface.co/Subhrajit/fire-detection-yolov8/resolve/main/best.pt", "fire_subhrajit.pt"),
    ("https://huggingface.co/arnabdhar/YOLOv8-Fire-Detection/resolve/main/best.pt", "fire_arnabdhar.pt"),
    ("https://huggingface.co/foduucom/stock-market-fire-detection/resolve/main/model.pt", "fire_foduu.pt"),
    # GitHub release mirrors / raw models
    ("https://github.com/OlafenwaMoses/ImageAI/releases/download/3.0.3/fire-and-smoke-yolov8n.pt", "fire_smoke_olafenwa.pt")
]

successful = []

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

for url, filename in urls_to_test:
    target_path = os.path.join(os.getcwd(), "models", filename)
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    print(f"\nDownloading: {url} ...")
    try:
        r = requests.get(url, headers=headers, allow_redirects=True, timeout=30)
        print(f"HTTP Status: {r.status_code}, Length: {len(r.content)} bytes")
        if r.status_code == 200 and len(r.content) > 100000: # >100KB valid model
            with open(target_path, 'wb') as f:
                f.write(r.content)
            
            # Test loading with Ultralytics YOLO
            model = YOLO(target_path)
            print(f"✓ SUCCESS! Loaded model '{filename}'")
            print(f"✓ Classes: {model.names}")
            successful.append((filename, model.names, target_path))
            break
        else:
            print(f"Skipping {filename}: Invalid status or too small ({len(r.content)} bytes)")
    except Exception as e:
        print(f"Failed {filename}: {e}")

print("\n=== SUCCESSFUL FIRE MODELS ===")
for fn, classes, pth in successful:
    print(f"Model File: {fn}\nPath: {pth}\nClasses: {classes}")
