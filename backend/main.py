import os
import json
import asyncio
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv

from camera_service import camera_service
from detection_service import detection_service
from telemetry_service import telemetry_service

load_dotenv()

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.loop = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

    def broadcast_sync(self, message: dict):
        if self.loop and self.loop.is_running() and self.active_connections:
            asyncio.run_coroutine_threadsafe(self.broadcast(message), self.loop)

manager = ConnectionManager()

# Lifecycle context manager for clean startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Set the asyncio event loop for threadsafe WebSocket broadcasting
    manager.loop = asyncio.get_running_loop()
    
    # Start worker loops
    camera_service.start()
    detection_service.start()
    telemetry_service.start()
    
    # Register callbacks from services to WebSocket manager
    detection_service.event_callback = lambda event: manager.broadcast_sync({
        "type": "detection",
        "data": event
    })
    detection_service.update_callback = lambda update: manager.broadcast_sync({
        "type": "detections_update",
        "data": update
    })
    telemetry_service.broadcast_callback = lambda telem: manager.broadcast_sync({
        "type": "telemetry",
        "data": telem
    })
    
    yield
    # Shutdown: clean release of threads, cameras, and models
    telemetry_service.shutdown()
    detection_service.shutdown()
    camera_service.shutdown()

app = FastAPI(
    title="AERIS Command Center Backend",
    description="Real-Time Telemetry, Live Video Stream & YOLO Object Detection API for AERIS-01 UAV",
    version="1.2.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Models
class CameraSelectRequest(BaseModel):
    camera_index: int

class AIConfigRequest(BaseModel):
    model_name: str = None
    confidence_threshold: float = None
    target_filter: str = None

class ZoneSelectRequest(BaseModel):
    zone_id: str

class ModeSelectRequest(BaseModel):
    mode: str

class MissionCommandRequest(BaseModel):
    action: str


# ==========================================
# HEALTH & STATUS ENDPOINTS
# ==========================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint for backend readiness verification."""
    return {
        "status": "healthy",
        "service": "aeris-backend",
        "ai_engine": "ultralytics-yolo",
        "telemetry_engine": "active"
    }


@app.get("/api/ai/status")
async def ai_status():
    """Returns real-time YOLO AI model performance metrics, available models, and inference FPS."""
    return detection_service.get_status()


@app.post("/api/ai/config")
async def set_ai_config(payload: AIConfigRequest):
    """Updates AI model (yolov8s, yolov8m, yolov8n), confidence threshold, or class filter."""
    result = detection_service.set_config(
        model_name=payload.model_name,
        confidence=payload.confidence_threshold,
        target_filter=payload.target_filter
    )
    return {"success": True, "status": result}


# ==========================================
# TELEMETRY & MISSION CONTROL ENDPOINTS
# ==========================================

@app.get("/api/telemetry/current")
async def get_current_telemetry():
    """Returns current real-time UAV flight telemetry and mission state."""
    return telemetry_service.get_telemetry()


@app.post("/api/telemetry/zone")
async def select_disaster_zone(payload: ZoneSelectRequest):
    """Switches active disaster search sector and aligns waypoints."""
    result = telemetry_service.set_zone(payload.zone_id)
    if not result:
        raise HTTPException(status_code=400, detail="Invalid disaster zone ID")
    return {"success": True, "telemetry": result}


@app.post("/api/telemetry/mode")
async def set_connection_mode(payload: ModeSelectRequest):
    """Sets failover mode: NORMAL, SIGNAL_LOSS, BACKTRACKING, RECONNECTED."""
    result = telemetry_service.set_connection_mode(payload.mode)
    return {"success": True, "telemetry": result}


@app.post("/api/mission/command")
async def execute_mission_command(payload: MissionCommandRequest):
    """Issues operator flight commands (PAUSE_MISSION, RESUME_MISSION, RETURN_TO_BASE, MARK_LOCATION)."""
    result = telemetry_service.execute_command(payload.action)
    return {"success": True, "action": payload.action, "telemetry": result}


# ==========================================
# CAMERA HARDWARE ENDPOINTS
# ==========================================

@app.get("/api/camera/status")
async def camera_status():
    """Returns the availability and operational status of the physical camera/webcam."""
    return camera_service.get_status()


@app.get("/api/camera/devices")
async def camera_devices():
    """Probes and returns list of accessible cameras/webcams connected to the system."""
    return {
        "devices": camera_service.list_available_cameras(),
        "active_index": camera_service.camera_index
    }


@app.post("/api/camera/select")
async def select_camera(payload: CameraSelectRequest):
    """Dynamically switches active camera index (0, 1, 2, etc.) without restarting server."""
    status = camera_service.select_camera(payload.camera_index)
    return {
        "success": True,
        "selected_index": payload.camera_index,
        "status": status
    }


@app.post("/api/camera/reconnect")
async def reconnect_camera():
    """Forces an immediate driver reset and reconnects the current active camera."""
    status = camera_service.force_reconnect()
    return {
        "success": True,
        "status": status
    }


# ==========================================
# VIDEO STREAM ENDPOINTS
# ==========================================

STREAM_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
    "Pragma": "no-cache",
    "Expires": "0",
    "Connection": "close",
    "Access-Control-Allow-Origin": "*"
}

@app.get("/api/video/feed")
async def video_feed():
    """Streams clean, unannotated live MJPEG frames from the hardware webcam."""
    return StreamingResponse(
        camera_service.generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers=STREAM_HEADERS
    )


@app.get("/api/video/detection-feed")
async def video_detection_feed():
    """Streams live MJPEG frames with real-time YOLO object detection bounding boxes."""
    return StreamingResponse(
        detection_service.generate_annotated_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers=STREAM_HEADERS
    )


# ==========================================
# YOLO DETECTION REST API
# ==========================================

@app.get("/api/detections/latest")
async def latest_detections():
    """Returns the latest genuine YOLO detection objects, coordinates, and confidence."""
    return detection_service.get_latest_detections()


@app.get("/api/detections/history")
async def detection_history():
    """Returns the debounced chronological history of confirmed detection events (max 100)."""
    return {
        "total_events": len(detection_service.event_history),
        "history": detection_service.get_event_history()
    }


# ==========================================
# REAL-TIME WEBSOCKET
# ==========================================

@app.websocket("/ws/live")
async def websocket_live_endpoint(websocket: WebSocket):
    """Unified WebSocket streaming telemetry, detection events, and live AI updates."""
    await manager.connect(websocket)
    try:
        # Send initial state immediately upon connection
        await websocket.send_text(json.dumps({
            "type": "init",
            "telemetry": telemetry_service.get_telemetry(),
            "ai_status": detection_service.get_status(),
            "latest_detections": detection_service.get_latest_detections()
        }))
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
