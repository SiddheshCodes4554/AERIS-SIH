// ==========================================
// AERIS DISASTER RESPONSE MISSION MOCK DATA
// ==========================================

export const INITIAL_MISSION_DATA = {
  missionId: "AERIS-MSN-2026-09A",
  missionName: "OPERATION PHOENIX RESCUE",
  sector: "SECTOR-04 (NORTH FLOOD BASIN)",
  startTime: "09:14:22 UTC",
  status: "ACTIVE SEARCH",
  statusType: "ACTIVE",
  progress: 65,
  coverageAreaKm2: 4.85,
  checkpoints: {
    total: 4,
    completed: 2,
    current: 3,
    currentLabel: "CP-3 (SECTOR 4C DAM OVERHANG)"
  },
  geofenceStatus: "CONTAINED",
  estimatedFlightTimeRemaining: "24m 15s"
};

// 1. Drone Position & Telemetry
export const INITIAL_DRONE_TELEMETRY = {
  droneId: "AERIS-01",
  callsign: "PHOENIX-ONE",
  model: "AERIS VTOL-SAR v2",
  connectionStatus: "CONNECTED",
  flightMode: "AUTONOMOUS SEARCH",
  battery: {
    percentage: 78,
    voltage: 24.6,
    current: 18.2,
    temperature: 32.4,
    cellHealth: "OPTIMAL"
  },
  position: {
    lat: 19.0765,
    lng: 72.8785,
    altitudeAgl: 42.5, // meters AGL
    altitudeMsl: 112.8, // meters MSL
    groundSpeed: 12.8, // m/s
    verticalSpeed: 0.1, // m/s
    heading: 135 // degrees (South-East)
  },
  attitude: {
    pitch: -2.4,
    roll: 1.1,
    yaw: 135.0
  },
  environment: {
    windSpeed: 4.2,
    windDirection: "NE",
    ambientTemp: 28.5,
    baroPressure: 1012.4
  },
  subsystems: {
    gpsFix: "RTK 3D FIXED",
    satellitesLocked: 18,
    imuStatus: "NOMINAL",
    lidarStatus: "NOMINAL",
    opticalFlow: "ACTIVE",
    obstacleAvoidance: "ENABLED"
  }
};

// 2. Mission Checkpoints (CP-1 to CP-4)
export const MOCK_CHECKPOINTS = [
  { 
    id: "CP-1", 
    label: "CP-1", 
    name: "Base Staging & Ingress", 
    lat: 19.0710, 
    lng: 72.8710, 
    altitudeMeters: 40, 
    status: "COMPLETED",
    order: 1 
  },
  { 
    id: "CP-2", 
    label: "CP-2", 
    name: "Submerged Bridge Grid", 
    lat: 19.0745, 
    lng: 72.8740, 
    altitudeMeters: 45, 
    status: "COMPLETED",
    order: 2 
  },
  { 
    id: "CP-3", 
    label: "CP-3", 
    name: "Residential Rooftops", 
    lat: 19.0785, 
    lng: 72.8805, 
    altitudeMeters: 42, 
    status: "IN_PROGRESS",
    order: 3 
  },
  { 
    id: "CP-4", 
    label: "CP-4", 
    name: "Evacuation Outflow Canal", 
    lat: 19.0825, 
    lng: 72.8850, 
    altitudeMeters: 50, 
    status: "PENDING",
    order: 4 
  },
];

// 3. Recorded Mission Flight Path
export const MOCK_FLIGHT_PATH = [
  [19.0710, 72.8710], // CP-1 Base
  [19.0725, 72.8722],
  [19.0745, 72.8740], // CP-2
  [19.0758, 72.8762],
  [19.0765, 72.8785], // Current Drone Position (AERIS-01)
  [19.0785, 72.8805], // CP-3
  [19.0805, 72.8828],
  [19.0825, 72.8850], // CP-4
];

