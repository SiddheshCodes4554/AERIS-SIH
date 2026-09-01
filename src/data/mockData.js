// =========================================================================
// AERIS — AUTONOMOUS EMERGENCY RESPONSE COMMAND CENTER DATA
// Disaster Zone: Chamoli Flash Flood & Landslide Operation
// =========================================================================

export const INITIAL_MISSION_STATE = {
  missionId: "AR-2026-042",
  missionName: "Search & Rescue Reconnaissance",
  operationName: "OPERATION SENTINEL PHOENIX",
  location: "Chamoli Disaster Basin, Uttarakhand",
  disasterType: "Flash Flood & Mountain Landslide",
  droneId: "AERIS-01",
  systemStatus: "ONLINE",
  connectionState: "CONNECTED", // "CONNECTED" | "WEAK_SIGNAL" | "OFFLINE_MODE" | "BACKTRACKING"
  flightMode: "AUTO",
  battery: 78,
  voltage: 21.8,
  temperature: 31.4, // °C
  altitude: 120, // m AGL
  speed: 14.2, // m/s (51.1 km/h)
  heading: 138, // degrees SE
  gpsStatus: "ACTIVE",
  gpsFix: "RTK 3D FIX",
  satellites: 18,
  checkpoint: "CP-04",
  nextCheckpoint: "TARGET ZONE",
  nextDistanceKm: 1.1,
  missionProgress: 62, // %
  lastConnectedCheckpoint: "CP-03",
  signalLostTime: "02:14 AGO",
  bufferedEventsCount: 24,
  backtrackingProgress: 72,
  localAiStatus: "ACTIVE",
  dataBufferStatus: "ACTIVE",
};

export const CHECKPOINTS_ROUTE = [
  { id: "BASE", label: "BASE", name: "Staging Heli-Pad LZ", lat: 30.5380, lng: 79.5420, status: "COMPLETED", altitude: 40 },
  { id: "CP-01", label: "CP-01", name: "Lower River Ingress", lat: 30.5450, lng: 79.5490, status: "COMPLETED", altitude: 60 },
  { id: "CP-02", label: "CP-02", name: "Gorge Transition", lat: 30.5510, lng: 79.5550, status: "COMPLETED", altitude: 90 },
  { id: "CP-03", label: "CP-03", name: "Sector B-3 Ridge", lat: 30.5560, lng: 79.5610, status: "COMPLETED", altitude: 110, isLastConnected: true },
  { id: "CP-04", label: "CP-04", name: "Flooded Basin Overlook", lat: 30.5610, lng: 79.5680, status: "IN_PROGRESS", altitude: 120 },
  { id: "TARGET", label: "TARGET ZONE", name: "Upper Dam Outflow", lat: 30.5670, lng: 79.5760, status: "PENDING", altitude: 130 },
];

export const FLIGHT_PATHS = {
  // Traveled / Completed path (Dimmer / Differentiated color)
  traveled: [
    [30.5380, 79.5420], // BASE
    [30.5415, 79.5455],
    [30.5450, 79.5490], // CP-01
    [30.5480, 79.5520],
    [30.5510, 79.5550], // CP-02
    [30.5535, 79.5580],
    [30.5560, 79.5610], // CP-03 (Last Connected)
    [30.5585, 79.5645],
    [30.5610, 79.5680], // Current Position (AERIS-01)
  ],
  // Planned upcoming forward route (Bright thin white/blue)
  planned: [
    [30.5610, 79.5680], // Current Position
    [30.5640, 79.5720],
    [30.5670, 79.5760], // TARGET ZONE
  ],
  // Autonomous Backtrack Route (Amber dashed reverse path to CP-03)
  backtrack: [
    [30.5610, 79.5680], // Current Position
    [30.5585, 79.5645],
    [30.5560, 79.5610], // CP-03 Last Connected Checkpoint
  ]
};

export const SURVIVORS_LIST = [
  {
    id: "SURV-01",
    label: "SURVIVOR DETECTED",
    confidence: 94,
    priority: "CRITICAL",
    sector: "Sector B-4",
    lat: 30.5625,
    lng: 79.5700,
    timestamp: "14:32:08",
    details: "Person waving frantically from partially submerged school roof. Thermal heat signature: 37.1°C confirmed.",
    action: "Deploy Rescue Beacon & Float Kit"
  },
  {
    id: "SURV-02",
    label: "GROUP DETECTED (3)",
    confidence: 91,
    priority: "HIGH",
    sector: "Sector B-2",
    lat: 30.5530,
    lng: 79.5570,
    timestamp: "14:26:40",
    details: "Cluster of 3 individuals sheltering under rocky outcropping above rising flood current.",
    action: "Queue Heli Winch Extraction"
  }
];

