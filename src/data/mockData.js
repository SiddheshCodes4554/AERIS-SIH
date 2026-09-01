export const INITIAL_MISSION_DATA = {
  missionId: "AERIS-MSN-2026-09A",
  missionName: "OPERATION PHOENIX SHIELD",
  sector: "SECTOR-04 (NORTH FLOOD BASIN)",
  startTime: "09:14:22 UTC",
  status: "ACTIVE SEARCH",
  statusType: "ACTIVE", // ACTIVE | LOITERING | RETURNING | EMERGENCY
  progress: 68,
  coverageAreaKm2: 4.85,
  checkpoints: {
    total: 16,
    completed: 11,
    current: 12,
    currentLabel: "CP-12 (SUBMERGED BRIDGE)"
  },
  geofenceStatus: "CONTAINED",
  estimatedFlightTimeRemaining: "24m 15s"
};

export const INITIAL_DRONE_TELEMETRY = {
  droneId: "UAV-AERIS-01",
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
    lat: 19.0760,
    lng: 72.8777,
    altitudeAgl: 45.2, // meters Above Ground Level
    altitudeMsl: 112.8, // meters Mean Sea Level
    groundSpeed: 12.8, // m/s (46.1 km/h)
    verticalSpeed: 0.1, // m/s
    heading: 142 // degrees
  },
  attitude: {
    pitch: -2.4,
    roll: 1.1,
    yaw: 142.0
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

export const INITIAL_DETECTIONS = [
  {
    id: "DET-8091",
    timestamp: "09:42:15",
    type: "SURVIVOR",
    label: "Stranded Person on Rooftop",
    confidence: 94.8,
    priority: "CRITICAL",
    lat: 19.0785,
    lng: 72.8802,
    details: "Individual waving from partially submerged rooftop. Thermal signature stable (36.8°C).",
    requiresAction: true,
    actionLabel: "Dispatch Rescue Team"
  },
  {
    id: "DET-8090",
    timestamp: "09:38:02",
    type: "HAZARD",
    label: "Submerged High-Voltage Cable",
    confidence: 89.2,
    priority: "CRITICAL",
    lat: 19.0742,
    lng: 72.8745,
    details: "High-voltage grid cable submerged in Sector 4B drainage. Active electrical arc risk.",
    requiresAction: true,
    actionLabel: "Broadcast Hazard Alert"
  },
  {
    id: "DET-8089",
    timestamp: "09:31:40",
    type: "SURVIVOR",
    label: "Group (3 Persons) on High Ground",
    confidence: 91.5,
    priority: "HIGH",
    lat: 19.0810,
    lng: 72.8835,
    details: "3 subjects sheltered under concrete overhang. Floodwater level stationary.",
    requiresAction: false,
    actionLabel: "Monitor Coordinates"
  },
  {
    id: "DET-8087",
    timestamp: "09:27:10",
    type: "HAZARD",
    label: "Structural Collapse / Debris Dam",
    confidence: 87.4,
    priority: "MODERATE",
    lat: 19.0768,
    lng: 72.8860,
    details: "Debris accumulation restricting waterway flow by 65%.",
    requiresAction: false,
    actionLabel: "Notify Engineering Unit"
  },
  {
    id: "DET-8088",
    timestamp: "09:24:19",
    type: "SAFE_ZONE",
    label: "Emergency Landing / Evacuation Point",
    confidence: 98.1,
    priority: "SAFE",
    lat: 19.0715,
    lng: 72.8710,
    details: "Elevated paved dry ground clear of obstructions (40m x 40m).",
    requiresAction: false,
    actionLabel: "Designate Primary LZ"
  }
];

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

export const INITIAL_MAP_WAYPOINTS = [
  { id: 1, lat: 19.0710, lng: 72.8710, label: "BASE / LZ-01", type: "BASE" },
  { id: 2, lat: 19.0730, lng: 72.8735, label: "CP-01", type: "CHECKPOINT" },
  { id: 3, lat: 19.0755, lng: 72.8750, label: "CP-02", type: "CHECKPOINT" },
  { id: 4, lat: 19.0785, lng: 72.8802, label: "CP-03 (Target Delta)", type: "TARGET" },
  { id: 5, lat: 19.0810, lng: 72.8835, label: "CP-04 (High Ground)", type: "CHECKPOINT" },
  { id: 6, lat: 19.0790, lng: 72.8870, label: "CP-05", type: "CHECKPOINT" },
];

export const GEOFENCE_POLYGON = [
  [19.0680, 72.8650],
  [19.0850, 72.8680],
  [19.0880, 72.8920],
  [19.0720, 72.8950],
  [19.0660, 72.8780]
];
