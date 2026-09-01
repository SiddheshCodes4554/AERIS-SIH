import urllib.request
import json
import time

print("=== TESTING REAL DEVICE LOCATION BACKEND APIS ===")

BASE = "http://localhost:8000"

# 1. Update location
loc_payload = {
    "latitude": 30.316524,
    "longitude": 78.032189,
    "accuracy": 18.5,
    "altitude": 640.2,
    "heading": 142.0,
    "speed": 1.2,
    "timestamp": "2026-09-01T10:45:00Z",
    "source": "browser_geolocation"
}

req = urllib.request.Request(
    f"{BASE}/api/location/update",
    data=json.dumps(loc_payload).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=3) as res:
        print("1. POST /api/location/update:", res.read().decode())
except Exception as e:
    print("1. Update failed:", e)

# 2. Get current location
try:
    with urllib.request.urlopen(f"{BASE}/api/location/current", timeout=3) as res:
        print("2. GET /api/location/current:", res.read().decode())
except Exception as e:
    print("2. Current failed:", e)

# 3. Get location status
try:
    with urllib.request.urlopen(f"{BASE}/api/location/status", timeout=3) as res:
        print("3. GET /api/location/status:", res.read().decode())
except Exception as e:
    print("3. Status failed:", e)

# 4. Get location path
try:
    with urllib.request.urlopen(f"{BASE}/api/location/path", timeout=3) as res:
        print("4. GET /api/location/path:", res.read().decode())
except Exception as e:
    print("4. Path failed:", e)

# 5. Get system status
try:
    with urllib.request.urlopen(f"{BASE}/api/system/status", timeout=3) as res:
        print("5. GET /api/system/status:", res.read().decode())
except Exception as e:
    print("5. System status failed:", e)
