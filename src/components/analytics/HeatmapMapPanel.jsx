import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Layers, 
  Flame, 
  Users, 
  Waves, 
  AlertTriangle, 
  HeartPulse, 
  Navigation, 
  Radio,
  Eye,
  Sliders
} from 'lucide-react';

// 1. Drone Asset Marker Generator
const createDroneMarker = (callsign, status, heading) => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1px solid #3B9EFF; color: #F2F4F3; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 0.5px 4px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px rgba(59,158,255,0.4);">
          ${callsign} • ● ${status}
        </div>
        <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(59, 158, 255, 0.35); animation: ping-subtle 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: #07090B; border: 2px solid #3B9EFF; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 12px #3B9EFF;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#3B9EFF">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-drone-analytics-icon',
    iconSize: [90, 44],
    iconAnchor: [45, 30],
    popupAnchor: [0, -30]
  });
};

// 2. Incident Marker Generator
const createIncidentIcon = (type, color, label) => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1px solid ${color}; color: ${color}; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 0.5px 3px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 8px ${color}60;">
          ${label}
        </div>
        <div style="width: 24px; height: 24px; border-radius: 50%; background: ${color}25; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}80;">
          <span style="font-size: 11px;">
            ${type === 'FIRE' ? '🔥' : type === 'CROWD' ? '👥' : type === 'FLOOD' ? '🌊' : type === 'MEDICAL' ? '🚑' : '⚠'}
          </span>
        </div>
      </div>
    `,
    className: 'aeris-incident-analytics-icon',
    iconSize: [90, 44],
    iconAnchor: [45, 28],
    popupAnchor: [0, -28]
  });
};

export default function HeatmapMapPanel({
  heatmapRegions = [],
  incidents = [],
  drones = [],
  flightPaths
}) {
  const [heatmapMode, setHeatmapMode] = useState('LIVE'); // 'LIVE' | 'HISTORICAL' | 'PREDICTION'
  const [activeLayers, setActiveLayers] = useState({
    heatmap: true,
    incidents: true,
    drones: true,
    paths: true,
    criticalZone: true
  });

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const centerPos = [30.5540, 79.5580];

  return (
    <div className="w-full h-full bg-[#15191C] border border-white/5 rounded-2xl flex flex-col overflow-hidden select-none shadow-2xl relative">
      {/* 1. Header & Controls */}
      <div className="h-10 px-3.5 bg-[#181D20] border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#3B9EFF]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            AI Risk & Activity Heatmap
          </h2>
        </div>

        {/* Heatmap Segmented Mode: Live Activity | Historical | Risk Prediction */}
        <div className="hidden sm:flex items-center space-x-1 p-0.5 rounded-pill bg-[#131719] border border-white/5 text-[10px] font-mono">
          {[
            { id: 'LIVE', label: '● Live Activity' },
            { id: 'HISTORICAL', label: 'Historical' },
            { id: 'PREDICTION', label: 'Risk Prediction' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setHeatmapMode(mode.id)}
              className={`px-2.5 py-0.5 rounded-pill transition-all font-semibold ${
                heatmapMode === mode.id
                  ? 'bg-[#1C2125] text-[#3B9EFF] border border-white/10 shadow-sm'
                  : 'text-[#8B949E] hover:text-[#E8ECEF]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center space-x-1 text-[9.5px] font-mono">
          <button
            onClick={() => toggleLayer('heatmap')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.heatmap 
                ? 'bg-[#FF4D3D]/20 border-[#FF4D3D] text-[#FF4D3D] font-bold' 
                : 'bg-[#1C2125] border-white/5 text-[#8B949E]'
            }`}
          >
            HEATMAP
          </button>

          <button
            onClick={() => toggleLayer('drones')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.drones 
                ? 'bg-[#3B9EFF]/20 border-[#3B9EFF] text-[#3B9EFF] font-bold' 
                : 'bg-[#1C2125] border-white/5 text-[#8B949E]'
            }`}
          >
            DRONES ({drones.length})
          </button>

          <button
            onClick={() => toggleLayer('incidents')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.incidents 
                ? 'bg-[#F5A623]/20 border-[#F5A623] text-[#F5A623] font-bold' 
                : 'bg-[#1C2125] border-white/5 text-[#8B949E]'
            }`}
          >
            INCIDENTS ({incidents.length})
          </button>
        </div>
      </div>

      {/* 2. Main Satellite Map Canvas */}
      <div className="flex-1 w-full h-full relative min-h-0">
        <MapContainer
          center={centerPos}
          zoom={14}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* Dark Satellite Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri Satellite</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            className="dark-satellite-tiles"
            maxZoom={18}
          />

          {/* 3. AI Risk Heatmap Regions (Geographically Blended) */}
          {activeLayers.heatmap && heatmapRegions.map((region) => (
            <Circle
              key={region.id}
              center={region.center}
              radius={region.radius}
              pathOptions={{
                color: region.color,
                weight: 1.5,
                fillColor: region.color,
                fillOpacity: region.opacity,
                dashArray: '3, 4'
              }}
            >
              <Tooltip direction="center" className="font-mono text-xs text-slate-100 bg-[#07090B]/90 border border-white/10">
                {region.label}
              </Tooltip>
            </Circle>
          ))}

          {/* 4. Critical Activity Zone Boundary */}
          {activeLayers.criticalZone && (
            <Circle
              center={[30.5620, 79.5690]}
              radius={280}
              pathOptions={{
                color: '#FF4D3D',
                weight: 2,
                fillColor: 'rgba(255, 77, 61, 0.12)',
                dashArray: '4, 6'
              }}
            >
              <Tooltip direction="top" className="font-mono text-[9px] text-[#FF4D3D] bg-black/90 font-bold">
                CRITICAL ACTIVITY ZONE (SECTOR B-12)
              </Tooltip>
            </Circle>
          )}

          {/* 5. Drone Coverage Radii */}
          {activeLayers.drones && drones.map((drone) => (
            <Circle
              key={`coverage-${drone.id}`}
              center={[drone.lat, drone.lng]}
              radius={drone.coverageRadius}
              pathOptions={{
                color: '#3B9EFF',
                weight: 1,
                fillColor: 'rgba(59, 158, 255, 0.06)',
                dashArray: '2, 4'
              }}
            />
          ))}

          {/* 6. Drone Flight Paths (Current = solid, Completed = faded, Planned = dashed) */}
          {activeLayers.paths && flightPaths && (
            <>
              {/* Completed Flight Route (Faded Line) */}
              <Polyline
                positions={flightPaths.completed}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 2,
                  opacity: 0.4
                }}
              />
              {/* Current Active Mission Route (Solid Electric Blue) */}
              <Polyline
                positions={flightPaths.current}
                pathOptions={{
                  color: '#3B9EFF',
                  weight: 3,
                  opacity: 0.95
                }}
              />
              {/* Planned Route (Dashed Line) */}
              <Polyline
                positions={flightPaths.planned}
                pathOptions={{
                  color: '#F5A623',
                  weight: 2,
                  dashArray: '5, 5',
                  opacity: 0.8
                }}
              />
            </>
          )}

          {/* 7. Incident Markers (Fire, Crowd, Flood, Structure, Medical) */}
          {activeLayers.incidents && incidents.map((inc) => (
            <Marker
              key={inc.id}
              position={[inc.lat, inc.lng]}
              icon={createIncidentIcon(inc.type, inc.color, inc.title)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-[#E8ECEF]">{inc.title}</span>
                    <span className="text-[10px] font-mono font-bold text-[#63C174]">{inc.confidence}% CONF</span>
                  </div>
                  <p className="text-[10.5px] text-[#8B949E] font-mono">Location: <strong className="text-[#E8ECEF]">{inc.location}</strong></p>
                  <p className="text-[10.5px] text-[#A0AAB0] mt-1">{inc.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 8. Active Drone Markers (AERIS-04, AERIS-07, AERIS-02) */}
          {activeLayers.drones && drones.map((drone) => (
            <Marker
              key={drone.id}
              position={[drone.lat, drone.lng]}
              icon={createDroneMarker(drone.callsign, drone.status, drone.heading)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-[#3B9EFF] font-mono">{drone.callsign}</span>
                    <span className="text-[#63C174] text-[9.5px] font-mono">● {drone.status}</span>
                  </div>
                  <div className="space-y-0.5 text-[10.5px] font-mono text-[#8B949E]">
                    <p>Battery: <strong className="text-[#63C174]">{drone.battery}%</strong> • Alt: <strong className="text-[#E8ECEF]">{drone.altitude}</strong></p>
                    <p>Speed: <strong className="text-[#E8ECEF]">{drone.speed}</strong> • Cov Radius: <strong className="text-[#3B9EFF]">{drone.coverageRadius}m</strong></p>
                    <p className="text-[10px] text-[#A0AAB0] pt-1">{drone.mission}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* 9. Heatmap Legend (Bottom-Left) */}
        {activeLayers.heatmap && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-[#111516]/95 border border-white/10 p-2 rounded-xl backdrop-blur-md font-mono text-[9px] shadow-lg pointer-events-auto space-y-1">
            <div className="text-[#8B949E] font-bold uppercase tracking-wider text-[8px] border-b border-white/5 pb-0.5">
              ACTIVITY INTENSITY
            </div>
            <div className="flex items-center space-x-2.5 text-[8.5px]">
              <span className="flex items-center text-[#63C174]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#63C174] mr-1"></span>
                LOW
              </span>
              <span className="flex items-center text-[#E2A24C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2A24C] mr-1"></span>
                MED
              </span>
              <span className="flex items-center text-[#F5A623]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F5A623] mr-1"></span>
                HIGH
              </span>
              <span className="flex items-center text-[#FF4D3D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D3D] mr-1 shadow-[0_0_6px_#FF4D3D]"></span>
                CRIT
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