export const HAZARDS_LIST = [
  {
    id: "HAZ-01",
    type: "FLOOD",
    label: "FLOODED AREA",
    severity: "HIGH",
    sector: "Sector C-1",
    lat: 30.5575,
    lng: 79.5635,
    timestamp: "14:30:18",
    details: "Severe water surge velocity 3.4 m/s. Water depth +2.6m above floodwall."
  },
  {
    id: "HAZ-02",
    type: "FIRE",
    label: "FIRE DETECTED",
    severity: "CRITICAL",
    sector: "Sector A-3",
    lat: 30.5480,
    lng: 79.5460,
    timestamp: "14:28:55",
    details: "Electrical transformer explosion fire. Core temp 385°C emitting dense toxic smoke."
  },
  {
    id: "HAZ-03",
    type: "DEBRIS",
    label: "BLOCKED ROUTE",
    severity: "MODERATE",
    sector: "Sector D-2",
    lat: 30.5440,
    lng: 79.5520,
    timestamp: "14:24:10",
    details: "Landslide rockfall blocking primary emergency access road 7A."
  }
];

export const RISK_HEATMAP_DATA = [
  {
    id: "HEAT-CRIT-01",
    level: "CRITICAL",
    center: [30.5625, 79.5700], // Survivor cluster / Flood vector
    radius: 190,
    color: "#FF453A",
    opacity: 0.32,
    label: "CRITICAL HAZARD & SURVIVOR PROBABILITY"
  },
  {
    id: "HEAT-HIGH-01",
    level: "HIGH",
    center: [30.5480, 79.5460], // Fire hotspot
    radius: 170,
    color: "#E2A24C",
    opacity: 0.28,
    label: "HIGH THERMAL SEVERITY ZONE"
  },
  {
    id: "HEAT-MED-01",
    level: "MODERATE",
    center: [30.5575, 79.5635], // Flood surge
    radius: 240,
    color: "#D99A4A",
    opacity: 0.20,
    label: "MODERATE WATER INUNDATION"
  },
  {
    id: "HEAT-LOW-01",
    level: "LOW",
    center: [30.5380, 79.5420], // Staging Base
    radius: 160,
    color: "#62C370",
    opacity: 0.14,
    label: "LOW RISK SECURED RECOVERY ZONE"
  }
];

export const AI_DETECTIONS_LOG = [
  {
    id: "DET-01",
    title: "SURVIVOR DETECTED",
    confidence: 94,
    priority: "CRITICAL",
    time: "14:31:42",
    sector: "Sector B-4",
    color: "red"
  },
  {
    id: "DET-02",
    title: "FLOOD HAZARD",
    confidence: 92,
    priority: "HIGH",
    severityText: "HIGH",
    time: "14:30:18",
    sector: "Sector C-1",
    color: "amber"
  },
  {
    id: "DET-03",
    title: "HEAT SIGNATURE",
    confidence: 87,
    priority: "CRITICAL",
    time: "14:28:55",
    sector: "Sector A-3",
    color: "red"
  },
  {
    id: "DET-04",
    title: "STRUCTURAL DEBRIS",
    confidence: 89,
    priority: "MODERATE",
    time: "14:24:10",
    sector: "Sector D-2",
    color: "amber"
  }
];

export const CHRONOLOGICAL_EVENTS = [
  { time: "14:32:08", text: "Survivor detected near Sector B-4 (94% Conf)", color: "amber" },
  { time: "14:31:42", text: "AI confidence increased to 94% (RGB+Thermal Fused)", color: "blue" },
  { time: "14:30:18", text: "High flood risk vector detected in Sector C-1", color: "red" },
  { time: "14:27:03", text: "Checkpoint CP-04 reached • Sensor Scan Active", color: "green" },
  { time: "14:24:10", text: "Structural debris blockage flagged at Road 7A", color: "amber" },
  { time: "14:20:00", text: "Autonomous search pattern Sector B initiated", color: "green" },
  { time: "14:15:30", text: "Mission Start • Ingress from Base Staging LZ", color: "blue" },
];

export const INITIAL_EVENT_LOG = CHRONOLOGICAL_EVENTS;
export const DEFAULT_MISSION_STATE = INITIAL_MISSION_STATE;
export { DISASTER_ZONES } from './operationalAreas';


