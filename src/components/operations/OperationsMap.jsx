import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, Radio, Wifi, Layers } from 'lucide-react';

// Drone Marker for AERIS-01 on Operations Map
const createOperationsDroneIcon = (heading, isOffline, isBacktrack) => {
  const color = isBacktrack ? '#F5A623' : isOffline ? '#FF4D3D' : '#3B9EFF';
  const pulseColor = isBacktrack ? 'rgba(245, 166, 35, 0.4)' : isOffline ? 'rgba(255, 77, 61, 0.4)' : 'rgba(59, 158, 255, 0.4)';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1.5px solid ${color}; color: #F2F4F3; font-family: monospace; font-size: 8px; font-weight: 700; padding: 1px 5px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px ${pulseColor}; letter-spacing: 0.5px;">
          AERIS-01 • ALT: 42.5 m
        </div>
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${pulseColor}; animation: ping-subtle 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #07090B; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 12px ${color};">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-op-drone-icon',
    iconSize: [110, 48],
    iconAnchor: [55, 32],
    popupAnchor: [0, -32]
  });
};

// Checkpoint Marker for Operations Map
const createOperationsCpIcon = (cp) => {
  const isDone = cp.isDone;
  const isLast = cp.isLastConnected;
  const color = isLast ? '#63C174' : isDone ? '#3B9EFF' : '#58605E';
  const bg = isLast ? 'rgba(99, 193, 116, 0.25)' : isDone ? '#181D1E' : '#0B0E0F';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${isLast ? `
          <div style="background: #111516; border: 1px solid #63C174; color: #63C174; font-family: monospace; font-size: 7px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap;">
            📶 LAST CONNECTED
          </div>
        ` : ''}
        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${bg}; border: 1.5px solid ${color}; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 8.5px; font-weight: bold; color: ${isDone ? '#F2F4F3' : '#8C9492'}; box-shadow: 0 0 8px ${isLast ? 'rgba(99,193,116,0.6)' : 'rgba(59,158,255,0.3)'};">
          ${cp.label.replace('CP-', '')}
        </div>
        <div style="background: rgba(7, 9, 9, 0.85); color: #8C9492; font-family: monospace; font-size: 7px; padding: 0.5px 3px; border-radius: 2px; margin-top: 1px;">
          ${cp.label} ${isDone ? '✓' : '○'}
        </div>
      </div>
    `,
    className: 'aeris-op-cp-icon',
    iconSize: [100, 44],
    iconAnchor: [50, 30],
    popupAnchor: [0, -30]
  });
};

export default function OperationsMap({
  checkpoints = [],
  flightPaths,
  flightTelemetry,
  isOffline = false,
  isBacktracking = false
}) {
  const currentPos = [30.3165, 78.0322]; // CP-03 Current Location

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl flex flex-col overflow-hidden relative select-none shadow-2xl">
      {/* Header */}
      <div className="h-9 px-3.5 bg-[#181D20] border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Navigation className="w-3.5 h-3.5 text-[#3B9EFF] animate-pulse" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Live Position Map
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[9.5px] font-mono text-[#8B949E]">
          <span>MISSION: <strong className="text-[#E8ECEF]">CP-03 → CP-04 (1.2 km)</strong></span>
          <span className="text-white/20">|</span>
          <span className="text-[#63C174] font-bold">● RTK FIX</span>
        </div>
      </div>

      {/* Main Satellite Canvas */}
      <div className="flex-1 w-full h-full relative min-h-0">
        <MapContainer
          center={currentPos}
          zoom={15}
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

          {/* Completed Flight Route (Muted blue/gray) */}
          <Polyline
            positions={flightPaths.completed}
            pathOptions={{
              color: isBacktracking ? 'rgba(59, 158, 255, 0.4)' : '#3B9EFF',
              weight: 3,
              opacity: 0.9,
              dashArray: '3, 6'
            }}
          />

          {/* Upcoming Planned Route (Soft blue/white) */}
          {!isOffline && !isBacktracking && (
            <Polyline
              positions={flightPaths.upcoming}
              pathOptions={{
                color: '#FFFFFF',
                weight: 1.5,
                opacity: 0.5,
                dashArray: '4, 8'
              }}
            />
          )}

          {/* Backtracking Route (Amber/Orange Dashed Line) */}
          {isBacktracking && (
            <Polyline
              positions={flightPaths.backtrack}
              pathOptions={{
                color: '#F5A623',
                weight: 3.5,
                opacity: 0.95,
                dashArray: '6, 6'
              }}
            >
              <Tooltip sticky direction="top" className="font-mono text-xs text-amber-300 bg-black/90">
                ◄ AUTONOMOUS BACKTRACKING: Returning to CP-03
              </Tooltip>
            </Polyline>
          )}

          {/* Checkpoint Markers (CP-01 to CP-04) */}
          {checkpoints.map((cp) => (
            <Marker
              key={cp.id}
              position={[cp.lat, cp.lng]}
              icon={createOperationsCpIcon(cp)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-[#E8ECEF]">{cp.label}: {cp.name}</span>
                    <span className="text-[#63C174] text-[9.5px] font-mono">{cp.status}</span>
                  </div>
                  {cp.isLastConnected && (
                    <p className="text-[#63C174] font-bold text-[10px] font-mono mt-0.5">
                      📶 LAST KNOWN CONNECTED CHECKPOINT (CP-03)
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Active AERIS-01 Drone Marker */}
          <Marker
            position={currentPos}
            icon={createOperationsDroneIcon(42, isOffline, isBacktracking)}
          >
            <Popup>
              <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                <span className="font-bold text-[#3B9EFF] font-mono">AERIS-01</span>
                <p className="text-[10.5px] text-[#8B949E] font-mono">Alt: 42.5m AGL • Speed: 8.5 m/s</p>
                <p className="text-[10px] text-[#63C174] font-mono">Status: AUTONOMOUS SEARCH</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Backtracking Banner over Map when Active */}
        {isBacktracking && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-[1000] bg-[#111516]/95 border border-[#F5A623]/60 px-3 py-1 rounded-xl backdrop-blur-md font-mono text-[10.5px] text-[#F5A623] font-bold shadow-[0_0_12px_rgba(245,166,35,0.4)] flex items-center space-x-2 pointer-events-auto">
            <Radio className="w-3.5 h-3.5 animate-spin text-[#F5A623]" />
            <span>AUTONOMOUS BACKTRACKING IN PROGRESS: RETURNING TO CP-03 (72%)</span>
          </div>
        )}

        {/* Bottom-Right Coordinates Overlay */}
        <div className="absolute bottom-2.5 right-2.5 z-[1000] bg-[#111516]/95 border border-white/10 px-2.5 py-1 rounded-xl backdrop-blur-md font-mono text-[9px] text-[#8B949E]">
          LAT: 30.3165° N • LNG: 78.0322° E • WGS84
        </div>
      </div>
    </div>
  );
}
