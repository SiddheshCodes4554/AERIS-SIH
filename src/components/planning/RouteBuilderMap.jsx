import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Home, 
  MapPin, 
  Wifi, 
  Navigation, 
  Layers, 
  Plus, 
  Minus, 
  Crosshair, 
  Sparkles,
  Trash2
} from 'lucide-react';

// 1. Home Base Marker (AERIS Command Station)
const createHomeBaseIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1.5px solid #63C174; color: #63C174; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 1px 5px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px rgba(99,193,116,0.6);">
          ⌂ HOME BASE LZ
        </div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #070909; border: 2px solid #63C174; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 14px #63C174;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#63C174" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </div>
    `,
    className: 'aeris-home-icon',
    iconSize: [100, 48],
    iconAnchor: [50, 34],
    popupAnchor: [0, -34]
  });
};

// 2. Waypoint Marker (WP-01 to WP-04)
const createWaypointIcon = (wp) => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1px solid #3B9EFF; color: #3B9EFF; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 8px rgba(59,158,255,0.4);">
          ${wp.label}
        </div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background: rgba(59, 158, 255, 0.25); border: 2px solid #3B9EFF; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 9px; font-weight: bold; color: #F2F4F3; box-shadow: 0 0 10px #3B9EFF;">
          ${wp.label.replace('WP-', '')}
        </div>
      </div>
    `,
    className: 'aeris-wp-icon',
    iconSize: [80, 44],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30]
  });
};

