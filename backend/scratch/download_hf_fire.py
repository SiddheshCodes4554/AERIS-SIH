import os
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

print("=== TESTING HUGGINGFACE HUB FIRE MODEL DOWNLOAD ===")

repos_to_test = [
    ("foduucom/stock-market-fire-detection", "model.pt", "fire_foduu.pt"),
    ("keremberke/yolov8n-fire-detection", "best.pt", "fire_keremberke.pt"),
    ("Subhrajit/fire-detection-yolov8", "best.pt", "fire_subhrajit.pt"),
    ("arnabdhar/YOLOv8-Fire-Detection", "best.pt", "fire_arnabdhar.pt")
]

successful = []

for repo, filename, dest_name in repos_to_test:
    print(f"\nFetching {repo} -> {filename}...")
    try:
        downloaded_path = hf_hub_download(repo_id=repo, filename=filename)
        print(f"Downloaded to cache: {downloaded_path}")
        
        # Load with Ultralytics YOLO
        model = YOLO(downloaded_path)
        print(f"✓ SUCCESS! Loaded {repo}")
        print(f"✓ Model Classes (names): {model.names}")
        successful.append((repo, model.names, downloaded_path))
        
        # Copy to local models directory
        models_dir = os.path.join(os.getcwd(), "models")
        os.makedirs(models_dir, exist_ok=True)
        local_target = os.path.join(models_dir, dest_name)
        with open(downloaded_path, 'rb') as f_in, open(local_target, 'wb') as f_out:
            f_out.write(f_in.read())
        print(f"✓ Saved model copy to: {local_target}")
    except Exception as e:
        print(f"Failed {repo}: {e}")

print("\n=== SUMMARY OF LOADED FIRE MODELS ===")
for r, cls_names, pth in successful:
    print(f"\nRepo: {r}\nClasses: {cls_names}\nPath: {pth}")
