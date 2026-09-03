import os
from huggingface_hub import hf_hub_download
from ultralytics import YOLO

print("=== TESTING REAL FIRE & SMOKE YOLO MODEL DOWNLOAD ===")

test_repos = [
    ("rabahdev/fire-smoke-yolov8n", "best.pt", "fire_smoke_yolov8n.pt"),
    ("touati-kamel/yolov8s-forest-fire-detection", "best.pt", "forest_fire_yolov8s.pt")
]

successful_models = []

for repo_id, filename, save_name in test_repos:
    print(f"\nFetching {repo_id} -> {filename}...")
    try:
        downloaded = hf_hub_download(repo_id=repo_id, filename=filename)
        print(f"Downloaded to cache: {downloaded}")
        
        # Load with Ultralytics
        model = YOLO(downloaded)
        print(f"✓ SUCCESS! Loaded model '{repo_id}'")
        print(f"✓ Model Classes (model.names): {model.names}")
        
        # Save local copy in backend/models/
        models_dir = os.path.join(os.getcwd(), "models")
        os.makedirs(models_dir, exist_ok=True)
        local_path = os.path.join(models_dir, save_name)
        
        with open(downloaded, 'rb') as fin, open(local_path, 'wb') as fout:
            fout.write(fin.read())
        print(f"✓ Local copy saved to: {local_path} ({os.path.getsize(local_path)} bytes)")
        
        successful_models.append((repo_id, model.names, local_path))
    except Exception as e:
        print(f"Failed {repo_id}: {e}")

print("\n=== SUMMARY OF LOADED FIRE MODELS ===")
for repo, classes, path in successful_models:
    print(f"Repo: {repo}\nClasses: {classes}\nPath: {path}\n")
