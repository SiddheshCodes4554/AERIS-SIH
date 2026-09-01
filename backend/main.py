import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from camera_service import camera_service

load_dotenv()

# Lifecycle context manager for graceful startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: camera_service initializes and starts background thread
    yield
    # Shutdown: clean release of OpenCV VideoCapture
    camera_service.shutdown()

app = FastAPI(
    title="AERIS Command Center Backend",
    description="Real-Time Telemetry & Live Video Stream API for AERIS-01 Autonomous UAV",
    version="1.0.0",
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


@app.get("/api/health")
async def health_check():
    """Health check endpoint for backend readiness verification."""
    return {
        "status": "healthy",
        "service": "aeris-backend"
    }


@app.get("/api/camera/status")
async def camera_status():
    """Returns the availability and operational status of the physical camera/webcam."""
    return camera_service.get_status()


@app.get("/api/video/feed")
async def video_feed():
    """Streams live MJPEG frames from the hardware camera via multipart/x-mixed-replace."""
    return StreamingResponse(
        camera_service.generate_frames(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
