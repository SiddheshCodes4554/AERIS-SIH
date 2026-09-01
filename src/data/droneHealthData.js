// =========================================================================
// AERIS-01 SINGLE DRONE SYSTEM HEALTH & TELEMETRY DATASET
// Autonomous Edge Rescue & Intelligence System (AERIS-01)
// =========================================================================

export const AERIS01_HEALTH_DATA = {
  droneId: "AERIS-01",
  callsign: "AERIS SENTINEL-01",
  systemStatus: "NOMINAL", // "NOMINAL" | "WARNING" | "OFFLINE" | "BACKTRACKING"
  missionName: "Flood Rescue Reconnaissance",
  missionStatus: "ACTIVE",
  flightMode: "AUTONOMOUS",
  missionProgress: 68, // %

  // Battery & Power System
  battery: {
    percentage: 85,
    voltage: 21.4, // V (6S LiPo)
    temperature: 32, // °C
    estimatedFlightTimeMin: 18,
    status: "NORMAL",
    powerConsumptionWatts: 245,
    remainingEnergyPercent: 85,
  },

  // GPS & Navigation
  navigation: {
    gpsStatus: "ACTIVE",
    fixType: "RTK FIXED",
    satellites: 14,
    accuracyMeters: 0.3,
    latitude: 30.3165,
    longitude: 78.0322,
    coordinatesFormatted: "30.3165° N, 78.0322° E",
  },

  // Flight Stabilization (IMU)
  imu: {
    status: "ACTIVE",
    flightController: "NORMAL",
    orientation: "STABLE",
    headingDegrees: 42,
    headingCardinal: "NE 42°",
    pitch: -2.1,
    roll: 1.4,
    yaw: 42.0,
  },

  // Flight Telemetry
  flightTelemetry: {
    altitudeAgl: 42.5, // m
    groundSpeed: 8.5, // m/s
    verticalSpeed: 0.2, // m/s
    heading: "042°",
    distanceTravelledKm: 2.8,
    missionTimeFormatted: "18m 42s",
  },

  // Communication Link
  communication: {
    connectionState: "CONNECTED", // "CONNECTED" | "OFFLINE_MODE" | "BACKTRACKING"
    groundLink: "ACTIVE",
    signalStrengthPercent: 88,
    latencyMs: 42,
    lastSync: "2 sec ago",
    lastConnectedCheckpoint: "CP-03",
    bufferedEvents: 0,
    signalLostTime: "02:14 AGO",
    backtrackProgress: 72,
  },

  // Edge AI Intelligence
  edgeAi: {
    status: "ACTIVE",
    model: "AERIS Vision AI (YOLOv8s)",
    inferenceMode: "LOCAL (Jetson Orin Nano)",
    inferenceSpeedFps: 28,
    objectsProcessed: 1248,
    survivorsDetected: 3,
    hazardsDetected: 2,
    averageConfidence: 94,
    currentTask: "ANALYZING DISASTER AREA",
  },

  // Sensors Roster
  sensors: [
    { id: "rgb", name: "RGB CAMERA", status: "LIVE", spec: "1920 × 1080 @ 30 FPS", active: true },
    { id: "thermal", name: "THERMAL SENSOR", status: "ACTIVE", spec: "-20°C — 300°C (MLX90640)", active: true },
    { id: "gps", name: "GPS (RTK 3D)", status: "ACTIVE", spec: "14 Sats • ±0.3m Fix", active: true },
    { id: "imu", name: "IMU & GYRO", status: "ACTIVE", spec: "Dual 6-Axis Stabilized", active: true },
    { id: "barometer", name: "BAROMETER", status: "ACTIVE", spec: "Precision MS5611", active: true },
    { id: "ai", name: "EDGE AI ENGINE", status: "PROCESSING", spec: "28 FPS Local TensorRT", active: true },
    { id: "buffer", name: "LOCAL DATA BUFFER", status: "READY", spec: "0 Events Stored", active: true },
  ],

  // Checkpoint Waypoints
  checkpoints: [
    { id: "CP-01", label: "CP-01", name: "Valley Ingress", lat: 30.3120, lng: 78.0260, status: "COMPLETED", isDone: true },
    { id: "CP-02", label: "CP-02", name: "Bridge Approach", lat: 30.3145, lng: 78.0295, status: "COMPLETED", isDone: true },
    { id: "CP-03", label: "CP-03", name: "Ridge Overlook", lat: 30.3165, lng: 78.0322, status: "COMPLETED", isDone: true, isLastConnected: true },
    { id: "CP-04", label: "CP-04", name: "Flooded Sector B-4", lat: 30.3190, lng: 78.0360, status: "IN_PROGRESS", isDone: false },
  ],

  // Flight Route Coordinates
  flightPaths: {
    completed: [
      [30.3100, 78.0230], // Base LZ
      [30.3120, 78.0260], // CP-01
      [30.3145, 78.0295], // CP-02
      [30.3165, 78.0322], // CP-03 (AERIS-01 Current Position)
    ],
    upcoming: [
      [30.3165, 78.0322],
      [30.3190, 78.0360], // CP-04
      [30.3220, 78.0400], // Target Search Zone
    ],
    backtrack: [
      [30.3165, 78.0322],
      [30.3145, 78.0295],
      [30.3120, 78.0260],
    ]
  },

  // Chronological System Events Timeline
  systemEvents: [
    { time: "10:42:14", category: "MISSION UPDATE", text: "Checkpoint CP-03 reached • Altitude 42.5m AGL", color: "green" },
    { time: "10:41:22", category: "AI DETECTION", text: "Survivor detected • Confidence: 96% (Sector B-4)", color: "amber" },
    { time: "10:40:18", category: "HAZARD DETECTION", text: "Flood risk surge identified in Gorge sector", color: "red" },
    { time: "10:39:04", category: "SYSTEM", text: "Thermal sensor MLX90640 radiometric calibration complete", color: "blue" },
    { time: "10:37:48", category: "NAVIGATION", text: "Autonomous waypoint route updated (Target: CP-04)", color: "blue" },
    { time: "10:35:10", category: "SYSTEM", text: "RTK GPS carrier phase locked (14 satellites)", color: "green" },
    { time: "10:30:00", category: "MISSION", text: "Mission Start • Takeoff from Base LZ (Autonomous Mode)", color: "green" },
  ]
};
