import urllib.request
import json

print("=== TESTING PX4 / GAZEBO LOCATION API ENDPOINT ===")

BASE = "http://localhost:8000"

# 1. Update simulator telemetry
sim_payload = {
    "latitude": 47.397958,
    "longitude": 8.546148,
    "altitude": 488.0,
    "speed": 12.4,
    "heading": 90.0
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
    print("1. Simulator update failed:", e)

# 2. Verify /api/location/current
try:
    with urllib.request.urlopen(f"{BASE}/api/location/current", timeout=3) as res:
        data = json.loads(res.read().decode())
        print("2. GET /api/location/current response:")
        print(json.dumps(data, indent=2))
        loc = data.get("location", {})
        assert loc.get("latitude") == 47.397958, "Latitude mismatch!"
        assert loc.get("longitude") == 8.546148, "Longitude mismatch!"
        assert loc.get("source") == "PX4_SIMULATOR", "Source mismatch!"
        print("\n>>> VERIFICATION SUCCESSFUL: PX4_SIMULATOR coordinates verified!")
except Exception as e:
    print("2. Verification failed:", e)
