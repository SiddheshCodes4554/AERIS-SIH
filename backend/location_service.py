import os
import math
import time
import logging
import threading
from datetime import datetime
from collections import deque
from typing import Optional, Dict, Any, List

logger = logging.getLogger("aeris.location")
logging.basicConfig(level=logging.INFO)

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in meters."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class LocationService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(LocationService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.lock = threading.Lock()
        
        # Authoritative Location Source: SIMULATOR_DRONE
        self.source: str = "SIMULATOR_DRONE"
        self.source_label: str = "SIMULATOR TELEMETRY"
        self.status: str = "active"
        self.last_update: Optional[str] = None
        
        # Flight Path History (In-Memory Ring Buffer with max 1000 points)
        self.path_history = deque(maxlen=1000)
        self._last_recorded_point = None
        self._last_recorded_time = 0.0
        
        # Filtering Configuration
        self.min_distance_meters = float(os.getenv("LOCATION_MIN_DISTANCE", "1.5"))
        self.min_time_seconds = float(os.getenv("LOCATION_MIN_TIME", "2.0"))
        
        self.broadcast_callback = None
        self._initialized = True
        logger.info("AERIS LocationService initialized (Authoritative Source: SIMULATOR_DRONE).")

    def get_current_location(self) -> Dict[str, Any]:
        """Returns the authoritative simulated drone position from TelemetryService."""
        from telemetry_service import telemetry_service
        telem = telemetry_service.get_telemetry()
        
        lat = telem.get("lat", 30.4158)
        lng = telem.get("lng", 79.3245)
        alt = telem.get("altitudeM", 42.5)
        spd = telem.get("speedMs", 8.6)
        hdg = telem.get("heading", 142.0)
        now_iso = datetime.utcnow().isoformat() + "Z"

        loc_data = {
            "latitude": lat,
            "longitude": lng,
            "altitude": alt,
            "speed": spd,
            "heading": hdg,
            "accuracy": None, # Exact simulator coordinates
            "timestamp": now_iso,
            "source": self.source,
            "locationSource": self.source_label
        }

        # Update recorded flight path
        now_ts = time.time()
        with self.lock:
            should_record = False
            if self._last_recorded_point is None:
                should_record = True
            else:
                dist = haversine_distance_meters(
                    self._last_recorded_point["latitude"],
                    self._last_recorded_point["longitude"],
                    lat,
                    lng
                )
                time_elapsed = now_ts - self._last_recorded_time
                if dist >= self.min_distance_meters or time_elapsed >= self.min_time_seconds:
                    should_record = True

            if should_record:
                path_point = {
                    "latitude": lat,
                    "longitude": lng,
                    "altitude": alt,
                    "timestamp": now_iso
                }
                self.path_history.append(path_point)
                self._last_recorded_point = path_point
                self._last_recorded_time = now_ts
                self.last_update = now_iso

        return {
            "status": "active",
            "location": loc_data
        }

    def update_location(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Receives external hardware GPS or simulator updates with priority check."""
        src = payload.get("source", "")
        # Reject browser geolocation updates as SIMULATOR_DRONE is authoritative
        if src in ["browser_geolocation", "device_location"]:
            logger.debug("Ignored browser geolocation update: SIMULATOR_DRONE is active source.")
            return self.get_current_location()

        lat = payload.get("latitude")
        lng = payload.get("longitude")
        alt = payload.get("altitude")
        spd = payload.get("speed")
        hdg = payload.get("heading")

        from telemetry_service import telemetry_service
        telemetry_service.update_simulator_telemetry(lat, lng, alt, spd, hdg)
        return self.get_current_location()

    def set_status(self, status: str, source: str = "SIMULATOR_DRONE", reason: str = None):
        """Sets status if needed."""
        with self.lock:
            self.status = status
            self.source = source

    def get_status(self) -> Dict[str, Any]:
        """Returns location operational status."""
        return {
            "status": "active",
            "source": self.source,
            "locationSource": self.source_label,
            "last_update": self.last_update or datetime.utcnow().isoformat() + "Z",
            "has_fix": True
        }

    def get_path(self) -> Dict[str, Any]:
        """Returns the recorded flight path history from the simulated drone."""
        with self.lock:
            return {
                "total_points": len(self.path_history),
                "path": list(self.path_history)
            }


# Shared singleton instance
location_service = LocationService()
