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

# Lifecycle context manager for graceful startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Set the asyncio event loop for threadsafe WebSocket broadcasting
    manager.loop = asyncio.get_running_loop()
    
    # Register callbacks from detection_service to WebSocket manager
    detection_service.event_callback = lambda event: manager.broadcast_sync({
        "type": "detection",
        "data": event
    })
    detection_service.update_callback = lambda update: manager.broadcast_sync({
        "type": "detections_update",
        "data": update
    })
    
    yield
    # Shutdown: clean release of threads and models
    detection_service.shutdown()
    camera_service.shutdown()

app = FastAPI(
    title="AERIS Command Center Backend",
    description="Real-Time Telemetry, Live Video Stream & YOLO Object Detection API for AERIS-01 UAV",
    version="1.1.0",
    lifespan=lifespan
)

# Configure CORS
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CameraSelectRequest(BaseModel):
    camera_index: int


# ==========================================
# HEALTH & STATUS ENDPOINTS
# ==========================================

@app.get("/api/health")
async def health_check():
    """Health check endpoint for backend readiness verification."""
    return {
        "status": "healthy",
        "service": "aeris-backend",
        "ai_engine": "ultralytics-yolo"
    }


@app.get("/api/ai/status")
async def ai_status():
    """Returns real-time YOLO AI model performance metrics and inference FPS."""
    return detection_service.get_status()


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


# ==========================================
# VIDEO STREAM ENDPOINTS
# ==========================================

@app.get("/api/video/feed")
async def video_feed():
    """Streams clean, unannotated live MJPEG frames from the hardware webcam."""
    return StreamingResponse(
        camera_service.generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/api/video/detection-feed")
async def video_detection_feed():
    """Streams live MJPEG frames with real-time YOLO object detection bounding boxes."""
    return StreamingResponse(
        detection_service.generate_annotated_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
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
    """Unified WebSocket streaming detection events and live AI updates."""
    await manager.connect(websocket)
    try:
        # Send initial state immediately upon connection
        await websocket.send_text(json.dumps({
            "type": "init",
            "ai_status": detection_service.get_status(),
            "latest_detections": detection_service.get_latest_detections()
        }))
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