// 3. Communication Checkpoint Marker (CP-01 to CP-03)
const createCheckpointIcon = (cp) => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1px solid #F5A623; color: #F5A623; font-family: monospace; font-size: 7px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 8px rgba(245,166,35,0.5);">
          📶 ${cp.label}
        </div>
        <div style="width: 20px; height: 20px; border-radius: 4px; background: rgba(245, 166, 35, 0.25); border: 1.5px solid #F5A623; display: flex; align-items: center; justify-content: center; transform: rotate(45deg); box-shadow: 0 0 10px #F5A623;">
          <div style="transform: rotate(-45deg); font-family: monospace; font-size: 7.5px; font-weight: bold; color: #F2F4F3;">
            CP
          </div>
        </div>
      </div>
    `,
    className: 'aeris-cp-planning-icon',
    iconSize: [90, 44],
    iconAnchor: [45, 30],
    popupAnchor: [0, -30]
  });
};

export default function RouteBuilderMap({ 
  plan, 
  onAddWaypoint, 
  onAutoGenerateCheckpoints,
  onClearRoute 
}) {
  const [showMissionArea, setShowMissionArea] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);

  // Full planned route sequence connecting: Home -> WP-01 -> WP-02 -> WP-03 -> WP-04 -> Home
  const routePoints = [
    [plan.homeBase.lat, plan.homeBase.lng],
    ...plan.waypoints.map(w => [w.lat, w.lng]),
    [plan.homeBase.lat, plan.homeBase.lng] // Return to home
  ];

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl flex flex-col overflow-hidden relative select-none shadow-2xl">
      {/* 1. Top Map Bar */}
      <div className="h-9 px-3.5 bg-[#181D20] border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Navigation className="w-3.5 h-3.5 text-[#3B9EFF] animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Mission Route & Waypoint Builder
          </h3>
        </div>

        {/* Map Header Quick Action Controls */}
        <div className="flex items-center space-x-1.5 text-[9.5px] font-mono">
          <button
            onClick={onAutoGenerateCheckpoints}
            className="px-2.5 py-0.5 rounded-pill bg-[#F5A623]/15 hover:bg-[#F5A623]/25 text-[#F5A623] border border-[#F5A623]/40 font-bold transition-all flex items-center space-x-1"
          >
            <Sparkles className="w-2.5 h-2.5" />
            <span>AUTO-GENERATE CHECKPOINTS</span>
          </button>

          <button
            onClick={() => setShowMissionArea(!showMissionArea)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showMissionArea ? 'bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF] font-bold' : 'bg-[#1C2125] border-white/5 text-[#8B949E]'
            }`}
          >
            ZONE AREA
          </button>
        </div>
      </div>

      {/* 2. Main Leaflet Satellite Map Canvas */}
      <div className="flex-1 w-full h-full relative min-h-0">
        <MapContainer
          center={[plan.homeBase.lat, plan.homeBase.lng]}
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

          {/* 3. Mission Area Polygon (Sector B - Flood Affected Region) */}
          {showMissionArea && (
            <Polygon
              positions={plan.missionArea.polygon}
              pathOptions={{
                color: '#3B9EFF',
                weight: 1.5,
                fillColor: '#3B9EFF',
                fillOpacity: 0.12,
                dashArray: '4, 6'
              }}
            >
              <Tooltip direction="center" className="font-mono text-xs text-slate-100 bg-[#070909]/90 border border-white/10 font-bold">
                {plan.missionArea.label}
              </Tooltip>
            </Polygon>
          )}

          {/* 4. Planned Flight Route (Solid Blue Line with directional dashes) */}
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#3B9EFF',
              weight: 3.5,
              opacity: 0.95
            }}
          >
            <Tooltip direction="top" className="font-mono text-xs text-[#3B9EFF] bg-black/90">
              AUTONOMOUS MISSION PATH (3.8 km)
            </Tooltip>
          </Polyline>

          {/* 5. Home Base Station Marker */}
          <Marker
            position={[plan.homeBase.lat, plan.homeBase.lng]}
            icon={createHomeBaseIcon()}
          >
            <Popup>
              <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                <span className="font-bold text-[#63C174] font-mono">{plan.homeBase.name}</span>
                <p className="text-[10.5px] text-[#8B949E] font-mono mt-0.5">Start & Return-To-Home Staging Point</p>
                <p className="text-[9.5px] text-[#3B9EFF] font-mono mt-0.5">{plan.homeBase.coordinatesFormatted}</p>
              </div>
            </Popup>
          </Marker>

          {/* 6. Waypoint Markers (WP-01 to WP-04) */}
          {plan.waypoints.map((wp) => (
            <Marker
              key={wp.id}
              position={[wp.lat, wp.lng]}
              icon={createWaypointIcon(wp)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-[#3B9EFF] font-mono">{wp.label}: {wp.name}</span>
                  </div>
                  <div className="space-y-0.5 text-[10.5px] font-mono text-[#8B949E]">
                    <p>Altitude Target: <strong className="text-[#E8ECEF]">{wp.altitude} m AGL</strong></p>
                    <p>Transit Speed: <strong className="text-[#63C174]">{wp.speed} m/s</strong></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 7. Communication Checkpoint Markers (CP-01 to CP-03) */}
          {showCheckpoints && plan.checkpoints.map((cp) => (
            <Marker
              key={cp.id}
              position={[cp.lat, cp.lng]}
              icon={createCheckpointIcon(cp)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-[#F5A623] font-mono">COMMUNICATION CHECKPOINT: {cp.label}</span>
                  </div>
                  <div className="space-y-0.5 text-[10.5px] font-mono text-[#8B949E]">
                    <p>Relay: <strong className="text-[#E8ECEF]">{cp.name}</strong></p>
                    <p>Signal Strength: <strong className="text-[#63C174]">{cp.signalQuality}</strong></p>
                    <p className="text-[#63C174] text-[9.5px] font-bold mt-1">✓ Connection Verified For Backtracking</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 8. Floating Route Interactive Action Bar */}
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center space-x-1.5 bg-[#111516]/95 border border-white/10 p-1.5 rounded-xl shadow-2xl backdrop-blur-md font-mono text-[9.5px] pointer-events-auto">
          <button
            onClick={onAddWaypoint}
            className="px-2.5 py-1 rounded-lg bg-[#181D1E] hover:bg-[#1C2125] text-[#3B9EFF] border border-white/5 flex items-center space-x-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>ADD WAYPOINT</span>
          </button>

          <button
            onClick={onAutoGenerateCheckpoints}
            className="px-2.5 py-1 rounded-lg bg-[#181D1E] hover:bg-[#1C2125] text-[#F5A623] border border-white/5 flex items-center space-x-1 transition-colors"
          >
            <Wifi className="w-3 h-3" />
            <span>ADD CHECKPOINT</span>
          </button>

          <button
            onClick={onClearRoute}
            className="px-2 py-1 rounded-lg bg-[#181D1E] hover:bg-[#FF4D3D]/20 text-[#8B949E] hover:text-[#FF4D3D] border border-white/5 flex items-center space-x-1 transition-colors"
            title="Clear Route"
          >
            <Trash2 className="w-3 h-3" />
            <span>CLEAR</span>
          </button>
        </div>

        {/* 9. Bottom-Right Coordinates / Route Telemetry Badge */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-[#111516]/95 border border-white/10 px-2.5 py-1.5 rounded-xl shadow-2xl backdrop-blur-md font-mono text-[9.5px] text-[#8B949E]">
          <span>TOTAL PATH: <strong className="text-[#3B9EFF]">3.8 km</strong> • WAYPOINTS: <strong className="text-[#E8ECEF]">{plan.waypoints.length}</strong> • CHECKPOINTS: <strong className="text-[#F5A623]">{plan.checkpoints.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
