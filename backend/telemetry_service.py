import os
import time
import math
import threading
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("aeris.telemetry")
logging.basicConfig(level=logging.INFO)

DISASTER_ZONES_CONFIG = {
    "chamoli-flood": {
        "id": "chamoli-flood",
        "name": "Sector B-4: Chamoli Flood",
        "shortName": "Chamoli",
        "center_lat": 30.4158,
        "center_lng": 79.3245,
        "base_alt": 42.5,
        "base_speed": 8.6,
        "checkpoints": ["CP-01 (Launch LZ)", "CP-02 (Rishi Riverbank)", "CP-03 (Alaknanda Confluence)", "CP-04 (Gorge Entry)"],
        "last_connected_cp": "CP-02 (Rishi Riverbank)"
    },
    "rishikesh-landslide": {
        "id": "rishikesh-landslide",
        "name": "Sector A-2: Rishikesh Landslide",
        "shortName": "Rishikesh",
        "center_lat": 30.0869,
        "center_lng": 78.2676,
        "base_alt": 58.0,
        "base_speed": 7.4,
        "checkpoints": ["CP-01 (Laxman Jhula)", "CP-02 (Highway Debris)", "CP-03 (Valley Overlook)", "CP-04 (Ridge Path)"],
        "last_connected_cp": "CP-02 (Highway Debris)"
    },
    "kedarnath-avalanche": {
        "id": "kedarnath-avalanche",
        "name": "Sector C-1: Kedarnath Avalanche",
        "shortName": "Kedarnath",
        "center_lat": 30.7346,
        "center_lng": 79.0669,
        "base_alt": 75.0,
        "base_speed": 6.8,
        "checkpoints": ["CP-01 (Gaurikund Base)", "CP-02 (Glacial Moraine)", "CP-03 (Temple Plateau)", "CP-04 (North Ridge)"],
        "last_connected_cp": "CP-02 (Glacial Moraine)"
    }
}

