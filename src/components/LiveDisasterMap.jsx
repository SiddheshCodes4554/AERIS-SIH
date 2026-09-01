import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Flame, 
  Waves, 
  AlertTriangle, 
  Building2, 
  Thermometer, 
  User, 
  Wifi, 
  Radio, 
  Layers, 
  Info,
  CheckCircle,
  Eye
} from 'lucide-react';

// 1. Tactical Drone Marker (AERIS-01) with Blue Ring, Heading Pointer & Altitude Tag
const createAeroDroneIcon = (heading, isOffline) => {
  const strokeColor = isOffline ? '#E2A24C' : '#3B8EDB';
  const pulseColor = isOffline ? 'rgba(226, 162, 76, 0.3)' : 'rgba(59, 142, 219, 0.35)';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Altitude and Callsign Tag -->
        <div style="background: #111516; border: 1px solid ${strokeColor}; color: #F2F4F3; font-family: monospace; font-size: 8.5px; font-weight: 700; padding: 1px 5px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px ${pulseColor}; letter-spacing: 0.5px;">
          AERIS-01 • 42.5m
        </div>
        <!-- Drone Center Disc with Heading Arrow -->
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${pulseColor}; animation: ping-subtle 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: #070909; border: 2px solid ${strokeColor}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 12px ${strokeColor};">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${strokeColor}">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-drone-marker',
    iconSize: [80, 52],
    iconAnchor: [40, 36],
    popupAnchor: [0, -36]
  });
};

// 2. Checkpoint Marker (CP-1 to CP-4) with Last Connected Wi-Fi Tag
const createCheckpointIcon = (cp) => {
  const isDone = cp.status === 'COMPLETED';
  const isLast = cp.isLastConnected;
  const borderColor = isLast ? '#62C370' : isDone ? '#3B8EDB' : '#58605E';
  const bg = isLast ? 'rgba(98, 195, 112, 0.2)' : isDone ? '#181D1E' : '#0B0E0F';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${isLast ? `
          <div style="background: #111516; border: 1px solid #62C370; color: #62C370; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; display: flex; align-items: center; gap: 2px;">
            <span>📶 LAST CONNECTED</span>
          </div>
        ` : ''}
        <div style="width: 22px; height: 22px; border-radius: 50%; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 9px; font-weight: bold; color: ${isDone ? '#F2F4F3' : '#8C9492'}; box-shadow: 0 0 8px ${isLast ? 'rgba(98,195,112,0.6)' : 'rgba(59,142,219,0.3)'};">
          ${cp.label.replace('CP-', '')}
        </div>
        <div style="background: rgba(7, 9, 9, 0.85); color: #8C9492; font-family: monospace; font-size: 7.5px; padding: 0.5px 3px; border-radius: 2px; margin-top: 1px;">
          ${cp.label} ${isDone ? '✓' : '○'}
        </div>
      </div>
    `,
    className: 'aeris-cp-marker',
    iconSize: [110, 48],
    iconAnchor: [55, 32],
    popupAnchor: [0, -32]
  });
};

// 3. Survivor Marker (Yellow Person Icon + Confidence Tag)
const createSurvivorMarker = (surv) => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1px solid #E2A24C; color: #E2A24C; font-family: monospace; font-size: 8px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 6px rgba(226,162,76,0.6);">
          👤 ${surv.confidence}% [${surv.priority.substring(0,4)}]
        </div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(226, 162, 76, 0.25); border: 2px solid #E2A24C; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(226, 162, 76, 0.8);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#E2A24C">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    `,
    className: 'aeris-survivor-marker',
    iconSize: [80, 48],
    iconAnchor: [40, 32],
    popupAnchor: [0, -32]
  });
};

