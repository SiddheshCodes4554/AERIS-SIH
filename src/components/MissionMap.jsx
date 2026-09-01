import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Layers, 
  MapPin, 
  Flame, 
  Waves, 
  AlertTriangle, 
  User, 
  Flag,
  Crosshair,
  Shield,
  Eye,
  Info
} from 'lucide-react';

// Custom DivIcon Helper with tactical aerospace styling
const createTacticalDivIcon = (htmlContent, className = '', size = [36, 36]) => {
  return L.divIcon({
    html: htmlContent,
    className: `aeris-map-marker ${className}`,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2 - 4]
  });
};

// 1. Drone Marker (AERIS-01) with Heading Arrow & Callsign Label
const createDroneMarkerIcon = (heading, callsign = "AERIS-01") => {
  return createTacticalDivIcon(`
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <!-- Callsign label badge -->
      <div style="background: #080C14; border: 1.5px solid #00E5FF; color: #00E5FF; font-family: monospace; font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 8px rgba(0, 229, 255, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
        ${callsign}
      </div>
      <!-- Rotating Drone Icon -->
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(0, 229, 255, 0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #0E1626; border: 2px solid #00E5FF; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 12px rgba(0, 229, 255, 0.8);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#00E5FF" stroke="#080C14" stroke-width="1.5">
            <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
          </svg>
        </div>
      </div>
    </div>
  `, 'drone-marker-container', [80, 56]);
};

// 2. Checkpoint Marker (CP-1 to CP-4)
const createCheckpointMarkerIcon = (label, status) => {
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';
  const bg = isInProgress ? '#00E5FF' : isCompleted ? '#10B981' : '#152238';
  const textColor = isInProgress ? '#080C14' : isCompleted ? '#FFFFFF' : '#94A3B8';
  const borderColor = isInProgress ? '#00E5FF' : isCompleted ? '#10B981' : '#2A4066';

  return createTacticalDivIcon(`
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 24px; height: 24px; border-radius: 50%; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 10px; font-weight: bold; color: ${textColor}; box-shadow: 0 0 8px ${borderColor}80;">
        ${label.replace('CP-', '')}
      </div>
      <div style="background: rgba(8, 12, 20, 0.85); color: #E2E8F0; font-family: monospace; font-size: 8px; font-weight: bold; padding: 0.5px 3px; border-radius: 2px; margin-top: 1px; border: 0.5px solid ${borderColor};">
        ${label}
      </div>
    </div>
  `, 'checkpoint-marker', [36, 40]);
};

// 3. Survivor Marker (👤 Person Icon + Confidence + Priority)
const createSurvivorMarkerIcon = (priority, confidence) => {
  const isCritical = priority === 'CRITICAL';
  const badgeColor = isCritical ? '#EF4444' : priority === 'HIGH' ? '#F59E0B' : '#38BDF8';

  return createTacticalDivIcon(`
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <!-- Priority & Confidence mini-pill -->
      <div style="background: #080C14; border: 1px solid ${badgeColor}; color: ${badgeColor}; font-family: monospace; font-size: 8px; font-weight: bold; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 6px ${badgeColor}60;">
        👤 ${confidence}% [${priority.substring(0, 4)}]
      </div>
      <!-- Survivor Icon Disc -->
      <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background: ${badgeColor}25; border: 2px solid ${badgeColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${badgeColor}80;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="${badgeColor}">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </div>
  `, 'survivor-marker', [75, 48]);
};

