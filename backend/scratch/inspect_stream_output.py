import urllib.request
import json
import time

print("1. Checking /api/camera/status:")
try:
    with urllib.request.urlopen("http://localhost:8000/api/camera/status", timeout=2) as r:
        print("  Status:", r.read().decode())
except Exception as e:
    print("  Status error:", e)

print("\n2. Checking /api/ai/status:")
try:
    with urllib.request.urlopen("http://localhost:8000/api/ai/status", timeout=2) as r:
        print("  AI Status:", r.read().decode())
except Exception as e:
    print("  AI Status error:", e)

print("\n3. Testing MJPEG stream /api/video/detection-feed:")
try:
    req = urllib.request.Request("http://localhost:8000/api/video/detection-feed")
    with urllib.request.urlopen(req, timeout=4) as response:
        chunk = response.read(150000)
        print(f"  Received {len(chunk)} bytes from detection-feed stream!")
        print(f"  First 200 bytes:\n{chunk[:200]}")
        
        # Extract first JPEG frame and save it
        start = chunk.find(b'\xff\xd8')
        end = chunk.find(b'\xff\xd9', start)
        if start != -1 and end != -1:
            jpg = chunk[start:end+2]
            with open("saved_stream_frame.jpg", "wb") as f:
                f.write(jpg)
            print(f"  SUCCESSFULLY EXTRACTED JPEG FRAME! Size: {len(jpg)} bytes. Saved to saved_stream_frame.jpg")
        else:
            print("  Warning: could not find full JPEG markers in chunk")
except Exception as e:
    print("  Stream error:", e)
