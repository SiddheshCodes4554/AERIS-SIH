import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Layers, 
  Crosshair, 
  Maximize2,
  Shield,
  AlertTriangle,
  Users,
  Compass,
  MapPin
} from 'lucide-react';

// Custom DivIcon creator for tactical aerospace markers
const createTacticalIcon = (htmlContent, className = '') => {
  return L.divIcon({
    html: htmlContent,
    className: `tactical-map-icon ${className}`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20]
  });
};

// Drone Marker with heading rotation
const createDroneIcon = (heading) => {
  return createTacticalIcon(`
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 229, 255, 0.25); animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: #0E1626; border: 2px solid #00E5FF; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 10px rgba(0,229,255,0.6);">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      </div>
    </div>
  `);
};

// Survivor Icon (Red/Orange with silhouette)
const createSurvivorIcon = (priority) => {
  const color = priority === 'CRITICAL' ? '#EF4444' : '#F59E0B';
  return createTacticalIcon(`
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: ${color}30; border: 1.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px ${color}80;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    </div>
  `);
};

// Hazard Icon (Warning Triangle)
const createHazardIcon = () => {
  return createTacticalIcon(`
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: #EF444430; border: 1.5px solid #EF4444; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(239,68,68,0.7);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#EF4444">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
      </div>
    </div>
  `);
};

// Checkpoint Marker Icon
const createCheckpointIcon = (number, isCurrent) => {
  const bg = isCurrent ? '#00E5FF' : '#152238';
  const textColor = isCurrent ? '#080C14' : '#38BDF8';
  const borderColor = isCurrent ? '#00E5FF' : '#2A4066';
  return createTacticalIcon(`
    <div style="width: 22px; height: 22px; border-radius: 50%; background: ${bg}; border: 2px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 10px; font-family: monospace; font-weight: bold; color: ${textColor}; box-shadow: 0 0 6px rgba(0,229,255,0.4);">
      ${number}
    </div>
  `);
};