// 4. Hazard Markers (Fire, Flood, Debris)
const createHazardMarkerIcon = (type) => {
  if (type === 'FIRE') {
    return createTacticalDivIcon(`
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #080C14; border: 1px solid #EF4444; color: #EF4444; font-family: monospace; font-size: 8px; font-weight: bold; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 6px rgba(239,68,68,0.7);">
          🔥 FIRE
        </div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(239,68,68,0.25); border: 2px solid #EF4444; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(239,68,68,0.8);">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
            <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.35 1.83-6.28 4.54-7.82.35-.2.8-.08.99.27.18.34.08.77-.23 1C6.88 8.7 6 10.74 6 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.87-.86-3.54-2.22-4.63-.3-.24-.38-.68-.18-1 .2-.32.62-.43.97-.26C19.78 8.79 21 11.26 21 14c0 4.97-4.03 9-9 9z"/>
          </svg>
        </div>
      </div>
    `, 'hazard-fire-marker', [60, 48]);
  }

  if (type === 'FLOOD') {
    return createTacticalDivIcon(`
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #080C14; border: 1px solid #00E5FF; color: #00E5FF; font-family: monospace; font-size: 8px; font-weight: bold; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 6px rgba(0,229,255,0.6);">
          🌊 FLOOD
        </div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(0,229,255,0.2); border: 2px solid #00E5FF; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(0,229,255,0.7);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
            <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          </svg>
        </div>
      </div>
    `, 'hazard-flood-marker', [60, 48]);
  }

  // DEBRIS Hazard
  return createTacticalDivIcon(`
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="background: #080C14; border: 1px solid #F59E0B; color: #F59E0B; font-family: monospace; font-size: 8px; font-weight: bold; padding: 0.5px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 6px rgba(245,158,11,0.6);">
        ⚠️ DEBRIS
      </div>
      <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(245,158,11,0.25); border: 2px solid #F59E0B; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(245,158,11,0.7);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#F59E0B">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      </div>
    </div>
  `, 'hazard-debris-marker', [60, 48]);
};

