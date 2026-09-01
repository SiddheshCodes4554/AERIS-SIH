// ==========================================================
// AERIS AUTONOMOUS EMERGENCY RESPONSE COMMAND CENTER DATA
// Location: Chamoli / Alaknanda Disaster Basin, Uttarakhand
// ==========================================================

export const FLEET_SUMMARY = {
  totalDrones: 12,
  active: 7,
  standby: 3,
  offline: 2,
  operationalEfficiency: 87.4,
  efficiencyTarget: 80.0,
  activeAlertsCount: 4,
  autonomousMissionsCount: 12,
  averageResponseMin: 2.4,
  areaCoveragePercent: 78.6,
  liveObservationsCount: 142,
};

export const EFFICIENCY_TIMELINE = [
  { time: "06:00", value: 76, target: 80, variance: "-4%" },
  { time: "09:00", value: 82, target: 80, variance: "+2%" },
  { time: "12:00", value: 89, target: 80, variance: "+9%" },
  { time: "15:00", value: 84, target: 80, variance: "+4%" },
  { time: "18:00", value: 92, target: 80, variance: "+12%" },
  { time: "21:00", value: 87.4, target: 80, variance: "+7.4%" },
];

export const DRONE_FLEET = [
  {
    id: "AERIS-01",
    callsign: "PHOENIX-01",
    model: "AERIS VTOL-SAR v2",
    mission: "Flood Reconnaissance",
    missionId: "AR-2026-042",
    location: "Sector A-14, Chamoli",
    disasterType: "Flash Flood",
    status: "ACTIVE", // ACTIVE | RETURNING | OFFLINE | STANDBY
    battery: 82,
    voltage: 24.6,
    altitude: 124, // m
    speed: 18.6, // m/s
    temperature: 31, // °C
    heading: 128,
    connectivity: {
      gps: "CONNECTED",
      lte: "CONNECTED",
      signalStrength: 88,
      latencyMs: 42,
    },
    missionProgress: 68,
    timeline: {
      startTime: "06:00 AM",
      currentTime: "08:42 AM",
      estimatedReturn: "11:00 AM",
      stages: [
        { label: "Launch", completed: true },
        { label: "Reach Disaster Zone", completed: true },
        { label: "Area Scanning", completed: true },
        { label: "Victim Detection", active: true },
        { label: "Return", pending: true },
      ]
    },
    position: { lat: 30.5520, lng: 79.5580 },
    flightPath: [
      [30.5380, 79.5420], // Launch Base
      [30.5440, 79.5480], // Waypoint Alpha
      [30.5485, 79.5530], // Checkpoint Bravo
      [30.5520, 79.5580], // Current Position (AERIS-01)
      [30.5570, 79.5640], // Target Outflow
      [30.5620, 79.5700], // Mission Perimeter
    ],
    offlineMode: {
      active: false,
      currentStage: null,
    }
  },
  {
    id: "AERIS-02",
    callsign: "PHOENIX-02",
    model: "AERIS Heavy-Lifter X4",
    mission: "Medical Supply Delivery",
    missionId: "AR-2026-041",
    location: "Rishikesh Outflow Zone",
    disasterType: "Evacuation Support",
    status: "RETURNING",
    battery: 64,
    voltage: 24.1,
    altitude: 95,
    speed: 22.4,
    temperature: 29,
    heading: 260,
    connectivity: {
      gps: "CONNECTED",
      lte: "CONNECTED",
      signalStrength: 92,
      latencyMs: 38,
    },
    missionProgress: 91,
    timeline: {
      startTime: "05:30 AM",
      currentTime: "08:42 AM",
      estimatedReturn: "09:15 AM",
      stages: [
        { label: "Launch", completed: true },
        { label: "Drop Medical Kit", completed: true },
        { label: "Payload Verified", completed: true },
        { label: "Return Ingress", active: true },
        { label: "Docking", pending: true },
      ]
    },
    position: { lat: 30.5390, lng: 79.5430 },
    flightPath: [
      [30.5380, 79.5420],
      [30.5480, 79.5590],
      [30.5390, 79.5430],
    ],
    offlineMode: { active: false }
  },
  {
    id: "AERIS-03",
    callsign: "PHOENIX-03",
    model: "AERIS Deep-Scout V1",
    mission: "Deep Gorge Thermal Scan",
    missionId: "AR-2026-043",
    location: "Sector D-08 Gorge",
    disasterType: "Landslide Search",
    status: "OFFLINE",
    battery: 48,
    voltage: 23.4,
    altitude: 140,
    speed: 14.2,
    temperature: 34,
    heading: 215,
    connectivity: {
      gps: "LOCAL",
      lte: "LOST",
      signalStrength: 0,
      latencyMs: null,
    },
    missionProgress: 52,
    timeline: {
      startTime: "07:15 AM",
      currentTime: "08:42 AM",
      estimatedReturn: "10:30 AM",
      stages: [
        { label: "Launch", completed: true },
        { label: "Deep Gorge Ingress", completed: true },
        { label: "Signal Lost (Gorge Shadow)", active: true },
        { label: "Autonomous Backtrack", active: true },
        { label: "Re-link", pending: true },
      ]
    },
    position: { lat: 30.5690, lng: 79.5750 },
    lastConnectedCheckpoint: {
      id: "LCC-03",
      label: "LAST CONNECTED CHECKPOINT",
      lat: 30.5610,
      lng: 79.5660,
      timeLost: "08:37:12 UTC",
    },
    backtrackPath: [
      [30.5690, 79.5750], // Current Offline Pos
      [30.5650, 79.5705], // Autonomous Backtrack Trail
      [30.5610, 79.5660], // Last Known Connected Checkpoint
    ],
    flightPath: [
      [30.5380, 79.5420],
      [30.5500, 79.5550],
      [30.5610, 79.5660],
      [30.5690, 79.5750],
    ],
    offlineMode: {
      active: true,
      currentStage: "BACKTRACK",
      sequence: [
        { id: "signal_lost", label: "Signal Lost", status: "DONE" },
        { id: "local_ai", label: "Local AI Inference", status: "DONE" },
        { id: "store_data", label: "Critical Data Stored", status: "DONE" },
        { id: "backtrack", label: "Backtrack Initiated", status: "ACTIVE" },
        { id: "reconnect", label: "Reconnect", status: "PENDING" },
      ]
    }
  },
  {
    id: "AERIS-04",
    callsign: "PHOENIX-04",
    model: "AERIS VTOL-SAR v2",
    mission: "Perimeter Loiter",
    missionId: "AR-2026-044",
    location: "Sector B-02 Helipad",
    disasterType: "Standby / Relief",
    status: "STANDBY",
    battery: 22,
    voltage: 22.8,
    altitude: 10,
    speed: 0,
    temperature: 28,
    heading: 0,
    connectivity: {
      gps: "CONNECTED",
      lte: "CONNECTED",
      signalStrength: 96,
      latencyMs: 24,
    },
    missionProgress: 100,
    position: { lat: 30.5340, lng: 79.5380 },
    flightPath: [],
    offlineMode: { active: false }
  }
];

