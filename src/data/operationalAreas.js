// =========================================================================
// AERIS-01 OPERATIONAL DISASTER ZONES & AUTONOMOUS ROUTES DATASET
// Selecting an area dynamically updates all live maps, telemetry & AI detections
// =========================================================================

export const DISASTER_ZONES = [
  {
    id: "chamoli-flood",
    name: "Sector B-4: Chamoli Gorge (Flood Reconnaissance)",
    shortName: "Sector B-4 (Flood)",
    region: "Chamoli District, Uttarakhand",
    missionType: "Flood Rescue Reconnaissance",
    center: [30.3165, 78.0322],
    zoom: 15,
    altitude: 42.5,
    speed: 8.5,
    battery: 85,
    weather: "Overcast • Rain 14mm/h",
    currentCheckpoint: "CP-03",
    lastConnectedCheckpoint: "CP-03",
    coordinatesFormatted: "30.3165° N, 78.0322° E",
    survivorsCount: 3,
    hazardsCount: 2,
    flightPaths: {
      completed: [
        [30.3100, 78.0230],
        [30.3120, 78.0260],
        [30.3145, 78.0295],
        [30.3165, 78.0322]
      ],
      upcoming: [
        [30.3165, 78.0322],
        [30.3190, 78.0360],
        [30.3220, 78.0400]
      ],
      backtrack: [
        [30.3255, 78.0435],
        [30.3240, 78.0415],
        [30.3225, 78.0395],
        [30.3210, 78.0375]
      ]
    },
    checkpoints: [
      { id: "CP-01", label: "CP-01", name: "Valley Ingress", lat: 30.3120, lng: 78.0260, status: "PASSED", isDone: true },
      { id: "CP-02", label: "CP-02", name: "Bridge Approach", lat: 30.3145, lng: 78.0295, status: "PASSED", isDone: true },
      { id: "CP-03", label: "CP-03", name: "Ridge Overlook", lat: 30.3165, lng: 78.0322, status: "ACTIVE", isDone: true, isLastConnected: true },
      { id: "CP-04", label: "CP-04", name: "Flooded Sector B-4", lat: 30.3190, lng: 78.0360, status: "IN_PROGRESS", isDone: false },
    ],
    detections: [
      { id: "DET-01", label: "PERSON DETECTED", confidence: 96, location: "Rooftop Sector B-4", lat: 30.3175, lng: 78.0330, type: "survivor" },
      { id: "DET-02", label: "RISING WATER SURGE", confidence: 94, location: "Bridge Pier 2", lat: 30.3150, lng: 78.0300, type: "hazard" },
    ]
  },
  {
    id: "rishikesh-landslide",
    name: "Sector A-2: Rishikesh Basin (Landslide Corridor)",
    shortName: "Sector A-2 (Landslide)",
    region: "Rishikesh Foothills, Uttarakhand",
    missionType: "Landslide Evacuation Corridor",
    center: [30.1200, 78.3000],
    zoom: 15,
    altitude: 55.0,
    speed: 9.2,
    battery: 78,
    weather: "Foggy • Vis 800m",
    currentCheckpoint: "CP-02",
    lastConnectedCheckpoint: "CP-02",
    coordinatesFormatted: "30.1200° N, 78.3000° E",
    survivorsCount: 2,
    hazardsCount: 3,
    flightPaths: {
      completed: [
        [30.1140, 78.2930],
        [30.1170, 78.2965],
        [30.1200, 78.3000]
      ],
      upcoming: [
        [30.1200, 78.3000],
        [30.1235, 78.3040],
        [30.1265, 78.3080]
      ],
      backtrack: [
        [30.1265, 78.3080],
        [30.1235, 78.3040],
        [30.1200, 78.3000]
      ]
    },
    checkpoints: [
      { id: "CP-01", label: "CP-01", name: "Highway LZ", lat: 30.1140, lng: 78.2930, status: "PASSED", isDone: true },
      { id: "CP-02", label: "CP-02", name: "Debris Slope Base", lat: 30.1200, lng: 78.3000, status: "ACTIVE", isDone: true, isLastConnected: true },
      { id: "CP-03", label: "CP-03", name: "Upper Mudflow Ridge", lat: 30.1235, lng: 78.3040, status: "IN_PROGRESS", isDone: false },
      { id: "CP-04", label: "CP-04", name: "Stranded Vehicle Cluster", lat: 30.1265, lng: 78.3080, status: "QUEUED", isDone: false },
    ],
    detections: [
      { id: "DET-01", label: "TRAPPED SURVIVOR", confidence: 98, location: "Slope Clearing A-2", lat: 30.1210, lng: 78.3015, type: "survivor" },
      { id: "DET-02", label: "UNSTABLE ROCKFACE", confidence: 91, location: "Upper Ridge", lat: 30.1240, lng: 78.3050, type: "hazard" },
    ]
  },
  {
    id: "kedarnath-avalanche",
    name: "Sector C-1: Kedarnath Valley (Avalanche & Thermal Scan)",
    shortName: "Sector C-1 (Avalanche)",
    region: "Kedarnath Glacier Range, Uttarakhand",
    missionType: "Avalanche Search & Rescue",
    center: [30.7350, 79.0660],
    zoom: 15,
    altitude: 60.0,
    speed: 7.8,
    battery: 81,
    weather: "Sub-Zero -8°C • High Wind 22km/h",
    currentCheckpoint: "CP-03",
    lastConnectedCheckpoint: "CP-03",
    coordinatesFormatted: "30.7350° N, 79.0660° E",
    survivorsCount: 4,
    hazardsCount: 2,
    flightPaths: {
      completed: [
        [30.7280, 79.0580],
        [30.7315, 79.0620],
        [30.7350, 79.0660]
      ],
      upcoming: [
        [30.7350, 79.0660],
        [30.7385, 79.0700],
        [30.7420, 79.0740]
      ],
      backtrack: [
        [30.7420, 79.0740],
        [30.7385, 79.0700],
        [30.7350, 79.0660]
      ]
    },
    checkpoints: [
      { id: "CP-01", label: "CP-01", name: "Helipad Staging", lat: 30.7280, lng: 79.0580, status: "PASSED", isDone: true },
      { id: "CP-02", label: "CP-02", name: "Glacier Moraine", lat: 30.7315, lng: 79.0620, status: "PASSED", isDone: true },
      { id: "CP-03", label: "CP-03", name: "East Ridge Col", lat: 30.7350, lng: 79.0660, status: "ACTIVE", isDone: true, isLastConnected: true },
      { id: "CP-04", label: "CP-04", name: "Upper Snowfield", lat: 30.7385, lng: 79.0700, status: "IN_PROGRESS", isDone: false },
    ],
    detections: [
      { id: "DET-01", label: "THERMAL HEAT SIGNATURE (37.1°C)", confidence: 97, location: "Snow Cavity C-1", lat: 30.7360, lng: 79.0675, type: "survivor" },
      { id: "DET-02", label: "CORNICE COLLAPSE RISK", confidence: 89, location: "Glacier Edge", lat: 30.7390, lng: 79.0710, type: "hazard" },
    ]
  }
];
