import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Flame, 
  ShieldAlert, 
  AlertTriangle, 
  Disc, 
  Camera, 
  Crosshair, 
  Maximize2, 
  Layers, 
  Radio, 
  Eye,
  Sparkles,
  Wifi
} from 'lucide-react';

// 1. Drone Marker Generator for Fleet Assets (A-07, A-12, A-03)
const createAssetDroneMarker = (callsign, isSelected) => {
  const color = isSelected ? '#3B9EFF' : '#63C174';
  const pulseColor = isSelected ? 'rgba(59, 158, 255, 0.4)' : 'rgba(99, 193, 116, 0.3)';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1px solid ${color}; color: #F2F4F3; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 0.5px 4px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px ${pulseColor};">
          ${callsign}
        </div>
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: ${pulseColor}; animation: ping-subtle 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #07090B; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-fleet-marker',
    iconSize: [80, 44],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30]
  });
};

// 2. Incident Location Marker (Prominent Fire / Threat marker with pulsing outer ring)
const createIncidentCenterMarker = (incident) => {
  const isFire = incident.category === 'FIRE';
  const color = incident.severityColor || '#FF4D3D';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1.5px solid ${color}; color: ${color}; font-family: monospace; font-size: 8px; font-weight: 700; padding: 1px 5px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px ${color}80; letter-spacing: 0.5px;">
          ${incident.title} [${incident.confidence}%]
        </div>
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${color}40; animation: ping-subtle 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 26px; height: 26px; border-radius: 50%; background: #07090B; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px ${color};">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${color}">
              ${isFire 
                ? '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'
                : '<path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>'
              }
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-incident-marker',
    iconSize: [120, 52],
    iconAnchor: [60, 36],
    popupAnchor: [0, -36]
  });
};