// 4. Survivor Locations
export const MOCK_SURVIVORS = [
  {
    id: "SURV-01",
    label: "Stranded Person on Rooftop",
    lat: 19.0780,
    lng: 72.8802,
    confidence: 94.8,
    priority: "CRITICAL", // CRITICAL | HIGH | MODERATE
    count: 1,
    details: "Individual waving on flooded concrete rooftop. Thermal signature stable (36.8°C).",
    timestamp: "09:42:15 UTC",
    rescueStatus: "DISPATCHED"
  },
  {
    id: "SURV-02",
    label: "Group (3 Persons) on High Ground",
    lat: 19.0815,
    lng: 72.8838,
    confidence: 91.2,
    priority: "HIGH",
    count: 3,
    details: "Family clustered on elevated staircase under overhang. Floodwater rising slowly.",
    timestamp: "09:34:50 UTC",
    rescueStatus: "QUEUED"
  },
  {
    id: "SURV-03",
    label: "Single Subject on Vehicle",
    lat: 19.0735,
    lng: 72.8755,
    confidence: 88.5,
    priority: "MODERATE",
    count: 1,
    details: "Person sitting atop submerged SUV. Water flow velocity moderate.",
    timestamp: "09:28:10 UTC",
    rescueStatus: "STANDBY"
  }
];

// 5. Hazard Locations (Fire, Flood, Debris)
export const MOCK_HAZARDS = [
  {
    id: "HAZ-01",
    type: "FIRE",
    label: "Transformer / Gas Fire",
    lat: 19.0798,
    lng: 72.8765,
    severity: "CRITICAL",
    details: "Active transformer short-circuit fire emitting dense toxic smoke. IR thermal temp: 385°C.",
    radiusMeters: 45,
    timestamp: "09:39:20 UTC"
  },
  {
    id: "HAZ-02",
    type: "FLOOD",
    label: "Rapid Water Surge Basin",
    lat: 19.0750,
    lng: 72.8820,
    severity: "HIGH",
    details: "Flash flood surge zone with strong undercurrent. Water depth: 2.8m above baseline.",
    radiusMeters: 120,
    timestamp: "09:25:00 UTC",
    polygon: [
      [19.0735, 72.8800],
      [19.0765, 72.8810],
      [19.0770, 72.8845],
      [19.0740, 72.8840]
    ]
  },
  {
    id: "HAZ-03",
    type: "DEBRIS",
    label: "Structural Collapse / Blocked Route",
    lat: 19.0760,
    lng: 72.8730,
    severity: "MODERATE",
    details: "Collapsed bridge girder obstructing ground rescue vehicle access along Primary Evacuation Route A.",
    radiusMeters: 30,
    timestamp: "09:31:12 UTC"
  }
];

// 6. Tactical Geofence Boundary Polygon
export const GEOFENCE_POLYGON = [
  [19.0680, 72.8650],
  [19.0860, 72.8680],
  [19.0880, 72.8920],
  [19.0720, 72.8950],
  [19.0660, 72.8780]
];

// Unified detections list for DetectionPanel
export const INITIAL_DETECTIONS = [
  ...MOCK_SURVIVORS.map(s => ({
    id: s.id,
    timestamp: s.timestamp.substring(0, 8),
    type: "SURVIVOR",
    label: s.label,
    confidence: s.confidence,
    priority: s.priority,
    lat: s.lat,
    lng: s.lng,
    details: s.details,
    requiresAction: s.priority === "CRITICAL",
    actionLabel: "Mark for Extraction"
  })),
  ...MOCK_HAZARDS.map(h => ({
    id: h.id,
    timestamp: h.timestamp.substring(0, 8),
    type: "HAZARD",
    label: h.label,
    confidence: 92.0,
    priority: h.severity,
    lat: h.lat,
    lng: h.lng,
    details: h.details,
    requiresAction: h.severity === "CRITICAL",
    actionLabel: "Broadcast Hazard Alert"
  }))
];

// Communications Status
export const INITIAL_COMM_STATUS = {
  primaryLink: {
    name: "Ground Station RF Mesh (5.8 GHz)",
    status: "CONNECTED",
    signalStrength: 96,
    latencyMs: 14,
    dataRate: "48.2 Mbps"
  },
  satelliteLink: {
    name: "Iridium NEXT L-Band",
    status: "STANDBY",
    signalStrength: 82,
    latencyMs: 480,
    dataRate: "128 Kbps"
  },
  aiEdgeCompute: {
    name: "NVIDIA Jetson AGX Orin",
    status: "OPTIMAL",
    inferenceFps: 28.5,
    gpuLoad: 64,
    temperature: 46.2,
    model: "YOLOv10-Disaster-MultiModal v3.2",
    inferenceLatencyMs: 34
  },
  bufferedData: {
    totalBufferedMb: 142.8,
    unsyncedPackets: 0,
    storageHealth: "99.8% READY",
    syncRate: "12.4 MB/s"
  },
  ros2Bridge: {
    name: "ROS 2 Humble DDS Bridge",
    status: "ACTIVE",
    domainId: 42,
    topicsCount: 14,
    rateHz: 50.0
  }
};
