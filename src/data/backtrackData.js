// =========================================================================
// AERIS-01 OFFLINE AUTONOMY & BACKTRACKING RECOVERY DATASET
// Communication-Resilient Autonomous Mission Recovery Simulation Data
// =========================================================================

export const BACKTRACK_SCENARIOS = {
  droneId: "AERIS-01",
  missionName: "Flood Rescue Reconnaissance",
  homeBase: {
    name: "AERIS COMMAND STATION",
    lat: 30.3165,
    lng: 78.0322,
    coordinatesFormatted: "30.3165° N, 78.0322° E",
  },
  
  // Connection Boundary Center & Radius
  rfCoverageZone: {
    center: [30.3175, 78.0320],
    radiusMeters: 750, // Connected zone threshold
  },

  // Checkpoints
  checkpoints: [
    { id: "CP-01", label: "CP-01", name: "Valley Ingress", lat: 30.3130, lng: 78.0265, signal: "EXCELLENT" },
    { id: "CP-02", label: "CP-02", name: "Bridge Approach", lat: 30.3160, lng: 78.0298, signal: "EXCELLENT" },
    { id: "CP-03", label: "CP-03", name: "Ridge Overlook", lat: 30.3185, lng: 78.0335, signal: "GOOD" },
    { id: "CP-04", label: "CP-04", name: "Gorge Radio Gateway", lat: 30.3210, lng: 78.0375, signal: "VERIFIED", isLastConnected: true },
  ],

  // Waypoints
  waypoints: [
    { id: "WP-01", label: "WP-01", lat: 30.3140, lng: 78.0270 },
    { id: "WP-02", label: "WP-02", lat: 30.3170, lng: 78.0305 },
    { id: "WP-03", label: "WP-03", lat: 30.3195, lng: 78.0345 },
    { id: "WP-04", label: "WP-04", lat: 30.3220, lng: 78.0390 },
    { id: "WP-05", label: "WP-05 (Disaster Deep Gorge)", lat: 30.3255, lng: 78.0435 },
  ],

  // Path coordinates
  paths: {
    // Normal Mission Path from Home -> WP-01 -> CP-04 -> Deep Gorge
    normalRoute: [
      [30.3165, 78.0322], // Home
      [30.3130, 78.0265], // CP-01
      [30.3160, 78.0298], // CP-02
      [30.3185, 78.0335], // CP-03
      [30.3210, 78.0375], // CP-04 (Last Known Connected Checkpoint)
      [30.3255, 78.0435], // Deep Gorge (Signal Loss Location)
    ],
    // Recorded path taken beyond CP-04 into deep gorge (offline territory)
    recordedOfflinePath: [
      [30.3210, 78.0375], // CP-04
      [30.3225, 78.0395],
      [30.3240, 78.0415],
      [30.3255, 78.0435], // Signal Lost Location
    ],
    // Backtracking Path (Reverse from Deep Gorge to CP-04)
    backtrackPath: [
      [30.3255, 78.0435],
      [30.3240, 78.0415],
      [30.3225, 78.0395],
      [30.3210, 78.0375], // Target: CP-04
    ],
    // Resuming Mission forward path after reconnection
    resumeRoute: [
      [30.3210, 78.0375], // CP-04
      [30.3240, 78.0415],
      [30.3270, 78.0460], // Forward Sector B-14
    ]
  },

  // Simulated Buffer Events
  bufferedEventsQueue: [
    { time: "10:43:02", title: "PERSON DETECTED", details: "Confidence: 96% • Sector B-14 Rooftop", status: "BUFFERED" },
    { time: "10:43:18", title: "THERMAL ANOMALY", details: "Hotspot 38.2°C • Water Ingress", status: "BUFFERED" },
    { time: "10:43:24", title: "GPS ODOMETRY", details: "30.3255° N, 78.0435° E • 14 Sats", status: "BUFFERED" },
    { time: "10:43:35", title: "HAZARD DETECTED", details: "Bridge Structural Shear 89%", status: "BUFFERED" },
    { time: "10:43:48", title: "LOCAL MAP UPDATE", details: "Obstacle Voxel Grid Committed", status: "BUFFERED" },
  ],

  // Base Timeline Log
  timelineLog: [
    { time: "10:42:18", type: "CONNECTION LOST", text: "RF Ground link unavailable (Mountain Ridge Obstruction)", color: "amber" },
    { time: "10:42:19", type: "OFFLINE AUTONOMY", text: "Local Edge AI activated (Jetson Orin Nano @ 28 FPS)", color: "purple" },
    { time: "10:43:02", type: "AI DETECTION", text: "Survivor detected (96% Conf) • Buffered to NVMe Storage", color: "amber" },
    { time: "10:43:18", type: "THERMAL ANOMALY", text: "Radiometric heat signature (91% Conf) • Buffered locally", color: "amber" },
    { time: "10:43:30", type: "RECOVERY DECISION", text: "Autonomous Backtracking armed • Target: CP-04 (620m)", color: "amber" },
    { time: "10:43:42", type: "BACKTRACKING", text: "Navigating in reverse along recorded flight path toward CP-04", color: "amber" },
    { time: "10:44:36", type: "CONNECTION RESTORED", text: "5.8 GHz Mesh link restored at CP-04 (Signal: 88%)", color: "green" },
    { time: "10:44:38", type: "DATA SYNC STARTED", text: "Transmitting 5 buffered events, 12 images & 248 sensor logs", color: "blue" },
    { time: "10:44:52", type: "DATA SYNC COMPLETE", text: "100% Data integrity verified by AERIS Command Ground Station", color: "green" },
    { time: "10:45:04", type: "MISSION RESUMED", text: "Autonomous search pattern resumed forward to Sector B-14", color: "green" },
  ]
};