export default function IncidentMap({ 
  incident, 
  nearbyDrones = [] 
}) {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [cameraMode, setCameraMode] = useState('RGB'); // RGB | THERMAL | AI

  const centerPos = [incident.lat, incident.lng];

  return (
    <div className="w-full h-full bg-[#15191C] border border-white/5 rounded-2xl flex flex-col overflow-hidden relative select-none shadow-2xl">
      {/* 1. Top Map Bar */}
      <div className="h-9 px-3.5 bg-[#181D20] border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Navigation className="w-3.5 h-3.5 text-[#3B9EFF] animate-pulse" />
          <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Tactical Incident Map
          </h2>
          <span className="text-[9.5px] font-mono text-[#8B949E] hidden sm:inline">
            ({incident.location} • {incident.coordinates})
          </span>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showHeatmap 
                ? 'bg-[#FF4D3D]/20 border-[#FF4D3D] text-[#FF4D3D] font-bold' 
                : 'bg-[#1C2125] border-white/5 text-[#8B949E]'
            }`}
          >
            HEAT MAP
          </button>

          <button
            onClick={() => setShowRoutes(!showRoutes)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showRoutes 
                ? 'bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF] font-bold' 
                : 'bg-[#1C2125] border-white/5 text-[#8B949E]'
            }`}
          >
            FLIGHT PATHS
          </button>
        </div>
      </div>

      {/* 2. Main Leaflet Satellite Map Canvas */}
      <div className="flex-1 w-full h-full relative min-h-0">
        <MapContainer
          center={centerPos}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* Dark Satellite Basemap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri Satellite</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            className="dark-satellite-tiles"
            maxZoom={18}
          />

          {/* 3. AI-Generated Localized Risk Heat Map Layer */}
          {showHeatmap && incident.heatmap?.rings?.map((ring, idx) => (
            <Circle
              key={idx}
              center={incident.heatmap.center}
              radius={ring.radius}
              pathOptions={{
                color: ring.color,
                weight: 1.5,
                fillColor: ring.color,
                fillOpacity: ring.opacity,
                dashArray: '3, 4'
              }}
            >
              <Tooltip direction="center" className="font-mono text-xs text-slate-100 bg-[#07090B]/90 border border-white/10">
                {ring.label}
              </Tooltip>
            </Circle>
          ))}

          {/* 4. AI Detection Zone Outer Ring */}
          <Circle
            center={centerPos}
            radius={200}
            pathOptions={{
              color: '#3B9EFF',
              weight: 1,
              fillColor: 'transparent',
              dashArray: '4, 8'
            }}
          >
            <Tooltip direction="top" className="font-mono text-[9px] text-[#3B9EFF] bg-black/80">
              AI DETECTION AREA (200m RADIUS)
            </Tooltip>
          </Circle>

          {/* 5. Drone Flight Paths (Solid White for completed, Blue for mission, Dashed for recommended) */}
          {showRoutes && incident.droneRoute && (
            <>
              {/* Solid White Line: Completed flight path */}
              <Polyline
                positions={[
                  incident.droneRoute.launchPoint,
                  ...incident.droneRoute.waypoints
                ]}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 2.5,
                  opacity: 0.85
                }}
              />

              {/* Blue Line: Current mission route to incident */}
              <Polyline
                positions={[
                  incident.droneRoute.dronePos,
                  incident.droneRoute.incidentPos
                ]}
                pathOptions={{
                  color: '#3B9EFF',
                  weight: 3,
                  opacity: 0.95
                }}
              />

              {/* Dashed Line: Recommended patrol perimeter path */}
              <Polyline
                positions={incident.droneRoute.recommendedPath}
                pathOptions={{
                  color: '#F5A623',
                  weight: 2,
                  dashArray: '5, 5',
                  opacity: 0.85
                }}
              >
                <Tooltip sticky direction="top" className="font-mono text-[9px] text-amber-300 bg-black/90">
                  RECOMMENDED PERIMETER SWEEP
                </Tooltip>
              </Polyline>
            </>
          )}

          {/* 6. Active Incident Center Marker */}
          <Marker
            position={centerPos}
            icon={createIncidentCenterMarker(incident)}
          >
            <Popup>
              <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                  <span className="font-bold text-[#FF4D3D]">{incident.title}</span>
                  <span className="text-[10px] font-mono font-bold text-[#63C174]">{incident.confidence}% CONF</span>
                </div>
                <p className="text-[11px] text-[#8B949E] font-mono">Location: <strong className="text-[#E8ECEF]">{incident.location}</strong></p>
                <p className="text-[10.5px] text-[#8B949E] mt-1">{incident.description}</p>
              </div>
            </Popup>
          </Marker>

          {/* 7. Nearby Asset Drone Markers (A-07, A-12, A-03) */}
          {nearbyDrones.map((drone) => (
            <Marker
              key={drone.id}
              position={[drone.lat, drone.lng]}
              icon={createAssetDroneMarker(drone.callsign, drone.callsign === incident.droneCallsign)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <span className="font-bold text-[#3B9EFF]">{drone.callsign}</span>
                  <p className="text-[10.5px] text-[#8B949E]">Battery: <strong className="text-[#63C174]">{drone.battery}%</strong> • {drone.status}</p>
                  <p className="text-[10px] text-[#8B949E]">{drone.payload}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 8. FLOATING LIVE DRONE CAMERA FEED (Bottom-Left ~35% Width, 16:9 Aspect Ratio) */}
        <div className="absolute bottom-3 left-3 z-[1000] w-[42%] max-w-[280px] bg-[#111516]/95 border border-white/15 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md pointer-events-auto select-none">
          {/* Camera Header Bar */}
          <div className="px-2.5 py-1 bg-[#181D20]/90 border-b border-white/10 flex items-center justify-between text-[9.5px] font-mono">
            <span className="flex items-center text-[#FF4D3D] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D3D] mr-1 animate-pulse"></span>
              LIVE FEED
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-[#3B9EFF] font-bold">{incident.droneCallsign}</span>
              <span className="text-white/40">|</span>
              <Wifi className="w-2.5 h-2.5 text-[#63C174]" />
            </div>
          </div>

          {/* Simulated 16:9 Realistic Aerial Drone Video Canvas */}
          <div className="relative aspect-video bg-[#07090B] overflow-hidden flex flex-col justify-between p-2">
            {/* Dynamic Environment Visuals based on incident category */}
            {incident.category === 'FIRE' ? (
              <>
                {/* Forest Canopy Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#1b2615] via-[#2d1b0a] to-[#120a05]"></div>
                {/* Smoke Plume Gradient */}
                <div className="absolute top-0 right-4 w-32 h-24 bg-white/20 blur-xl rounded-full animate-pulse"></div>
                {/* Fire Hotspot */}
                <div className="absolute bottom-2 left-10 w-16 h-12 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-300 rounded-full blur-md opacity-90 animate-pulse"></div>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-[#121B24] to-[#0A1016]"></div>
                <div className="absolute top-4 left-6 w-20 h-14 bg-black/40 border border-white/10 rounded"></div>
              </>
            )}

            {/* AI Bounding Box Overlay */}
            <div className="relative z-10 flex items-center justify-center h-full pointer-events-none">
              <div className="border-2 border-[#FF4D3D] rounded bg-[#FF4D3D]/10 p-1 flex flex-col justify-between w-28 h-16 animate-pulse">
                <span className="text-[7.5px] font-mono bg-[#FF4D3D] text-white font-bold px-1 rounded w-fit">
                  {incident.cameraFeed.targetBox.label}
                </span>
                <span className="text-[7px] font-mono text-[#FF4D3D] font-bold self-end">
                  CONF: {incident.cameraFeed.targetBox.confidence}%
                </span>
              </div>
            </div>

            {/* Bottom Overlay Telemetry: ALT 120m | SPD 8.4 m/s | BAT 74% */}
            <div className="relative z-10 flex items-center justify-between text-[8px] font-mono bg-black/70 px-1.5 py-0.5 rounded border border-white/10 text-[#E8ECEF]">
              <span>ALT {incident.cameraFeed.alt}</span>
              <span className="text-white/40">|</span>
              <span>SPD {incident.cameraFeed.speed}</span>
              <span className="text-white/40">|</span>
              <span className="text-[#63C174]">BAT {incident.cameraFeed.battery}%</span>
            </div>
          </div>
        </div>

        {/* 9. Minimal Heat Map Legend (Bottom-Right) */}
        {showHeatmap && (
          <div className="absolute bottom-3 right-3 z-[1000] bg-[#111516]/95 border border-white/10 p-2 rounded-xl backdrop-blur-md font-mono text-[9px] shadow-lg pointer-events-auto space-y-1">
            <div className="text-[#8B949E] font-bold uppercase tracking-wider text-[8px] border-b border-white/5 pb-0.5">
              AI RISK RADIUS
            </div>
            <div className="flex items-center space-x-2 text-[8.5px]">
              <span className="flex items-center text-[#63C174]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63C174] mr-1"></span>
                LOW
              </span>
              <span className="flex items-center text-[#F5A623]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] mr-1"></span>
                MED
              </span>
              <span className="flex items-center text-[#FF4D3D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D3D] mr-1 shadow-[0_0_6px_#FF4D3D]"></span>
                HIGH
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
