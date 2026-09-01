// =========================================================================
// AERIS — MISSION INTELLIGENCE & ANALYTICS DATASET
// AI Risk Heatmaps, Geospatial Intelligence, Vision Feeds, Trends & Insights
// =========================================================================

export const ANALYTICS_METRICS = {
  aiDetections: {
    value: 247,
    period: "Detected in selected period",
    trend: "+18%",
    isPositive: true,
  },
  highRiskZones: {
    value: "08",
    period: "Areas requiring attention",
    trend: "2 Critical",
    accent: "amber",
  },
  activeIncidents: {
    value: "04",
    period: "Currently being monitored",
    trend: "1 Urgent",
    accent: "red",
  },
  droneCoverage: {
    value: "87%",
    period: "Operational area covered",
    trend: "Optimal mesh",
    accent: "blue",
  },
};

export const HEATMAP_REGIONS = [
  // Red = Critical activity zone (Sector B-12)
  {
    id: "HEAT-CRIT-B12",
    level: "CRITICAL",
    center: [30.5620, 79.5690],
    radius: 220,
    color: "#FF4D3D",
    opacity: 0.42,
    label: "CRITICAL ACTIVITY ZONE (Sector B-12)",
    details: "High crowd density & rising water surge intersection"
  },
  // Orange = High activity zone (Industrial Zone 4)
  {
    id: "HEAT-HIGH-IND4",
    level: "HIGH",
    center: [30.5520, 79.5580],
    radius: 260,
    color: "#F5A623",
    opacity: 0.32,
    label: "HIGH RISK INDUSTRIAL SECTOR",
    details: "Thermal anomalies & electrical hazard risk"
  },
  // Yellow = Medium activity zone
  {
    id: "HEAT-MED-CENTRAL",
    level: "MEDIUM",
    center: [30.5450, 79.5510],
    radius: 320,
    color: "#E2A24C",
    opacity: 0.22,
    label: "MEDIUM ACTIVITY CORRIDOR",
    details: "Evacuation route pedestrian movement"
  },
  // Green = Low activity secured zone
  {
    id: "HEAT-LOW-BASE",
    level: "LOW",
    center: [30.5380, 79.5420],
    radius: 380,
    color: "#63C174",
    opacity: 0.14,
    label: "LOW RISK SECURED RECOVERY ZONE",
    details: "Staging heli-pad & logistics base"
  }
];

export const MAP_INCIDENTS = [
  {
    id: "INC-MAP-01",
    type: "FIRE",
    icon: "🔥",
    title: "Thermal Fire Outbreak",
    location: "Industrial Zone 4",
    lat: 30.5525,
    lng: 79.5585,
    confidence: 91,
    severity: "CRITICAL",
    color: "#FF4D3D",
    time: "09:38 AM",
    description: "Transformer arc fire detected with 385°C hotspot."
  },
  {
    id: "INC-MAP-02",
    type: "CROWD",
    icon: "👥",
    title: "Unusual Crowd Density",
    location: "Sector B-12 (Community Hall)",
    lat: 30.5620,
    lng: 79.5690,
    confidence: 96,
    severity: "HIGH",
    color: "#F5A623",
    time: "09:42 AM",
    description: "Cluster of ~45 stranded individuals on elevated roof terrace."
  },
  {
    id: "INC-MAP-03",
    type: "FLOOD",
    icon: "🌊",
    title: "Flash Flood Vector",
    location: "Alaknanda Gorge Outflow",
    lat: 30.5480,
    lng: 79.5540,
    confidence: 88,
    severity: "HIGH",
    color: "#00E5FF",
    time: "09:15 AM",
    description: "Rapid water influx rising at 3.2 m/s."
  },
  {
    id: "INC-MAP-04",
    type: "STRUCTURE",
    icon: "⚠",
    title: "Bridge Foundation Shear",
    location: "Access Bridge 3B",
    lat: 30.5420,
    lng: 79.5470,
    confidence: 84,
    severity: "MEDIUM",
    color: "#E2A24C",
    time: "08:55 AM",
    description: "Structural displacement on eastern pier."
  },
  {
    id: "INC-MAP-05",
    type: "MEDICAL",
    icon: "🚑",
    title: "Medical Priority Extraction",
    location: "East Ridge Outpost",
    lat: 30.5580,
    lng: 79.5640,
    confidence: 97,
    severity: "CRITICAL",
    color: "#FF4D3D",
    time: "09:20 AM",
    description: "Stranded injured elder requiring stretcher winch."
  }
];

