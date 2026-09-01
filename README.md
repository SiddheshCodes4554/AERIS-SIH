# AERIS COMMAND CENTER
> **Autonomous Emergency Response Intelligence System**

A dark tactical mission control interface designed for AI-powered autonomous disaster response drone operations.

---

## 🛰️ Dashboard Layout

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ AERIS COMMAND CENTER                 CONNECTION                    MISSION STATUS      │
├────────────────────────────┬───────────────────────────────────────────────────────────┤
│                            │                                                           │
│   MISSION STATUS           │                   LIVE MISSION MAP                        │
│   • Battery (78%)          │                   • Drone Position & Real-Time Heading    │
│   • GPS (RTK Fixed)        │                   • Planned Flight Path                   │
│   • Flight Mode            │                   • Checkpoints / Waypoints               │
│   • Altitude & Speed       │                   • AI Survivor & Hazard Markers          │
│   • Current Checkpoint     │                   • Tactical Geofence Perimeter           │
│                            │                                                           │
├────────────────────────────┼───────────────────────────────────────────────────────────┤
│                            │                                                           │
│   DETECTIONS               │                   CAMERA / AI FEED                        │
│   • Survivors              │                   • RGB Optical 4K Feed Placeholder       │
│   • Hazards                │                   • FLIR Radiometric Thermal IR           │
│   • Priority Triage        │                   • Real-Time AI Bounding Boxes & HUD     │
│                            │                                                           │
├────────────────────────────┴───────────────────────────────────────────────────────────┤
│ COMMS STATUS  |  CHECKPOINT TELEMETRY  |  BUFFERED DATA  |  AI INFERENCE ENGINE        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: React 18 & Vite
- **Styling**: Tailwind CSS with custom mission-control dark palette
- **Geospatial Mapping**: Leaflet.js & React-Leaflet with CartoDB Dark Matter tiles
- **Icons**: Lucide React
- **Architecture**: Clean, modular components ready for ROS 2 DDS & WebSocket telemetry integration

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Development
```bash
# 1. Clone the repository
git clone https://github.com/SiddheshCodes4554/AERIS-SIH.git
cd AERIS-SIH

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The command center dashboard will be available at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