export default function MissionMap({ 
  droneTelemetry, 
  checkpoints = [], 
  flightPath = [], 
  survivors = [], 
  hazards = [], 
  geofence = [] 
}) {
  const [showFlightPath, setShowFlightPath] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [showSurvivors, setShowSurvivors] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showGeofence, setShowGeofence] = useState(true);

  const dronePos = [droneTelemetry.position.lat, droneTelemetry.position.lng];

  return (
    <div className="relative w-full h-full bg-aeris-panel border border-aeris-border rounded-md overflow-hidden flex flex-col">
      {/* Top Map Control Bar */}
      <div className="absolute top-2.5 left-2.5 z-[1000] flex items-center space-x-1.5 bg-aeris-panel/90 backdrop-blur-md px-3 py-1.5 rounded border border-aeris-border shadow-lg">
        <div className="flex items-center space-x-1.5 mr-2 pr-2 border-r border-aeris-border">
          <Navigation className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
          <span className="text-xs font-mono font-bold text-aeris-textPrimary">LIVE MISSION MAP</span>
        </div>

        <button 
          onClick={() => setShowFlightPath(!showFlightPath)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showFlightPath 
              ? 'bg-aeris-cyan/20 border-aeris-cyan text-aeris-cyan font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          Flight Path
        </button>

        <button 
          onClick={() => setShowCheckpoints(!showCheckpoints)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showCheckpoints 
              ? 'bg-aeris-cyan/20 border-aeris-cyan text-aeris-cyan font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          CP ({checkpoints.length})
        </button>

        <button 
          onClick={() => setShowSurvivors(!showSurvivors)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showSurvivors 
              ? 'bg-aeris-danger/20 border-aeris-danger text-aeris-danger font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          Survivors ({survivors.length})
        </button>

        <button 
          onClick={() => setShowHazards(!showHazards)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showHazards 
              ? 'bg-aeris-warning/20 border-aeris-warning text-aeris-warning font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          Hazards ({hazards.length})
        </button>
      </div>

      {/* Top Right Live Telemetry Coordinates */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-aeris-panel/90 backdrop-blur-md px-3 py-1.5 rounded border border-aeris-border text-xs font-mono text-aeris-textSecondary shadow-lg">
        <span className="text-aeris-cyan font-bold">DRONE:</span> {droneTelemetry.droneId} ({droneTelemetry.position.lat.toFixed(4)}°N, {droneTelemetry.position.lng.toFixed(4)}°E)
      </div>

      {/* MAP LEGEND OVERLAY (Bottom-Left) */}
      <div className="absolute bottom-7 left-2.5 z-[1000] bg-aeris-panel/95 backdrop-blur-md p-2.5 rounded border border-aeris-border font-mono text-[11px] shadow-xl space-y-1.5 max-w-[200px]">
        <div className="text-[10px] text-aeris-textMuted font-bold uppercase tracking-wider border-b border-aeris-border pb-1 flex items-center justify-between">
          <span>Map Legend</span>
          <Info className="w-3 h-3 text-aeris-cyan" />
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-aeris-cyan shadow-[0_0_6px_#00E5FF]"></span>
            <span className="text-aeris-textPrimary font-bold">AERIS-01</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-aeris-blueLight border border-aeris-border"></span>
            <span className="text-aeris-textSecondary">Mission Checkpoint</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-aeris-danger font-bold">👤</span>
            <span className="text-aeris-danger font-medium">Survivor (Confidence %)</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>🔥</span>
            <span className="text-aeris-danger">Fire Hazard</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>🌊</span>
            <span className="text-aeris-cyan">Flood Zone</span>
          </div>

          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span className="text-aeris-warning">Debris / Blockage</span>
          </div>

          <div className="flex items-center space-x-2 pt-0.5">
            <span className="w-4 h-0.5 bg-aeris-cyan shadow-[0_0_4px_#00E5FF]"></span>
            <span className="text-aeris-cyan text-[10px]">━━ Flight Path</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Engine */}
      <MapContainer
        center={dronePos}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* 1. Tactical Geofence Polygon */}
        {showGeofence && geofence.length > 0 && (
          <Polygon
            positions={geofence}
            pathOptions={{
              color: '#00E5FF',
              weight: 1.5,
              dashArray: '6, 6',
              fillColor: '#00E5FF',
              fillOpacity: 0.04
            }}
          >
            <Tooltip direction="center" className="font-mono text-xs">
              Operation Phoenix Geofence
            </Tooltip>
          </Polygon>
        )}

        {/* 2. Recorded / Planned Mission Flight Path (Blue/Cyan Line) */}
        {showFlightPath && flightPath.length > 0 && (
          <Polyline
            positions={flightPath}
            pathOptions={{
              color: '#00E5FF',
              weight: 3,
              opacity: 0.9,
              dashArray: '2, 6'
            }}
          />
        )}

        {/* 3. Checkpoints (CP-1 to CP-4) */}
        {showCheckpoints && checkpoints.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.lat, cp.lng]}
            icon={createCheckpointMarkerIcon(cp.label, cp.status)}
          >
            <Popup>
              <div className="font-mono text-xs p-1">
                <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1">
                  <span className="font-bold text-aeris-cyan">{cp.label}: {cp.name}</span>
                  <span className={`text-[10px] px-1 rounded ${
                    cp.status === 'COMPLETED' ? 'bg-aeris-success/20 text-aeris-success' :
                    cp.status === 'IN_PROGRESS' ? 'bg-aeris-cyan/20 text-aeris-cyan' :
                    'bg-aeris-surface text-aeris-textSecondary'
                  }`}>
                    {cp.status}
                  </span>
                </div>
                <p className="text-aeris-textSecondary text-[11px]">Alt Target: {cp.altitudeMeters}m AGL</p>
                <p className="text-aeris-textMuted text-[10px]">Coord: {cp.lat.toFixed(4)}, {cp.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Survivor Locations */}
        {showSurvivors && survivors.map((surv) => (
          <Marker
            key={surv.id}
            position={[surv.lat, surv.lng]}
            icon={createSurvivorMarkerIcon(surv.priority, surv.confidence)}
          >
            <Popup>
              <div className="font-mono text-xs p-1 max-w-[230px]">
                <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1">
                  <span className="font-bold text-aeris-danger">👤 {surv.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                    surv.priority === 'CRITICAL' ? 'bg-aeris-danger/20 text-aeris-danger border border-aeris-danger/40' :
                    'bg-aeris-warning/20 text-aeris-warning border border-aeris-warning/40'
                  }`}>
                    {surv.priority}
                  </span>
                </div>
                <p className="text-[11px] text-aeris-textSecondary font-sans mb-1.5">{surv.details}</p>
                <div className="flex items-center justify-between text-[10px] text-aeris-textMuted border-t border-aeris-border/60 pt-1">
                  <span className="text-aeris-cyan">CONFIDENCE: {surv.confidence}%</span>
                  <span>{surv.timestamp}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. Hazard Locations (Fire, Flood, Debris) */}
        {showHazards && hazards.map((haz) => (
          <React.Fragment key={haz.id}>
            {/* Visual Flood Surge Area polygon if available */}
            {haz.type === 'FLOOD' && haz.polygon && (
              <Polygon
                positions={haz.polygon}
                pathOptions={{
                  color: '#00E5FF',
                  weight: 1.5,
                  fillColor: '#00E5FF',
                  fillOpacity: 0.15
                }}
              />
            )}

            {/* Fire Hazard Thermal Blast Circle */}
            {haz.type === 'FIRE' && (
              <Circle
                center={[haz.lat, haz.lng]}
                radius={haz.radiusMeters || 40}
                pathOptions={{
                  color: '#EF4444',
                  weight: 1.5,
                  fillColor: '#EF4444',
                  fillOpacity: 0.2,
                  dashArray: '3, 3'
                }}
              />
            )}

            <Marker
              position={[haz.lat, haz.lng]}
              icon={createHazardMarkerIcon(haz.type)}
            >
              <Popup>
                <div className="font-mono text-xs p-1 max-w-[230px]">
                  <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1">
                    <span className="font-bold text-aeris-warning">
                      {haz.type === 'FIRE' ? '🔥 ' : haz.type === 'FLOOD' ? '🌊 ' : '⚠️ '}
                      {haz.label}
                    </span>
                    <span className="text-[10px] bg-aeris-danger/20 text-aeris-danger px-1 rounded font-bold">
                      {haz.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-aeris-textSecondary font-sans mb-1">{haz.details}</p>
                  <div className="text-[10px] text-aeris-textMuted border-t border-aeris-border/60 pt-1">
                    ID: {haz.id} • {haz.timestamp}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* 6. Drone Marker (AERIS-01) */}
        <Marker
          position={dronePos}
          icon={createDroneMarkerIcon(droneTelemetry.position.heading, droneTelemetry.droneId || "AERIS-01")}
        >
          <Popup>
            <div className="font-mono text-xs p-1">
              <span className="font-bold text-aeris-cyan">{droneTelemetry.droneId} ({droneTelemetry.callsign})</span>
              <p className="text-aeris-textSecondary">Alt: {droneTelemetry.position.altitudeAgl}m AGL | Speed: {droneTelemetry.position.groundSpeed} m/s</p>
              <p className="text-aeris-textMuted text-[10px]">Heading: {droneTelemetry.position.heading}° (SE) | Mode: {droneTelemetry.flightMode}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Bottom map status bar */}
      <div className="px-3 py-1 bg-aeris-panelHeader border-t border-aeris-border flex items-center justify-between text-[10px] font-mono text-aeris-textMuted z-10">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-aeris-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-aeris-cyan mr-1.5 animate-pulse"></span>
            RTK GPS FIXED
          </span>
          <span>HDOP: 0.8</span>
          <span>DATUM: WGS-84</span>
        </div>
        <div>
          SURVEILLANCE SECTOR: 4B NORTH FLOOD BASIN
        </div>
      </div>
    </div>
  );
}
