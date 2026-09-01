import urllib.request
import json
import time

print("=== TESTING SIMULATOR DRONE TELEMETRY INTEGRATION ===")

BASE = "http://localhost:8000"

# 1. Update simulator telemetry
sim_payload = {
    "latitude": 30.41852,
    "longitude": 79.32890,
    "altitude": 48.2,
    "speed": 9.4,
    "heading": 155.0
}

req = urllib.request.Request(
    f"{BASE}/api/telemetry/simulator",
    data=json.dumps(sim_payload).encode('utf-8'),
    headers={"Content-Type": "application/json"}
)

try:
    with urllib.request.urlopen(req, timeout=3) as res:
        print("1. POST /api/telemetry/simulator:", res.read().decode())
except Exception as e:
    print("1. Simulator telemetry update failed:", e)

# 2. Verify telemetry source
try:
    with urllib.request.urlopen(f"{BASE}/api/telemetry/current", timeout=3) as res:
        data = json.loads(res.read().decode())
        print(f"2. Current Telemetry: Lat={data.get('lat')}, Lng={data.get('lng')}, Source={data.get('source')}, Label={data.get('locationSource')}")
except Exception as e:
    print("2. Telemetry current failed:", e)

# 3. Test location endpoint returns simulator location
try:
    with urllib.request.urlopen(f"{BASE}/api/location/current", timeout=3) as res:
        print("3. Location Endpoint returns:", res.read().decode())
except Exception as e:
    print("3. Location current failed:", e)