export const MAP_DRONES = [
  {
    id: "DRONE-04",
    callsign: "AERIS-04",
    status: "Monitoring",
    battery: 74,
    altitude: "120m",
    speed: "14.2 m/s",
    lat: 30.5610,
    lng: 79.5680,
    coverageRadius: 420,
    heading: 135,
    mission: "Sector B-12 Overhead Surveillance",
    streamId: "CAM-01"
  },
  {
    id: "DRONE-07",
    callsign: "AERIS-07",
    status: "Monitoring",
    battery: 86,
    altitude: "95m",
    speed: "9.8 m/s",
    lat: 30.5515,
    lng: 79.5575,
    coverageRadius: 360,
    heading: 45,
    mission: "Industrial Zone 4 Thermal Scan",
    streamId: "CAM-02"
  },
  {
    id: "DRONE-02",
    callsign: "AERIS-02",
    status: "Patrolling",
    battery: 92,
    altitude: "140m",
    speed: "16.4 m/s",
    lat: 30.5460,
    lng: 79.5520,
    coverageRadius: 500,
    heading: 210,
    mission: "River Basin Flood Ingress Patrol",
    streamId: "CAM-03"
  }
];

export const MAP_FLIGHT_PATHS = {
  // Current active flight routes
  current: [
    [30.5460, 79.5520],
    [30.5515, 79.5575],
    [30.5610, 79.5680]
  ],
  // Completed traveled paths (faded line)
  completed: [
    [30.5380, 79.5420],
    [30.5420, 79.5470],
    [30.5460, 79.5520]
  ],
  // Planned forward patrol routes (dashed line)
  planned: [
    [30.5610, 79.5680],
    [30.5650, 79.5740],
    [30.5700, 79.5800]
  ]
};

export const LIVE_INTELLIGENCE_EVENTS = [
  {
    id: "EVT-01",
    time: "09:42:18",
    priority: "HIGH PRIORITY",
    priorityCode: "CRITICAL",
    eventType: "Unusual crowd density detected",
    location: "Sector B-12",
    confidence: 96,
    color: "red"
  },
  {
    id: "EVT-02",
    time: "09:38:42",
    priority: "AI DETECTION",
    priorityCode: "HIGH",
    eventType: "Possible fire detected",
    location: "Industrial Zone 4",
    confidence: 91,
    color: "amber"
  },
  {
    id: "EVT-03",
    time: "09:31:05",
    priority: "DRONE UPDATE",
    priorityCode: "INFO",
    eventType: "AERIS-07 entered monitoring zone",
    location: "Sector A-3 Ingress",
    confidence: 100,
    color: "blue"
  },
  {
    id: "EVT-04",
    time: "09:24:17",
    priority: "RISK ANALYSIS",
    priorityCode: "WARNING",
    eventType: "Crowd movement increasing",
    location: "Central Area",
    confidence: 88,
    color: "amber"
  },
  {
    id: "EVT-05",
    time: "09:18:30",
    priority: "AI DETECTION",
    priorityCode: "INFO",
    eventType: "Flood surge velocity mapped (3.2 m/s)",
    location: "Gorge Outflow",
    confidence: 94,
    color: "blue"
  },
  {
    id: "EVT-06",
    time: "09:12:04",
    priority: "RESOLVED",
    priorityCode: "RESOLVED",
    eventType: "Bridge 3B structural perimeter secured",
    location: "Sector D-2",
    confidence: 98,
    color: "green"
  }
];

