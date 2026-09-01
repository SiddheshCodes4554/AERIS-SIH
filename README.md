# AERIS — Autonomous Edge Rescue & Intelligence System
## Real-Time Autonomous Disaster Response Drone Command Center & Edge AI Backend

AERIS is an AI-powered autonomous disaster-response aerial emergency operations command center and Edge intelligence platform.

---

## System Architecture

```
Physical USB / Webcam
         ↓
  OpenCV (DirectShow)
         ↓
Python FastAPI Backend (port 8000)
         ↓
Live Video Stream API (multipart/x-mixed-replace)
         ↓
React / Vite Dashboard (port 3000)
```

---

## How to Run the Project

### 1. Backend (Python + FastAPI + OpenCV)

Open a terminal (PowerShell / Command Prompt):

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend Endpoints:
- **Health Check**: `GET http://localhost:8000/api/health`
- **Camera Status**: `GET http://localhost:8000/api/camera/status`
- **Live Video Stream**: `GET http://localhost:8000/api/video/feed`

---

### 2. Frontend (React + Vite + Tailwind CSS)

Open a second terminal in the project root (`d:\Projects\SIH`):

```powershell
# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at:
👉 **[http://localhost:3000/](http://localhost:3000/)**

---

## Key Capabilities

1. **Real Hardware Camera Feed**:
   - Streams live physical webcam video directly to the AERIS Live Camera Feed panel with 16:9 presentation, HUD telemetry, and mode filters (`RGB`, `THERMAL Ironbow`, `AI OVERLAY`).
2. **Graceful Failover**:
   - If no webcam is attached or the backend is offline, the camera panel displays a technical standby overlay with a one-click reconnect trigger without crashing the app.
3. **Autonomous Backtracking Simulation**:
   - Click `[ ▶ AUTO BACKTRACK DEMO ]` in the top header to watch real-time offline autonomy, signal loss detection, local data buffering, and reverse path navigation to the Last Connected Checkpoint.
4. **Active Disaster Zone Selection**:
   - Dynamic switching across Chamoli Gorge (Flood), Rishikesh Basin (Landslide), and Kedarnath Valley (Avalanche).
