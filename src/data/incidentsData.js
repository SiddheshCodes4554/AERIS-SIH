// =========================================================================
// AERIS — INCIDENT RESPONSE & AI ALERT MANAGEMENT DATASET
// Real-time disaster incidents, environmental telemetry, AI assessments & drone fleet
// =========================================================================

export const ACTIVE_INCIDENTS = [
  {
    id: "INC-01",
    code: "INCIDENT 01",
    title: "Possible Forest Fire",
    severity: "CRITICAL", // "CRITICAL" | "HIGH" | "MEDIUM" | "RESOLVED"
    severityColor: "#FF4D3D",
    location: "Sector B-14",
    coordinates: "19.0760° N, 72.8777° E",
    lat: 19.0760,
    lng: 72.8777,
    detectedTime: "2 min ago",
    detectedTimestamp: "10:42 AM",
    confidence: 94,
    detectingDrone: "Drone A-07",
    droneCallsign: "A-07",
    category: "FIRE",
    icon: "flame",
    description: "Thermal and visual analysis indicates a high probability of active forest canopy fire. Smoke density has increased by 18% during the last 5 minutes.",
    riskMetrics: {
      spreadRisk: "HIGH",
      spreadPercentage: 85,
      estimatedRiskRadius: "420 m",
      windImpact: "Moderate (SE 14 km/h)",
      nearbyPopulation: "Low (Scattered)",
    },
    environmentalData: {
      temperature: "42°C",
      humidity: "21%",
      windSpeed: "14 km/h",
      airQuality: "Poor (AQI 182)",
    },
    aiRecommendation: "Deploy nearest available drone for thermal verification and establish a surveillance perimeter.",
    recommendedChecklist: [
      "Dispatch Drone A-12 for aerial perimeter survey",
      "Activate MLX90640 radiometric thermal camera",
      "Monitor fire spread vector along ridge line",
      "Notify SDRF & State Forest Fire Operations"
    ],
    timeline: [
      { time: "10:46 AM", text: "Response recommendation generated", status: "completed" },
      { time: "10:45 AM", text: "Fire probability increased to 94%", status: "completed" },
      { time: "10:44 AM", text: "Visual & thermal confirmation initiated", status: "completed" },
      { time: "10:43 AM", text: "Drone A-07 redirected to Sector B-14", status: "completed" },
      { time: "10:42 AM", text: "AI thermal anomaly detected by A-07", status: "completed" },
      { time: "10:41:23 AM", text: "Signal interruption • Offline edge buffer active", status: "offline", isOfflineEvent: true },
      { time: "10:41:48 AM", text: "Connection restored • Data synchronized", status: "synced" }
    ],
    cameraFeed: {
      streamType: "FOREST_FIRE",
      targetBox: { label: "FIRE", confidence: 94 },
      secondaryBox: { label: "SMOKE PLUME", confidence: 88 },
      alt: "120m",
      speed: "8.4 m/s",
      battery: 74,
      gimbal: "-40°",
      fov: "82°"
    },
    heatmap: {
      center: [19.0760, 72.8777],
      rings: [
        { radius: 120, color: "#FF4D3D", opacity: 0.45, label: "HIGH RISK FIRE FLAME FRONT" },
        { radius: 260, color: "#F5A623", opacity: 0.28, label: "MEDIUM RISK SMOKE & EMBERS" },
        { radius: 440, color: "#63C174", opacity: 0.14, label: "LOW RISK BUFFER PERIMETER" }
      ]
    },
    droneRoute: {
      dronePos: [19.0745, 72.8755],
      launchPoint: [19.0680, 72.8680],
      waypoints: [
        [19.0705, 72.8710], // Waypoint 1
        [19.0725, 72.8735], // Waypoint 2
        [19.0745, 72.8755], // Current Position (A-07)
      ],
      incidentPos: [19.0760, 72.8777],
      recommendedPath: [
        [19.0745, 72.8755],
        [19.0760, 72.8777],
        [19.0780, 72.8800]
      ]
    }
  },
  {
    id: "INC-02",
    code: "INCIDENT 02",
    title: "Unauthorized Activity",
    severity: "HIGH",
    severityColor: "#F5A623",
    location: "Restricted Zone C-3",
    coordinates: "19.0830° N, 72.8840° E",
    lat: 19.0830,
    lng: 72.8840,
    detectedTime: "8 min ago",
    detectedTimestamp: "10:36 AM",
    confidence: 89,
    detectingDrone: "Drone A-12",
    droneCallsign: "A-12",
    category: "SECURITY",
    icon: "shieldAlert",
    description: "Multi-spectral AI vision detected 2 unregistered vehicles and 4 individuals breaching perimeter fence in Restricted Buffer Zone C-3.",
    riskMetrics: {
      spreadRisk: "MODERATE",
      spreadPercentage: 62,
      estimatedRiskRadius: "280 m",
      windImpact: "Low (N 6 km/h)",
      nearbyPopulation: "Restricted Facility Zone",
    },
    environmentalData: {
      temperature: "34°C",
      humidity: "45%",
      windSpeed: "6 km/h",
      airQuality: "Moderate (AQI 95)",
    },
    aiRecommendation: "Establish persistent aerial tracking, deploy spotlight payload, and alert perimeter security unit.",
    recommendedChecklist: [
      "Lock optical auto-tracking onto primary vehicle",
      "Deploy Drone A-03 to seal North egress route",
      "Stream encrypted video feed to Base Security",
      "Log license plates & biometrics to evidence database"
    ],
    timeline: [
      { time: "10:40 AM", text: "Secondary vehicle identified", status: "completed" },
      { time: "10:38 AM", text: "Facial recognition & vehicle tracker engaged", status: "completed" },
      { time: "10:36 AM", text: "Perimeter breach detected by Drone A-12", status: "completed" }
    ],
    cameraFeed: {
      streamType: "SECURITY_BREACH",
      targetBox: { label: "VEHICLE (UNAUTHORIZED)", confidence: 89 },
      secondaryBox: { label: "PERSON (4)", confidence: 92 },
      alt: "85m",
      speed: "12.1 m/s",
      battery: 89,
      gimbal: "-30°",
      fov: "76°"
    },
    heatmap: {
      center: [19.0830, 72.8840],
      rings: [
        { radius: 100, color: "#F5A623", opacity: 0.40, label: "ACTIVE BREACH CORRIDOR" },
        { radius: 240, color: "#63C174", opacity: 0.15, label: "OUTER PERIMETER ZONE" }
      ]
    },
    droneRoute: {
      dronePos: [19.0815, 72.8820],
      launchPoint: [19.0720, 72.8750],
      waypoints: [
        [19.0760, 72.8780],
        [19.0815, 72.8820]
      ],
      incidentPos: [19.0830, 72.8840],
      recommendedPath: [
        [19.0815, 72.8820],
        [19.0830, 72.8840]
      ]
    }
  },
  {
    id: "INC-03",
    code: "INCIDENT 03",
    title: "Infrastructure Damage",
    severity: "MEDIUM",
    severityColor: "#F5A623",
    location: "Bridge Sector D-7",
    coordinates: "19.0690° N, 72.8720° E",
    lat: 19.0690,
    lng: 72.8720,
    detectedTime: "14 min ago",
    detectedTimestamp: "10:30 AM",
    confidence: 82,
    detectingDrone: "Drone A-03",
    droneCallsign: "A-03",
    category: "STRUCTURAL",
    icon: "alertTriangle",
    description: "LiDAR and visual photogrammetry detected 32cm lateral shear crack on bridge pier 4B following heavy water runoff.",
    riskMetrics: {
      spreadRisk: "MODERATE",
      spreadPercentage: 45,
      estimatedRiskRadius: "150 m",
      windImpact: "Negligible",
      nearbyPopulation: "Evacuated Bridge Span",
    },
    environmentalData: {
      temperature: "31°C",
      humidity: "68%",
      windSpeed: "9 km/h",
      airQuality: "Good (AQI 42)",
    },
    aiRecommendation: "Generate 3D structural mesh scan, close bridge access gates, and alert structural engineering team.",
    recommendedChecklist: [
      "Complete 360° close-proximity photogrammetry scan",
      "Deploy sonic vibration sensor probe",
      "Verify foundation scour depth with LiDAR",
      "Transmit engineering report to Ministry of Transport"
    ],
    timeline: [
      { time: "10:34 AM", text: "Point cloud mesh comparison completed", status: "completed" },
      { time: "10:32 AM", text: "Drone A-03 orbital scan initiated", status: "completed" },
      { time: "10:30 AM", text: "Pier shear crack detected by AI", status: "completed" }
    ],
    cameraFeed: {
      streamType: "STRUCTURAL_CRACK",
      targetBox: { label: "CRACK (32cm SHEAR)", confidence: 82 },
      secondaryBox: { label: "PIER 4B", confidence: 96 },
      alt: "45m",
      speed: "3.2 m/s",
      battery: 64,
      gimbal: "-15°",
      fov: "65°"
    },
    heatmap: {
      center: [19.0690, 72.8720],
      rings: [
        { radius: 80, color: "#F5A623", opacity: 0.35, label: "STRUCTURAL COLLAPSE HAZARD" },
        { radius: 180, color: "#63C174", opacity: 0.15, label: "SAFE ISOLATION ZONE" }
      ]
    },
    droneRoute: {
      dronePos: [19.0685, 72.8710],
      launchPoint: [19.0620, 72.8640],
      waypoints: [
        [19.0650, 72.8670],
        [19.0685, 72.8710]
      ],
      incidentPos: [19.0690, 72.8720],
      recommendedPath: [
        [19.0685, 72.8710],
        [19.0690, 72.8720]
      ]
    }
  }
];

export const NEARBY_ASSET_DRONES = [
  {
    id: "DRONE-A12",
    callsign: "Drone A-12",
    type: "Surveillance & EO/IR",
    distance: "1.2 km",
    battery: 89,
    status: "Available",
    statusCode: "AVAILABLE",
    lat: 19.0815,
    lng: 72.8820,
    eta: "2 min 15 sec",
    payload: "4K EO / MLX90640 Radiometric IR"
  },
  {
    id: "DRONE-A03",
    callsign: "Drone A-03",
    type: "Heavy Lift & Supply Drop",
    distance: "2.8 km",
    battery: 64,
    status: "Available",
    statusCode: "AVAILABLE",
    lat: 19.0685,
    lng: 72.8710,
    eta: "4 min 40 sec",
    payload: "Fire Retardant Ball Drop / Winch"
  },
  {
    id: "DRONE-A07",
    callsign: "Drone A-07",
    type: "Lead Reconnaissance",
    distance: "0.4 km (On Station)",
    battery: 74,
    status: "On Scene",
    statusCode: "ON_SCENE",
    lat: 19.0745,
    lng: 72.8755,
    eta: "Current Tracker",
    payload: "Edge AI YOLOv8 + LiDAR"
  }
];
