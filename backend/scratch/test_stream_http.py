import requests

print("Testing /api/camera/status:")
r_stat = requests.get("http://localhost:8000/api/camera/status")
print(r_stat.json())

print("\nTesting /api/ai/status:")
r_ai = requests.get("http://localhost:8000/api/ai/status")
print(r_ai.json())

print("\nTesting first frame of /api/video/detection-feed:")
r = requests.get("http://localhost:8000/api/video/detection-feed", stream=True, timeout=5)
bytes_read = b""
for chunk in r.iter_content(chunk_size=1024):
    bytes_read += chunk
    if len(bytes_read) > 50000:
        break
print(f"Read {len(bytes_read)} bytes from detection-feed stream!")
print(f"Header preview: {bytes_read[:100]}")
