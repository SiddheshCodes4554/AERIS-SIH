// =========================================================================
// AERIS — AUTONOMOUS EDGE RESCUE & INTELLIGENCE SYSTEM
// Real-Time Disaster Response Operation Dataset
// Scenario: Flash Flood & Mountain Debris Reconnaissance (Chamoli, Uttarakhand)
// =========================================================================

export const MISSION_METADATA = {
  missionId: "AR-2026-042",
  missionName: "Flood Rescue Reconnaissance",
  location: "Chamoli Basin, Uttarakhand",
  disasterType: "Flash Flood & Landslide",
  startTime: "10:32:14 UTC",
  selectedDroneId: "AERIS-01",
  status: "ACTIVE",
  connectionState: "CONNECTED", // "CONNECTED" | "OFFLINE_BACKTRACK"
  aiState: "EDGE AI ACTIVE",
  systemTime: "10:36:57",
};

export const DRONE_TELEMETRY = {
  droneId: "AERIS-01",
  callsign: "RESCUE-LEAD",
  model: "AERIS VTOL-SAR v2",
  battery: {
    percentage: 85,
    voltage: 21.4,
    temperature: 32.2, // Celsius
    cellHealth: "OPTIMAL"
  },
  gps: {
    status: "ACTIVE",
    fixType: "RTK 3D FIX",
    satellitesLocked: 18,
    hdop: 0.8
  },
  flightMode: "AUTO",
  position: {
    lat: 30.5540,
    lng: 79.5605,
    altitudeAgl: 42.5, // meters AGL
    altitudeMsl: 1142.0, // meters MSL
    groundSpeed: 8.5, // m/s
    verticalSpeed: 0.2, // m/s
    heading: 132 // degrees
  },
  missionProgress: 65, // %
  checkpoints: {
    currentId: "CP-3",
    currentName: "Sector B-3 Overlook",
    nextId: "CP-4",
    nextName: "Upper Dam Outflow",
    nextDistanceKm: 1.2,
    total: 4,
    completed: 3,
    lastConnectedId: "CP-3"
  }
};

export const CHECKPOINTS_LIST = [
  {
    id: "CP-1",
    label: "CP-1",
    name: "Base Staging & Launch",
    lat: 30.5380,
    lng: 79.5420,
    altitudeMeters: 40,
    status: "COMPLETED",
    isLastConnected: false
  },
  {
    id: "CP-2",
    label: "CP-2",
    name: "Lower Gorge Ingress",
    lat: 30.5470,
    lng: 79.5510,
    altitudeMeters: 45,
    status: "COMPLETED",
    isLastConnected: false
  },
  {
    id: "CP-3",
    label: "CP-3",
    name: "Sector B-3 Overlook",
    lat: 30.5540,
    lng: 79.5605,
    altitudeMeters: 42.5,
    status: "COMPLETED",
    isLastConnected: true,
    commQuality: "92% (LAST KNOWN LINK)"
  },
  {
    id: "CP-4",
    label: "CP-4",
    name: "Upper Dam Outflow",
    lat: 30.5635,
    lng: 79.5710,
    altitudeMeters: 50,
    status: "PENDING",
    isLastConnected: false
  }
];

export const FLIGHT_ROUTES = {
  // Normal completed & planned forward mission path
  completedPath: [
    [30.5380, 79.5420], // CP-1
    [30.5425, 79.5465],
    [30.5470, 79.5510], // CP-2
    [30.5505, 79.5555],
    [30.5540, 79.5605], // CP-3 (Current Position)
  ],
  upcomingPath: [
    [30.5540, 79.5605], // Current Position
    [30.5585, 79.5655],
    [30.5635, 79.5710], // CP-4
  ],
  // Autonomous Backtrack Path (Used when signal is lost)
  backtrackPath: [
    [30.5540, 79.5605], // Current drone position
    [30.5505, 79.5555], // Retraced reverse trail
    [30.5470, 79.5510], // Last Known Connected CP-3 Checkpoint
  ]
};