export const ACTIVE_ALERTS = [
  {
    id: "ALT-01",
    type: "CRITICAL_INCIDENT",
    severity: "CRITICAL",
    category: "AI Detection",
    title: "Flood Victims Detected",
    subtitle: "Sector A-14 • Northern River Bank",
    timeAgo: "3 min ago",
    details: {
      estimatedPeople: "8–12 Individuals",
      confidence: 94,
      priority: "HIGH",
      situation: "Cluster of survivors stranded on rooftop of partially submerged school building. Water level rising +0.18m/hr."
    },
    aiRecommendation: "Deploy Medical Payload & Dispatch AERIS-05 for Thermal Recon",
    coordinates: { lat: 30.5545, lng: 79.5610 }
  },
  {
    id: "ALT-02",
    type: "SIGNAL_LOSS",
    severity: "WARNING",
    category: "Connectivity",
    title: "Signal Loss — AERIS-03",
    subtitle: "Sector D-08 Gorge (Terrain Shadow)",
    timeAgo: "5 min ago",
    details: {
      droneId: "AERIS-03",
      status: "LTE Connection Lost",
      actionState: "Autonomous Local AI & Backtrack Active"
    },
    aiRecommendation: "AERIS-03 currently backtracking to Last Known Connected Checkpoint (LCC-03). Estimated re-link in 2.2 min."
  },
  {
    id: "ALT-03",
    type: "LOW_BATTERY",
    severity: "WARNING",
    category: "Fleet Health",
    title: "Low Battery — AERIS-04",
    subtitle: "Sector B-02 Staging Pad",
    timeAgo: "8 min ago",
    details: {
      droneId: "AERIS-04",
      battery: "22% remaining",
      threshold: "Below 25% safe threshold"
    },
    aiRecommendation: "Auto-RTL initiated to Base Pad B for rapid battery swap."
  },
  {
    id: "ALT-04",
    type: "HIGH_WIND",
    severity: "INFO",
    category: "Weather Alert",
    title: "High Wind Shear Warning",
    subtitle: "Sector C-08 Mountain Ridge",
    timeAgo: "14 min ago",
    details: {
      windSpeed: "48 km/h",
      gusts: "58 km/h",
      impact: "Slight flight path drift on high-altitude routes"
    },
    aiRecommendation: "Limit flight altitudes above 150m AGL in ridge corridor."
  }
];