export const ACTIVITY_TRENDS_DATA = [
  { time: "00:00", current: 8, average: 12, threshold: 25 },
  { time: "03:00", current: 5, average: 9, threshold: 25 },
  { time: "06:00", current: 14, average: 15, threshold: 25 },
  { time: "09:00", current: 28, average: 18, threshold: 25 },
  { time: "12:00", current: 22, average: 20, threshold: 25 },
  { time: "15:00", current: 19, average: 17, threshold: 25 },
  { time: "18:00", current: 24, average: 21, threshold: 25 },
  { time: "21:00", current: 16, average: 14, threshold: 25 },
];

export const RISK_DISTRIBUTION_DATA = [
  { label: "Medium Risk", percentage: 38, color: "#F5A623" },
  { label: "Low Risk", percentage: 31, color: "#63C174" },
  { label: "High Risk", percentage: 24, color: "#FF922B" },
  { label: "Critical", percentage: 7, color: "#FF4D3D" },
];

export const AI_INSIGHTS = [
  {
    id: "INS-01",
    title: "Increasing crowd activity detected near Sector B-12.",
    recommendation: "Deploy an additional drone for wider coverage.",
    actionLabel: "View Zone →",
    targetZone: "Sector B-12",
    severity: "HIGH"
  },
  {
    id: "INS-02",
    title: "AERIS-04 battery consumption is higher than expected.",
    recommendation: "Consider assigning AERIS-06 as backup.",
    actionLabel: "View Fleet →",
    targetZone: "Fleet Grid",
    severity: "MEDIUM"
  },
  {
    id: "INS-03",
    title: "Repeated thermal anomalies detected in Industrial Zone 4.",
    recommendation: "Increase monitoring frequency.",
    actionLabel: "Investigate →",
    targetZone: "Industrial Zone 4",
    severity: "CRITICAL"
  }
];

export const LIVE_VISION_STREAMS = [
  {
    id: "STREAM-01",
    droneId: "AERIS-04",
    cameraLabel: "CAMERA 01",
    location: "Sector B-12",
    timestamp: "09:42:18",
    coords: "30.5610° N, 79.5680° E",
    streamType: "CROWD_FLOOD",
    primaryDetection: { label: "PERSON DETECTED", confidence: 98 },
    secondaryDetection: { label: "VEHICLE DETECTED", confidence: 94 },
    fps: 30,
    alt: "120m",
    spd: "14.2 m/s"
  },
  {
    id: "STREAM-02",
    droneId: "AERIS-07",
    cameraLabel: "CAMERA 02",
    location: "Industrial Zone 4",
    timestamp: "09:38:42",
    coords: "30.5515° N, 79.5575° E",
    streamType: "THERMAL_FIRE",
    primaryDetection: { label: "FIRE HOTSPOT (385°C)", confidence: 91 },
    secondaryDetection: { label: "SMOKE PLUME", confidence: 87 },
    fps: 30,
    alt: "95m",
    spd: "9.8 m/s"
  },
  {
    id: "STREAM-03",
    droneId: "AERIS-02",
    cameraLabel: "CAMERA 03",
    location: "Flood Basin Gorge",
    timestamp: "09:20:14",
    coords: "30.5460° N, 79.5520° E",
    streamType: "RIVER_SURGE",
    primaryDetection: { label: "SURGE VELOCITY 3.2m/s", confidence: 96 },
    secondaryDetection: { label: "DEBRIS DRIFT", confidence: 89 },
    fps: 30,
    alt: "140m",
    spd: "16.4 m/s"
  }
];

export const MISSION_PERFORMANCE = {
  successRate: "94.8%",
  avgResponseTime: "2m 14s",
  avgAiConfidence: "96.2%",
  areaCovered: "148 km²",
  dataCaptured: "12.4 GB"
};