class TelemetryService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(TelemetryService, cls).__new__(cls)
                cls._instance._initialized = False
            return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        self.active_zone_id = "chamoli-flood"
        self.zone_config = DISASTER_ZONES_CONFIG[self.active_zone_id]
        
        # Flight State
        self.drone_id = "AERIS-01"
        self.flight_mode = "AUTONOMOUS SEARCH"
        self.connection_state = "CONNECTED" # 'CONNECTED' | 'OFFLINE_MODE' | 'BACKTRACKING' | 'RECONNECTED'
        self.mission_status = "ACTIVE" # 'ACTIVE' | 'PAUSED' | 'RTL'
        
        # Dynamic telemetry
        self.battery = 84.0
        self.voltage = 22.2
        self.current_draw = 14.5
        self.temperature_c = 34.2
        self.orin_temp_c = 48.5
        self.altitude = self.zone_config["base_alt"]
        self.speed = self.zone_config["base_speed"]
        self.heading = 142.0
        self.pitch = 1.2
        self.roll = -0.8
        self.rssi_dbm = -64
        self.satellites = 18
        self.gps_fix = "RTK FIXED"
        
        # Coordinates & Progress
        self.lat = self.zone_config["center_lat"]
        self.lng = self.zone_config["center_lng"]
        self.mission_progress = 38
        self.current_checkpoint_idx = 1
        
        # Backtracking & Offline Buffer State
        self.buffered_events_count = 0
        self.signal_lost_timestamp = None
        self.backtracking_progress = 0
        
        # Threading
        self.is_running = False
        self.telemetry_lock = threading.Lock()
        self.thread = None
        self.broadcast_callback = None
        self._initialized = True
        
        self.start()

    def set_zone(self, zone_id: str):
        """Switches active disaster zone and centers flight path."""
        if zone_id in DISASTER_ZONES_CONFIG:
            with self.telemetry_lock:
                self.active_zone_id = zone_id
                self.zone_config = DISASTER_ZONES_CONFIG[zone_id]
                self.lat = self.zone_config["center_lat"]
                self.lng = self.zone_config["center_lng"]
                self.altitude = self.zone_config["base_alt"]
                self.speed = self.zone_config["base_speed"]
                self.mission_progress = 15
                self.current_checkpoint_idx = 0
            logger.info(f"Switched disaster operational zone to {zone_id}")
            return self.get_telemetry()
        return None

    def set_connection_mode(self, mode: str):
        """Sets failover mode: 'NORMAL', 'SIGNAL_LOSS', 'BACKTRACKING', 'RECONNECTED'."""
        with self.telemetry_lock:
            if mode == "SIGNAL_LOSS":
                self.connection_state = "OFFLINE_MODE"
                self.rssi_dbm = -105
                self.signal_lost_timestamp = time.time()
                self.buffered_events_count = 24
            elif mode == "BACKTRACKING":
                self.connection_state = "BACKTRACKING"
                self.flight_mode = "AUTONOMOUS BACKTRACKING"
                self.backtracking_progress = 45
            elif mode == "RECONNECTED":
                self.connection_state = "CONNECTED"
                self.flight_mode = "AUTONOMOUS SEARCH"
                self.rssi_dbm = -64
                self.buffered_events_count = 0
                self.signal_lost_timestamp = None
                self.backtracking_progress = 0
            else:
                self.connection_state = "CONNECTED"
                self.flight_mode = "AUTONOMOUS SEARCH"
                self.rssi_dbm = -64
                self.buffered_events_count = 0
                self.signal_lost_timestamp = None
                self.backtracking_progress = 0
        return self.get_telemetry()

    def execute_command(self, action: str):
        """Handles operator commands: PAUSE, RESUME, RTL, TAKEOFF, LAND."""
        with self.telemetry_lock:
            if action == "PAUSE_MISSION":
                self.mission_status = "PAUSED"
                self.speed = 0.0
                self.flight_mode = "LOITER / HOVER"
            elif action == "RESUME_MISSION":
                self.mission_status = "ACTIVE"
                self.speed = self.zone_config["base_speed"]
                self.flight_mode = "AUTONOMOUS SEARCH"
            elif action == "RETURN_TO_BASE":
                self.mission_status = "RTL"
                self.flight_mode = "RTL (RETURN TO LAUNCH)"
            elif action == "MARK_LOCATION":
                logger.info(f"Geo-marker dropped at {self.lat:.6f}, {self.lng:.6f}")
        return self.get_telemetry()

    def get_telemetry(self):
        """Returns structured full UAV telemetry payload."""
        with self.telemetry_lock:
            cps = self.zone_config["checkpoints"]
            cur_cp = cps[self.current_checkpoint_idx % len(cps)]
            next_cp = cps[(self.current_checkpoint_idx + 1) % len(cps)]
            
            signal_lost_str = "00:00"
            if self.signal_lost_timestamp:
                elapsed = int(time.time() - self.signal_lost_timestamp)
                mins, secs = divmod(elapsed, 60)
                signal_lost_str = f"{mins:02d}:{secs:02d} AGO"

            return {
                "droneId": self.drone_id,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "missionName": self.zone_config["name"],
                "activeZoneId": self.active_zone_id,
                "flightMode": self.flight_mode,
                "missionStatus": self.mission_status,
                "connectionState": self.connection_state,
                "isOffline": (self.connection_state in ["OFFLINE_MODE", "BACKTRACKING"]),
                "isBacktracking": (self.connection_state == "BACKTRACKING"),
                "battery": round(self.battery, 1),
                "voltage": round(self.voltage, 1),
                "currentDraw": round(self.current_draw, 1),
                "temperatureC": round(self.temperature_c, 1),
                "orinTempC": round(self.orin_temp_c, 1),
                "altitude": f"{round(self.altitude, 1)}m",
                "speed": f"{round(self.speed, 1)} m/s",
                "groundSpeedKmh": round(self.speed * 3.6, 1),
                "heading": round(self.heading, 1),
                "pitch": round(self.pitch, 1),
                "roll": round(self.roll, 1),
                "rssi": f"{self.rssi_dbm} dBm",
                "satellites": self.satellites,
                "gpsFix": self.gps_fix,
                "coordinates": f"{round(self.lat, 5)}° N, {round(self.lng, 5)}° E",
                "lat": self.lat,
                "lng": self.lng,
                "missionProgress": self.mission_progress,
                "checkpoint": cur_cp,
                "nextCheckpoint": next_cp,
                "lastConnectedCheckpoint": self.zone_config["last_connected_cp"],
                "bufferedEventsCount": self.buffered_events_count,
                "signalLostTime": signal_lost_str,
                "backtrackingProgress": self.backtracking_progress
            }

    def _telemetry_sim_loop(self):
        """High-frequency background simulation loop (10 Hz)."""
        logger.info("AERIS Telemetry simulation loop started.")
        step = 0
        
        while self.is_running:
            step += 1
            time.sleep(0.1) # 10 Hz
            
            with self.telemetry_lock:
                # 1. Subtle physical micro-fluctuations
                t = time.time()
                if self.mission_status == "ACTIVE":
                    self.altitude = self.zone_config["base_alt"] + 0.35 * math.sin(t * 0.8)
                    self.speed = self.zone_config["base_speed"] + 0.25 * math.cos(t * 0.6)
                    self.heading = (142.0 + 3.0 * math.sin(t * 0.3)) % 360
                    self.pitch = 1.2 + 0.4 * math.sin(t * 1.2)
                    self.roll = -0.8 + 0.5 * math.cos(t * 1.1)
                    
                    # Slowly advance drone along patrol route
                    self.lat += 0.000003 * math.cos(math.radians(self.heading))
                    self.lng += 0.000003 * math.sin(math.radians(self.heading))
                
                # 2. Slow battery drain
                self.battery = max(15.0, self.battery - 0.0005)
                self.voltage = 19.5 + (self.battery / 100.0) * 3.0
                
                # 3. Handle Backtracking progress advancement
                if self.connection_state == "BACKTRACKING":
                    self.backtracking_progress = min(100, self.backtracking_progress + 1)
                    if self.backtracking_progress >= 100:
                        self.connection_state = "CONNECTED"
                        self.flight_mode = "AUTONOMOUS SEARCH"
                        self.buffered_events_count = 0
                        self.signal_lost_timestamp = None
                
                # 4. Handle Offline buffer accumulation
                if self.connection_state == "OFFLINE_MODE" and step % 40 == 0:
                    self.buffered_events_count += 1

            # 5. Broadcast to WebSocket clients at 4 Hz (every 250ms)
            if step % 2 == 0 and self.broadcast_callback:
                self.broadcast_callback(self.get_telemetry())

    def start(self):
        """Starts the background telemetry simulation loop."""
        if not self.is_running:
            self.is_running = True
            self.thread = threading.Thread(target=self._telemetry_sim_loop, daemon=True)
            self.thread.start()

    def shutdown(self):
        """Stops telemetry loop."""
        self.is_running = False
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.0)


# Shared singleton instance
telemetry_service = TelemetryService()