export default function MissionMap({ droneTelemetry, waypoints, geofence, detections }) {
  const [showFlightPath, setShowFlightPath] = useState(true);
  const [showSurvivors, setShowSurvivors] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showCheckpoints, setShowCheckpoints] = useState(true);

  const dronePos = [droneTelemetry.position.lat, droneTelemetry.position.lng];
  const flightPathCoords = waypoints.map(wp => [wp.lat, wp.lng]);

  const survivorDetections = detections.filter(d => d.type.includes('SURVIVOR'));
  const hazardDetections = detections.filter(d => d.type === 'HAZARD');

  return (
    <div className="relative w-full h-full bg-aeris-panel border border-aeris-border rounded-md overflow-hidden flex flex-col">
      {/* Tactical Map Header & Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center space-x-1.5 bg-aeris-panel/90 backdrop-blur-md px-3 py-1.5 rounded border border-aeris-border shadow-lg">
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
          Path
        </button>

        <button 
          onClick={() => setShowCheckpoints(!showCheckpoints)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showCheckpoints 
              ? 'bg-aeris-cyan/20 border-aeris-cyan text-aeris-cyan font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          Checkpoints ({waypoints.length})
        </button>

        <button 
          onClick={() => setShowSurvivors(!showSurvivors)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showSurvivors 
              ? 'bg-aeris-danger/20 border-aeris-danger text-aeris-danger font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          Survivors ({survivorDetections.length})
        </button>

        <button 
          onClick={() => setShowHazards(!showHazards)}
          className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
            showHazards 
              ? 'bg-aeris-warning/20 border-aeris-warning text-aeris-warning font-bold' 
              : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
          }`}
        >
          Hazards ({hazardDetections.length})
        </button>
      </div>

      {/* Top Right Live Telemetry Coordinates */}
      <div className="absolute top-3 right-3 z-[1000] bg-aeris-panel/90 backdrop-blur-md px-3 py-1.5 rounded border border-aeris-border text-xs font-mono text-aeris-textSecondary shadow-lg">
        <span className="text-aeris-cyan font-bold">DRONE POS:</span> {droneTelemetry.position.lat.toFixed(5)}°N, {droneTelemetry.position.lng.toFixed(5)}°E
      </div>

      {/* Leaflet Map Component */}
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

        {/* Geofence Boundary Polygon */}
        <Polygon
          positions={geofence}
          pathOptions={{
            color: '#00E5FF',
            weight: 1.5,
            dashArray: '6, 6',
            fillColor: '#00E5FF',
            fillOpacity: 0.05
          }}
        >
          <Tooltip direction="center" className="font-mono text-xs">
            Sector-04 Tactical Geofence
          </Tooltip>
        </Polygon>

        {/* Flight Path Polyline */}
        {showFlightPath && (
          <Polyline
            positions={flightPathCoords}
            pathOptions={{
              color: '#38BDF8',
              weight: 2.5,
              opacity: 0.85,
              dashArray: '4, 6'
            }}
          />
        )}

        {/* Checkpoints */}
        {showCheckpoints && waypoints.map((wp, idx) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lng]}
            icon={createCheckpointIcon(idx + 1, idx === 3)}
          >
            <Popup>
              <div className="font-mono text-xs p-1">
                <span className="font-bold text-aeris-cyan">{wp.label}</span>
                <p className="text-aeris-textSecondary">Checkpoint #{idx + 1}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Survivor Markers */}
        {showSurvivors && survivorDetections.map((surv) => (
          <Marker
            key={surv.id}
            position={[surv.lat, surv.lng]}
            icon={createSurvivorIcon(surv.priority)}
          >
            <Popup>
              <div className="font-mono text-xs p-1 max-w-[220px]">
                <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1">
                  <span className="font-bold text-aeris-danger">{surv.label}</span>
                  <span className="text-[10px] bg-aeris-danger/20 text-aeris-danger px-1 rounded">
                    {surv.confidence}%
                  </span>
                </div>
                <p className="text-[11px] text-aeris-textSecondary font-sans">{surv.details}</p>
                <div className="text-[10px] text-aeris-textMuted mt-1">
                  PRIORITY: {surv.priority} • {surv.timestamp}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Hazard Markers */}
        {showHazards && hazardDetections.map((haz) => (
          <Marker
            key={haz.id}
            position={[haz.lat, haz.lng]}
            icon={createHazardIcon()}
          >
            <Popup>
              <div className="font-mono text-xs p-1 max-w-[220px]">
                <div className="flex items-center justify-between border-b border-aeris-border pb-1 mb-1">
                  <span className="font-bold text-aeris-warning">{haz.label}</span>
                  <span className="text-[10px] bg-aeris-warning/20 text-aeris-warning px-1 rounded">
                    {haz.confidence}%
                  </span>
                </div>
                <p className="text-[11px] text-aeris-textSecondary font-sans">{haz.details}</p>
                <div className="text-[10px] text-aeris-textMuted mt-1">
                  HAZARD ALERT • {haz.timestamp}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* UAV Position Marker */}
        <Marker
          position={dronePos}
          icon={createDroneIcon(droneTelemetry.position.heading)}
        >
          <Popup>
            <div className="font-mono text-xs p-1">
              <span className="font-bold text-aeris-cyan">{droneTelemetry.droneId} ({droneTelemetry.callsign})</span>
              <p className="text-aeris-textSecondary">Alt: {droneTelemetry.position.altitudeAgl}m AGL | Spd: {droneTelemetry.position.groundSpeed}m/s</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Map Footer status strip */}
      <div className="px-3 py-1 bg-aeris-panelHeader border-t border-aeris-border flex items-center justify-between text-[11px] font-mono text-aeris-textMuted z-10">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-aeris-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-aeris-cyan mr-1.5 animate-pulse"></span>
            RTK GPS FIXED
          </span>
          <span>HDOP: 0.8</span>
          <span>DATUM: WGS-84</span>
        </div>
        <div>
          SURVEILLANCE SECTOR: 4B NORTH
        </div>
      </div>
    </div>
  );
}