// 4. Hazard Marker (Lucide Clean Icons: Fire, Flood, Collapse)
const createHazardMarker = (haz) => {
  const isFire = haz.type === 'FIRE';
  const isFlood = haz.type === 'FLOOD';
  const color = isFire ? '#FF453A' : isFlood ? '#00E5FF' : '#E2A24C';

  let iconSvg = '';
  if (isFire) {
    iconSvg = `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="${color}"/>`;
  } else if (isFlood) {
    iconSvg = `<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" stroke="${color}" stroke-width="2" fill="none"/>`;
  } else {
    iconSvg = `<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="${color}"/>`;
  }

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #111516; border: 1px solid ${color}; color: ${color}; font-family: monospace; font-size: 8px; font-weight: 700; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 6px ${color}60;">
          ${haz.label.substring(0, 14)}
        </div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: ${color}25; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}80;">
          <svg width="14" height="14" viewBox="0 0 24 24">
            ${iconSvg}
          </svg>
        </div>
      </div>
    `,
    className: 'aeris-hazard-marker',
    iconSize: [90, 48],
    iconAnchor: [45, 32],
    popupAnchor: [0, -32]
  });
};

export default function LiveDisasterMap({
  telemetry,
  checkpoints = [],
  flightRoutes,
  survivors = [],
  hazards = [],
  heatmapZones = [],
  isOfflineMode = false,
}) {
  const [activeLayers, setActiveLayers] = useState({
    route: true,
    checkpoints: true,
    survivors: true,
    hazards: true,
    heatmap: true,
  });

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setAllLayers = () => {
    setActiveLayers({
      route: true,
      checkpoints: true,
      survivors: true,
      hazards: true,
      heatmap: true,
    });
  };

  const dronePos = [telemetry.position.lat, telemetry.position.lng];

  return (
    <div className="flex-1 h-full aeris-panel-container flex flex-col overflow-hidden relative select-none">
      {/* 1. Map Top Control Bar */}
      <div className="h-11 px-4 bg-aeris-panel border-b border-aeris-border flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-aeris-cyan animate-pulse" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Live Disaster Map
          </h2>
          <span className="text-[10px] font-mono text-aeris-textMuted hidden sm:inline">
            (CHAMOLI SECTOR 4B)
          </span>
        </div>

        {/* Small Layer Pills (ALL, ROUTE, CHECKPOINTS, SURVIVORS, HAZARDS, HEAT MAP) */}
        <div className="flex items-center space-x-1 text-[10px] font-mono">
          <button
            onClick={setAllLayers}
            className="px-2 py-0.5 rounded-pill bg-aeris-surface hover:bg-aeris-surfaceHover text-aeris-textSecondary border border-aeris-border transition-colors"
          >
            ALL
          </button>

          <button
            onClick={() => toggleLayer('route')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.route 
                ? 'bg-aeris-blue/20 border-aeris-blue text-aeris-blue font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            ROUTE
          </button>

          <button
            onClick={() => toggleLayer('checkpoints')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.checkpoints 
                ? 'bg-aeris-green/20 border-aeris-green text-aeris-green font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            CHECKPOINTS
          </button>

          <button
            onClick={() => toggleLayer('survivors')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.survivors 
                ? 'bg-aeris-amber/20 border-aeris-amber text-aeris-amber font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            SURVIVORS ({survivors.length})
          </button>

          <button
            onClick={() => toggleLayer('hazards')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.hazards 
                ? 'bg-aeris-red/20 border-aeris-red text-aeris-red font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            HAZARDS ({hazards.length})
          </button>

          <button
            onClick={() => toggleLayer('heatmap')}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              activeLayers.heatmap 
                ? 'bg-aeris-purple/25 border-aeris-purple text-aeris-purple font-bold shadow-sm' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            HEAT MAP
          </button>
        </div>
      </div>

      {/* 2. Main Leaflet Satellite Map Canvas */}
      <div className="flex-1 relative w-full h-full">
        <MapContainer
          center={dronePos}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          {/* Dark Satellite Imagery Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri Satellite</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            className="dark-satellite-tiles"
            maxZoom={18}
          />

          {/* 3. Real Live Disaster Heat Map Layer (Directly on Satellite Map) */}
          {activeLayers.heatmap && heatmapZones.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                weight: 1.5,
                fillColor: zone.color,
                fillOpacity: zone.fillOpacity,
                dashArray: '3, 4'
              }}
            >
              <Tooltip direction="center" className="font-mono text-xs text-slate-100 bg-[#070909]/90 border border-white/10">
                {zone.label}
              </Tooltip>
            </Circle>
          ))}

          {/* 4. Normal Mission Flight Path (Thin Blue / Green line) */}
          {activeLayers.route && (
            <>
              {/* Completed route */}
              <Polyline
                positions={flightRoutes.completedPath}
                pathOptions={{
                  color: isOfflineMode ? 'rgba(59, 142, 219, 0.4)' : '#3B8EDB',
                  weight: 3,
                  opacity: 0.9,
                  dashArray: '3, 6'
                }}
              />

              {/* Upcoming planned route (Muted white when normal, fully muted when offline) */}
              {!isOfflineMode && (
                <Polyline
                  positions={flightRoutes.upcomingPath}
                  pathOptions={{
                    color: '#F2F4F3',
                    weight: 1.5,
                    opacity: 0.5,
                    dashArray: '4, 8'
                  }}
                />
              )}

              {/* AUTONOMOUS BACKTRACKING PATH (Dashed Amber Line when Signal Lost) */}
              {isOfflineMode && (
                <Polyline
                  positions={flightRoutes.backtrackPath}
                  pathOptions={{
                    color: '#E2A24C',
                    weight: 3.5,
                    opacity: 0.95,
                    dashArray: '6, 6'
                  }}
                >
                  <Tooltip sticky direction="top" className="font-mono text-xs text-amber-300 bg-black/90">
                    ◄ AUTONOMOUS BACKTRACKING ROUTE TO CP-3
                  </Tooltip>
                </Polyline>
              )}
            </>
          )}

          {/* 5. Checkpoints Markers (CP-1 to CP-4) */}
          {activeLayers.checkpoints && checkpoints.map((cp) => (
            <Marker
              key={cp.id}
              position={[cp.lat, cp.lng]}
              icon={createCheckpointIcon(cp)}
            >
              <Popup>
                <div className="font-mono text-xs p-1">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-aeris-textPrimary">{cp.label}: {cp.name}</span>
                    <span className="text-aeris-green text-[10px]">{cp.status}</span>
                  </div>
                  <p className="text-aeris-textSecondary text-[11px]">Alt Target: {cp.altitudeMeters}m AGL</p>
                  {cp.isLastConnected && (
                    <p className="text-aeris-green font-bold text-[10px] mt-1">
                      📶 LAST CONNECTED LINK ({cp.commQuality})
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 6. Survivor Detection Markers (Yellow Person Icon) */}
          {activeLayers.survivors && survivors.map((surv) => (
            <Marker
              key={surv.id}
              position={[surv.lat, surv.lng]}
              icon={createSurvivorMarker(surv)}
            >
              <Popup>
                <div className="font-mono text-xs p-1 max-w-[220px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-aeris-amber">SURVIVOR DETECTED</span>
                    <span className="bg-aeris-red/20 text-aeris-red text-[9.5px] px-1 rounded font-bold">
                      {surv.priority}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] my-1 text-aeris-textSecondary font-sans">
                    <p><strong className="text-aeris-textPrimary">Sector:</strong> {surv.sector}</p>
                    <p><strong className="text-aeris-textPrimary">Confidence:</strong> <span className="text-aeris-green font-mono">{surv.confidence}%</span></p>
                    <p><strong className="text-aeris-textPrimary">Sensor Source:</strong> <span className="text-aeris-cyan font-mono">{surv.source}</span></p>
                    <p><strong className="text-aeris-textPrimary">Timestamp:</strong> {surv.time}</p>
                    <p className="text-[10.5px] text-aeris-textMuted pt-1">{surv.details}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 7. Hazard Markers (Fire, Flood, Collapsed Structure) */}
          {activeLayers.hazards && hazards.map((haz) => (
            <Marker
              key={haz.id}
              position={[haz.lat, haz.lng]}
              icon={createHazardMarker(haz)}
            >
              <Popup>
                <div className="font-mono text-xs p-1 max-w-[220px]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-aeris-red">{haz.label}</span>
                    <span className="text-[10px] text-aeris-amber">{haz.priority}</span>
                  </div>
                  <div className="space-y-1 text-[11px] my-1 text-aeris-textSecondary font-sans">
                    <p><strong className="text-aeris-textPrimary">Sector:</strong> {haz.sector}</p>
                    <p><strong className="text-aeris-textPrimary">Confidence:</strong> <span className="text-aeris-green font-mono">{haz.confidence}%</span></p>
                    <p><strong className="text-aeris-textPrimary">Sensor:</strong> <span className="text-aeris-cyan font-mono">{haz.source}</span></p>
                    <p className="text-[10.5px] text-aeris-textMuted pt-1">{haz.details}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 8. Active Drone Marker (AERIS-01) */}
          <Marker
            position={dronePos}
            icon={createAeroDroneIcon(telemetry.position.heading, isOfflineMode)}
          >
            <Popup>
              <div className="font-mono text-xs p-1">
                <span className="font-bold text-aeris-cyan">{telemetry.droneId} ({telemetry.callsign})</span>
                <p className="text-aeris-textSecondary text-[11px]">Alt: {telemetry.position.altitudeAgl}m • Spd: {telemetry.position.groundSpeed} m/s</p>
                <p className="text-aeris-textMuted text-[10px]">State: {isOfflineMode ? 'OFFLINE BACKTRACK' : 'NORMAL FLIGHT'}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* 9. Heat Map Legend (Compact Bottom-Left Overlay) */}
        {activeLayers.heatmap && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-aeris-panel/95 border border-aeris-border p-2.5 rounded-card backdrop-blur-md font-mono text-[10px] shadow-lg space-y-1.5 pointer-events-auto">
            <div className="text-aeris-textMuted font-bold uppercase tracking-wider text-[9px] border-b border-white/5 pb-1">
              RISK INTENSITY
            </div>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center text-aeris-green">
                <span className="w-2 h-2 rounded-full bg-aeris-green mr-1"></span>
                LOW
              </span>
              <span className="flex items-center text-aeris-purple">
                <span className="w-2 h-2 rounded-full bg-aeris-purple mr-1"></span>
                MED
              </span>
              <span className="flex items-center text-aeris-amber">
                <span className="w-2 h-2 rounded-full bg-aeris-amber mr-1"></span>
                HIGH
              </span>
              <span className="flex items-center text-aeris-red">
                <span className="w-2 h-2 rounded-full bg-aeris-red mr-1 shadow-glow-red"></span>
                CRITICAL
              </span>
            </div>
          </div>
        )}

        {/* 10. Live RTK & Sector Status Overlay Bottom-Right */}
        <div className="absolute bottom-3 right-3 z-[1000] bg-aeris-panel/95 border border-aeris-border px-3 py-1.5 rounded-card backdrop-blur-md font-mono text-[10.5px] text-aeris-textSecondary shadow-lg">
          <span className="text-aeris-green font-bold">● RTK FIX</span> • WGS84 • <span className="text-aeris-cyan">LAT:</span> {telemetry.position.lat.toFixed(4)} <span className="text-aeris-cyan">LNG:</span> {telemetry.position.lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