export const AI_INTELLIGENCE = {
  title: "AI Intelligence",
  subtitle: "Real-time mission analysis",
  insight: "Flood water surge vector is expanding towards Sector B residential basin. Thermal signatures indicate 2 vulnerable clusters.",
  confidence: 94,
  recommendation: "Deploy AERIS-05 for multi-spectral thermal reconnaissance and prepare swift-water rescue boat teams.",
  inferenceEngine: "YOLOv10-SAR Edge Multimodal",
  latency: "32 ms",
  computeNode: "NVIDIA Jetson AGX Orin"
};

export const INCIDENT_ZONES = [
  {
    id: "ZONE-FLOOD",
    name: "Sector A-14 Flood Inundation Zone",
    type: "FLOOD",
    color: "#00E5FF",
    fillColor: "#00E5FF",
    severity: "CRITICAL",
    polygon: [
      [30.5480, 79.5500],
      [30.5560, 79.5530],
      [30.5590, 79.5680],
      [30.5520, 79.5710],
      [30.5440, 79.5580],
    ],
    details: "Water surge level +2.8m above baseline"
  },
  {
    id: "ZONE-LANDSLIDE",
    name: "Sector C-08 Landslide Obstruction",
    type: "LANDSLIDE",
    color: "#D99A4A",
    fillColor: "#D99A4A",
    severity: "WARNING",
    polygon: [
      [30.5630, 79.5680],
      [30.5680, 79.5740],
      [30.5640, 79.5790],
      [30.5600, 79.5730],
    ],
    details: "Mountain pass debris flow blocking road transit"
  },
  {
    id: "ZONE-STRUCTURE",
    name: "Collapsed Bridge Grid Overhang",
    type: "COLLAPSE",
    color: "#FF3B30",
    fillColor: "#FF3B30",
    severity: "CRITICAL",
    polygon: [
      [30.5430, 79.5440],
      [30.5460, 79.5470],
      [30.5445, 79.5500],
      [30.5415, 79.5465],
    ],
    details: "Structural compromise with electrical hazard risk"
  }
];

export const MISSION_CHECKPOINTS = [
  { id: "CP-1", label: "BASE LZ", name: "Helipad Staging Base", lat: 30.5380, lng: 79.5420, status: "COMPLETED" },
  { id: "CP-2", label: "CP-01", name: "Lower Bridge Pass", lat: 30.5485, lng: 79.5530, status: "COMPLETED" },
  { id: "CP-3", label: "CP-02", name: "Sector A-14 School", lat: 30.5545, lng: 79.5610, status: "IN_PROGRESS" },
  { id: "CP-4", label: "CP-03", name: "Upper Dam Outflow", lat: 30.5620, lng: 79.5700, status: "PENDING" },
];
