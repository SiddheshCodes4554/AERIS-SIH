// =========================================================================
// AERIS-01 MISSION PLANNING DATASET
// Single UAV Autonomous Disaster Mission Configuration & Route Planning
// =========================================================================

export const DEFAULT_MISSION_PLAN = {
  droneId: "AERIS-01",
  missionName: "Flood Rescue Reconnaissance",
  missionType: "Search & Rescue", // "Search & Rescue" | "Disaster Reconnaissance" | "Hazard Assessment" | "Thermal Survey"
  missionPriority: "HIGH", // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  autonomyMode: "FULL_AUTONOMOUS", // "FULL_AUTONOMOUS" | "SUPERVISED" | "MANUAL"
  altitudeMeters: 50,
  cruiseSpeedMs: 8,
  
  // Safety Features
  safety: {
    obstacleAvoidance: true,
    returnToHome: true,
    automaticBacktracking: true,
  },

  // Home / Ground Station Location
  homeBase: {
    name: "AERIS COMMAND STATION",
    lat: 30.3165,
    lng: 78.0322,
    coordinatesFormatted: "30.3165° N, 78.0322° E",
  },

  // Mission Zone Polygon (Sector B - Flood Affected Region)
  missionArea: {
    label: "MISSION ZONE: Sector B (Flood Affected Region)",
    polygon: [
      [30.3120, 78.0240],
      [30.3220, 78.0280],
      [30.3260, 78.0420],
      [30.3180, 78.0460],
      [30.3110, 78.0340],
    ]
  },

  // Waypoints Sequence
  waypoints: [
    { id: "WP-01", label: "WP-01", name: "Gorge Ingress", lat: 30.3140, lng: 78.0270, altitude: 50, speed: 8 },
    { id: "WP-02", label: "WP-02", name: "Flooded Bridge Approach", lat: 30.3175, lng: 78.0305, altitude: 50, speed: 8 },
    { id: "WP-03", label: "WP-03", name: "Sector B-4 Residential Rooftops", lat: 30.3205, lng: 78.0350, altitude: 50, speed: 8 },
    { id: "WP-04", label: "WP-04", name: "Upper Dam Outflow Sweep", lat: 30.3235, lng: 78.0395, altitude: 50, speed: 8 },
  ],

  // Special Communication Checkpoints
  checkpoints: [
    { id: "CP-01", label: "CP-01", name: "Lower River Mesh Link", lat: 30.3155, lng: 78.0285, signalQuality: "EXCELLENT", verified: true },
    { id: "CP-02", label: "CP-02", name: "Bridge Transition Relay", lat: 30.3190, lng: 78.0328, signalQuality: "GOOD", verified: true },
    { id: "CP-03", label: "CP-03", name: "Sector B Ridge Station", lat: 30.3220, lng: 78.0372, signalQuality: "GOOD", verified: true },
  ],

  // Computed Estimates
  metrics: {
    totalDistanceKm: 3.8,
    estimatedDurationMin: 12,
    startingBatteryPercent: 85,
    estimatedRemainingBatteryPercent: 72,
    waypointsCount: 4,
    checkpointsCount: 3,
  },

  // Readiness Checklist Items
  readinessChecks: [
    { id: "gps", label: "GPS Available (RTK 3D Locked)", passed: true },
    { id: "battery", label: "Battery Sufficient (85% > 30% Threshold)", passed: true },
    { id: "route", label: "Mission Route Valid & Collision-Free", passed: true },
    { id: "return", label: "Return-To-Home Path Calculated", passed: true },
    { id: "checkpoints", label: "Communication Checkpoints Configured", passed: true },
    { id: "ai", label: "Edge AI Perception Pipeline Armed", passed: true },
  ]
};