export const SURVIVORS_DATA = [
  {
    id: "SURV-01",
    label: "STRANDED PERSON",
    sector: "Sector B-3",
    confidence: 96,
    priority: "CRITICAL",
    source: "RGB + THERMAL",
    time: "10:33:02",
    lat: 30.5555,
    lng: 79.5620,
    count: 1,
    details: "Individual waving from submerged school rooftop. Thermal signature 36.8°C verified.",
    actionRecommendation: "Deploy Rescue Floatation & Heli Extraction Marker"
  },
  {
    id: "SURV-02",
    label: "GROUP ON HIGH GROUND",
    sector: "Sector B-4",
    confidence: 91,
    priority: "HIGH",
    source: "THERMAL",
    time: "10:31:15",
    lat: 30.5590,
    lng: 79.5670,
    count: 3,
    details: "3 subjects clustered under rock overhang. Surrounding ground saturation 85%.",
    actionRecommendation: "Queue Relief Supply Drop via AERIS-02"
  },
  {
    id: "SURV-03",
    label: "PERSON ON VEHICLE",
    sector: "Sector A-2",
    confidence: 87,
    priority: "MEDIUM",
    source: "RGB",
    time: "10:28:40",
    lat: 30.5480,
    lng: 79.5520,
    count: 1,
    details: "Subject seated on cabin roof of stalled truck in 1.1m flood current.",
    actionRecommendation: "Notify SDRF Boat Team 4"
  }
];

export const HAZARDS_DATA = [
  {
    id: "HAZ-01",
    type: "FIRE",
    label: "TRANSFORMER FIRE",
    sector: "Sector C-2",
    confidence: 92,
    priority: "CRITICAL",
    source: "THERMAL",
    time: "10:33:48",
    lat: 30.5585,
    lng: 79.5540,
    details: "Active 385°C electrical sub-station arc fire with dense smoke plume.",
    radiusMeters: 45
  },
  {
    id: "HAZ-02",
    type: "FLOOD",
    label: "FLOOD SURGE VECTOR",
    sector: "Sector D-1",
    confidence: 88,
    priority: "MEDIUM",
    source: "RGB + THERMAL",
    time: "10:30:10",
    lat: 30.5510,
    lng: 79.5640,
    details: "Water surge speed 3.2 m/s expanding towards Sector B residential basin.",
    radiusMeters: 90
  },
  {
    id: "HAZ-03",
    type: "COLLAPSE",
    label: "COLLAPSED STRUCTURE",
    sector: "Sector B-1",
    confidence: 94,
    priority: "CRITICAL",
    source: "RGB",
    time: "10:27:18",
    lat: 30.5450,
    lng: 79.5470,
    details: "Bridge girder failure across primary road route. Debris blocking transit.",
    radiusMeters: 35
  }
];

// Unified AI Rescue Intelligence Detection List
export const RESCUE_INTELLIGENCE_ITEMS = [
  ...SURVIVORS_DATA.map(s => ({
    id: s.id,
    type: "SURVIVOR",
    title: s.label,
    sector: s.sector,
    confidence: s.confidence,
    priority: s.priority,
    source: s.source,
    time: s.time,
    details: s.details
  })),
  ...HAZARDS_DATA.map(h => ({
    id: h.id,
    type: "HAZARD",
    hazardType: h.type,
    title: h.label,
    sector: h.sector,
    confidence: h.confidence,
    priority: h.priority,
    source: h.source,
    time: h.time,
    details: h.details
  }))
];

