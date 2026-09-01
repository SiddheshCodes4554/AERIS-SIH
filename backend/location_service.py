import os
import math
import time
import logging
import threading
from datetime import datetime
from collections import deque
from typing import Optional, Dict, Any, List

logger = logging.getLogger("aeris.location")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

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
        
        # Current Location State
        self.current_location: Optional[Dict[str, Any]] = None
        self.status: str = "initializing"  # "active" | "permission_denied" | "unavailable" | "timeout" | "not_supported" | "initializing"
        self.source: str = "browser_geolocation"
        self.last_update: Optional[str] = None
        
        # Path History (In-Memory Ring Buffer with max 1000 points)
        self.path_history = deque(maxlen=1000)
        self._last_recorded_point = None
        self._last_recorded_time = 0.0
        
        # Filtering Configuration
        self.min_distance_meters = float(os.getenv("LOCATION_MIN_DISTANCE", "3.0"))  # 3 meters min change
        self.min_time_seconds = float(os.getenv("LOCATION_MIN_TIME", "5.0"))        # 5 seconds min time
        
        # Broadcast Callback (WebSocket)
        self.broadcast_callback = None
        
        self._initialized = True
        logger.info("AERIS LocationService initialized (Device Location Engine).")

    def validate_coordinates(self, lat: Any, lng: Any, accuracy: Any = None) -> bool:
        """Validates incoming latitude, longitude, and accuracy."""
        try:
            lat_f = float(lat)
            lng_f = float(lng)
            if not (-90.0 <= lat_f <= 90.0):
                return False
            if not (-180.0 <= lng_f <= 180.0):
                return False
            if accuracy is not None:
                acc_f = float(accuracy)
                if acc_f < 0.0:
                    return False
            return True
        except (ValueError, TypeError):
            return False

    def update_location(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Validates and updates real device location, records path, and broadcasts."""
        lat = payload.get("latitude")
        lng = payload.get("longitude")
        acc = payload.get("accuracy")

        if not self.validate_coordinates(lat, lng, acc):
            raise ValueError(f"Invalid GPS coordinates: lat={lat}, lng={lng}, accuracy={acc}")

        now_iso = payload.get("timestamp") or (datetime.utcnow().isoformat() + "Z")
        now_ts = time.time()
        
        lat_f = float(lat)
        lng_f = float(lng)
        acc_f = float(acc) if acc is not None else None
        
        loc_data = {
            "latitude": lat_f,
            "longitude": lng_f,
            "accuracy": acc_f,
            "altitude": float(payload["altitude"]) if payload.get("altitude") is not None else None,
            "altitudeAccuracy": float(payload["altitudeAccuracy"]) if payload.get("altitudeAccuracy") is not None else None,
            "heading": float(payload["heading"]) if payload.get("heading") is not None else None,
            "speed": float(payload["speed"]) if payload.get("speed") is not None else None,
            "timestamp": now_iso,
            "source": payload.get("source", "browser_geolocation")
        }

        with self.lock:
            self.current_location = loc_data
            self.status = "active"
            self.source = loc_data["source"]
            self.last_update = now_iso
            
            # Path Filtering: Record only if moved >= min_distance OR elapsed >= min_time
            should_record = False
            if self._last_recorded_point is None:
                should_record = True
            else:
                dist = haversine_distance_meters(
                    self._last_recorded_point["latitude"],
                    self._last_recorded_point["longitude"],
                    lat_f,
                    lng_f
                )
                time_elapsed = now_ts - self._last_recorded_time
                if dist >= self.min_distance_meters or time_elapsed >= self.min_time_seconds:
                    should_record = True

            if should_record:
                path_point = {
                    "latitude": lat_f,
                    "longitude": lng_f,
                    "accuracy": acc_f,
                    "timestamp": now_iso
                }
                self.path_history.append(path_point)
                self._last_recorded_point = path_point
                self._last_recorded_time = now_ts

        logger.info(f"Device Location Updated: [{lat_f:.6f}, {lng_f:.6f}] ±{acc_f or 0:.1f}m ({loc_data['source']})")

        # Broadcast update over WebSocket
        if self.broadcast_callback:
            self.broadcast_callback({
                "type": "location",
                "data": loc_data
            })

        return loc_data

    def set_status(self, status: str, source: str = "browser_geolocation", reason: str = None):
        """Sets location availability / permission status."""
        with self.lock:
            self.status = status
            self.source = source
            if status != "active":
                self.current_location = None

        logger.warning(f"Location status updated: {status} ({reason or 'N/A'})")

        if self.broadcast_callback:
            self.broadcast_callback({
                "type": "location_status",
                "data": {
                    "status": self.status,
                    "source": self.source,
                    "reason": reason,
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            })

    def get_current_location(self) -> Dict[str, Any]:
        """Returns the current real device location or unavailable payload."""
        with self.lock:
            if self.current_location and self.status == "active":
                return {
                    "status": "active",
                    "location": self.current_location
                }
            return {
                "status": self.status if self.status != "active" else "unavailable",
                "reason": "Location not received" if self.status == "initializing" else f"Location state: {self.status}"
            }

    def get_status(self) -> Dict[str, Any]:
        """Returns the current location operational and permission status."""
        with self.lock:
            acc = self.current_location["accuracy"] if self.current_location else None
            return {
                "status": self.status,
                "permission": "granted" if self.status == "active" else ("denied" if self.status == "permission_denied" else "prompt"),
                "source": self.source,
                "last_update": self.last_update,
                "accuracy": acc,
                "has_fix": (self.current_location is not None)
            }

    def get_path(self) -> Dict[str, Any]:
        """Returns the chronological recorded breadcrumb path."""
        with self.lock:
            return {
                "total_points": len(self.path_history),
                "path": list(self.path_history)
            }


# Shared singleton instance
location_service = LocationService()