// Real Semi-Transparent Disaster Risk Heatmap Layers
export const RISK_HEATMAP_ZONES = [
  {
    id: "HEAT-CRITICAL-01",
    level: "CRITICAL", // Red/Orange
    center: [30.5585, 79.5540], // Fire hotspot
    radius: 160,
    color: "#FF453A",
    fillOpacity: 0.35,
    label: "CRITICAL THERMAL & STRUCTURAL RISK"
  },
  {
    id: "HEAT-HIGH-01",
    level: "HIGH", // Orange/Amber
    center: [30.5555, 79.5620], // Survivor cluster / Flood inundation
    radius: 220,
    color: "#E2A24C",
    fillOpacity: 0.28,
    label: "HIGH INUNDATION & SURVIVOR PROBABILITY"
  },
  {
    id: "HEAT-MED-01",
    level: "MEDIUM", // Amber/Purple
    center: [30.5510, 79.5640], // Surge outflow
    radius: 280,
    color: "#9B7EDB",
    fillOpacity: 0.22,
    label: "MODERATE WATER SURGE VECTOR"
  },
  {
    id: "HEAT-LOW-01",
    level: "LOW", // Green
    center: [30.5380, 79.5420], // Base staging
    radius: 180,
    color: "#62C370",
    fillOpacity: 0.15,
    label: "LOW RISK SECURED STAGING ZONE"
  }
];

// Sensor Fusion Confidence Metrics
export const SENSOR_FUSION_DATA = {
  target: "STRANDED PERSON (Sector B-3)",
  rgbConfidence: 91,
  thermalConfidence: 94,
  fusedConfidence: 97,
  thermalTemp: "36.8°C",
  rgbResolution: "4K 60FPS",
  thermalResolution: "32x24 (MLX90640 Array)",
  sensorAlignment: "CO-CALIBRATED"
};

// Communication & Autonomous Backtracking Sequence State
export const COMMUNICATION_STATE = {
  normal: {
    status: "CONNECTED",
    statusText: "NORMAL",
    linkName: "Wi-Fi 5.8GHz Ground Link",
    linkStatus: "ACTIVE",
    lastConnectedCp: "CP-3",
    bufferedEventsCount: 0,
    signalStrengthPercent: 88,
    latencyMs: 38
  },
  offlineBacktrack: {
    status: "OFFLINE",
    statusText: "SIGNAL LOST",
    edgeAiStatus: "ACTIVE",
    localStorageStatus: "ACTIVE",
    bufferedEventsCount: 5,
    lastConnectedCp: "CP-3",
    backtrackingProgress: 72,
    sequence: [
      { id: "s1", label: "SIGNAL LOST", status: "DONE" },
      { id: "s2", label: "EDGE AI ACTIVE", status: "DONE" },
      { id: "s3", label: "DATA BUFFERING", status: "DONE" },
      { id: "s4", label: "BACKTRACKING", status: "ACTIVE" },
      { id: "s5", label: "RECONNECT", status: "PENDING" },
      { id: "s6", label: "SYNC DATA", status: "PENDING" },
      { id: "s7", label: "RESUME MISSION", status: "PENDING" }
    ]
  }
};

// Chronological Live Mission Events Timeline
export const INITIAL_MISSION_EVENTS = [
  { time: "10:36:25", label: "Data Synchronization Complete", color: "green", icon: "sync" },
  { time: "10:36:20", label: "Connection Restored (CP-3 RF Mesh Link)", color: "green", icon: "wifi" },
  { time: "10:35:30", label: "Backtracking Initiated towards CP-3", color: "amber", icon: "backtrack" },
  { time: "10:35:03", label: "Buffered Data: 5 Events Stored to Local NVMe", color: "blue", icon: "storage" },
  { time: "10:34:12", label: "Offline Edge AI Autonomous Mode Activated", color: "blue", icon: "ai" },
  { time: "10:34:11", label: "Signal Lost (Terrain Shadow Sector B-3)", color: "red", icon: "signal_lost" },
  { time: "10:33:48", label: "Fire Hazard Detected (Sector C-2)", color: "red", icon: "fire" },
  { time: "10:33:02", label: "Survivor Detected (Sector B-3 • 96% Conf)", color: "amber", icon: "survivor" },
  { time: "10:32:14", label: "Mission Started (Autonomous Ingress)", color: "green", icon: "start" },
];
