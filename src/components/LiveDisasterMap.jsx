import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Flame, 
  Waves, 
  AlertTriangle, 
  Building2, 
  User, 
  Wifi, 
  Radio, 
  Layers, 
  Crosshair,
  MapPin,
  LocateFixed
} from 'lucide-react';

// 1. Prominent Animated AERIS-01 Simulator Drone Marker
const createDroneMarker = (heading, altitude, speed) => {
  const color = '#3B8EDB';
  const pulseColor = 'rgba(59, 142, 219, 0.45)';

  const altStr = typeof altitude === 'number' ? `${altitude.toFixed(1)}m` : altitude;
  const spdStr = typeof speed === 'number' ? `${speed.toFixed(1)}m/s` : speed;

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Drone Telemetry Callout Badge -->
        <div style="background: #0B0E0F; border: 1.5px solid ${color}; color: #F2F4F3; font-family: monospace; font-size: 8px; font-weight: 700; padding: 1.5px 6px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 12px ${pulseColor}; letter-spacing: 0.5px;">
          AERIS-01 • ${altStr} • ${spdStr}
        </div>
        <!-- Directional Cone & Center Disc -->
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${pulseColor}; animation: ping-subtle 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: #070909; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading || 0}deg); box-shadow: 0 0 14px ${color};">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-drone-icon',
    iconSize: [130, 52],
    iconAnchor: [65, 36],
    popupAnchor: [0, -36]
  });
};

// 2. Real YOLO Person Observation Marker (Captured at Drone Position)
const createPersonObservationIcon = (obs) => {
  const confPct = Math.round((obs.confidence || 0.95) * 100);
  const priority = obs.priority || (confPct >= 85 ? 'HIGH' : 'MED');
  const color = priority === 'HIGH' ? '#70EB78' : '#F5A623';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #0B0E0F; border: 1px solid ${color}; color: ${color}; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 1px 5px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 8px ${color}80;">
          🎯 PERSON • ${confPct}% [${priority}]
        </div>
        <div style="width: 26px; height: 26px; border-radius: 50%; background: rgba(112, 235, 120, 0.25); border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${color};">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${color}">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      </div>
    `,
    className: 'aeris-person-obs-icon',
    iconSize: [110, 48],
    iconAnchor: [55, 30],
    popupAnchor: [0, -30]
  });
};

// 3. Map Pan Controller (Smoothly Centers on First Telemetry Fix & Handles Recenter Button)
function MapController({ targetCenter, shouldRecenter, onRecenterDone }) {
  const map = useMap();
  const hasInitialCenteredRef = useRef(false);

  useEffect(() => {
    if (targetCenter && targetCenter[0] && targetCenter[1] && !hasInitialCenteredRef.current) {
      hasInitialCenteredRef.current = true;
      map.flyTo(targetCenter, 15, { animate: true, duration: 1.0 });
    }
  }, [targetCenter, map]);

  useEffect(() => {
    if (shouldRecenter && targetCenter && targetCenter[0] && targetCenter[1]) {
      map.flyTo(targetCenter, 16, { animate: true, duration: 0.8 });
      if (onRecenterDone) onRecenterDone();
    }
  }, [shouldRecenter, targetCenter, map, onRecenterDone]);

  return null;
}

export default function LiveDisasterMap({
  missionState = {},
  dronePosition = null,
  locationPath = [],
  detectionEvents = [],
  survivors = [],
  hazards = [],
  heatmapData = []
}) {
  const [showRoute, setShowRoute] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDetections, setShowDetections] = useState(true);
  const [triggerRecenter, setTriggerRecenter] = useState(false);

  // Authoritative Drone Coordinates from Telemetry
  const droneLat = dronePosition?.latitude || missionState?.lat || 30.4158;
  const droneLng = dronePosition?.longitude || missionState?.lng || 79.3245;
  const currentPos = [droneLat, droneLng];

  // Filter person observations that have valid drone coordinates
  const personObservations = detectionEvents.filter(
    (ev) => ev.class === 'person' && ev.observation_location && ev.observation_location.latitude && ev.observation_location.longitude
  );

  return (
    <div className="w-full h-full aeris-panel-container flex flex-col overflow-hidden relative select-none">
      {/* 1. Top Minimal Map Header Bar */}
      <div className="h-9 px-3 bg-[#0E1213] border-b border-aeris-border flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-1.5">
          <Navigation className="w-3.5 h-3.5 text-aeris-cyan animate-pulse" />
          <h2 className="text-[11px] font-semibold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Live Mission Map
          </h2>
          <span className="text-[9px] font-mono text-aeris-green px-1.5 py-0.2 rounded bg-aeris-green/10 border border-aeris-green/20">
            SIMULATOR TELEMETRY
          </span>
        </div>

        {/* Minimal Layer Toggles: [ FLIGHT PATH ] [ HEAT MAP ] [ OBSERVATIONS ] */}
        <div className="flex items-center space-x-1 text-[9.5px] font-mono">
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showRoute 
                ? 'bg-aeris-blue/20 border-aeris-blue text-aeris-blue font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            FLIGHT PATH ({locationPath.length})
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showHeatmap 
                ? 'bg-aeris-purple/25 border-aeris-purple text-aeris-purple font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            HEAT MAP
          </button>

          <button
            onClick={() => setShowDetections(!showDetections)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showDetections 
                ? 'bg-aeris-amber/20 border-aeris-amber text-aeris-amber font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            OBSERVATIONS ({personObservations.length})
          </button>
        </div>
      </div>

      {/* 2. Main Leaflet Dark Satellite Canvas */}
      <div className="flex-1 w-full h-full relative min-h-0">
        <MapContainer
          center={currentPos}
          zoom={15}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={false}
        >
          <MapController 
            targetCenter={currentPos}
            shouldRecenter={triggerRecenter}
            onRecenterDone={() => setTriggerRecenter(false)}
          />

          {/* Dark Satellite Basemap Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri Satellite</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            className="dark-satellite-tiles"
            maxZoom={18}
          />

          {/* 3. Real Recorded Drone Flight Breadcrumb Trail */}
          {showRoute && locationPath.length > 1 && (
            <Polyline
              positions={locationPath.map(p => [p.latitude, p.longitude])}
              pathOptions={{
                color: '#3B8EDB',
                weight: 3,
                opacity: 0.9,
                dashArray: '4, 6'
              }}
            >
              <Tooltip sticky direction="top" className="font-mono text-xs text-blue-300 bg-black/90">
                DRONE PATROL FLIGHT PATH ({locationPath.length} points)
              </Tooltip>
            </Polyline>
          )}

          {/* 4. Disaster Risk Heat Map Layer */}
          {showHeatmap && heatmapData.map((zone) => (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: zone.color,
                weight: 1.5,
                fillColor: zone.color,
                fillOpacity: zone.opacity,
                dashArray: '3, 4'
              }}
            >
              <Tooltip direction="center" className="font-mono text-xs text-slate-100 bg-[#070909]/90 border border-white/10">
                {zone.label}
              </Tooltip>
            </Circle>
          ))}

          {/* 5. Real YOLO Person Observation Markers (Recorded at drone flight coordinates) */}
          {showDetections && personObservations.map((obs, idx) => (
            <Marker
              key={obs.event_id || `obs-${idx}`}
              position={[obs.observation_location.latitude, obs.observation_location.longitude]}
              icon={createPersonObservationIcon(obs)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 max-w-[260px] text-[#F2F4F3]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1.5">
                    <span className="font-bold text-aeris-green text-[12px] font-mono">🎯 PERSON OBSERVATION</span>
                    <span className="bg-aeris-green/20 text-aeris-green text-[9.5px] font-mono px-1.5 py-0.2 rounded font-bold border border-aeris-green/30">
                      {obs.priority || 'HIGH PRIORITY'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] font-sans">
                    <p className="flex justify-between"><span className="text-[#8C9492]">Confidence:</span><strong className="text-aeris-green font-mono">{Math.round((obs.confidence || 0.95) * 100)}%</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Drone Position:</span><strong className="text-[#F2F4F3] font-mono">{obs.observation_location.latitude.toFixed(5)}, {obs.observation_location.longitude.toFixed(5)}</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Altitude:</span><strong className="text-[#F2F4F3] font-mono">{obs.observation_location.altitude || missionState.altitude || '42.5m'}</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Source:</span><strong className="text-aeris-cyan font-mono">SIMULATOR TELEMETRY</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Timestamp:</span><strong className="text-[#F2F4F3] font-mono">{new Date(obs.timestamp).toLocaleTimeString()}</strong></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 6. Active AERIS-01 Simulator Drone Marker */}
          <Marker
            position={currentPos}
            icon={createDroneMarker(
              dronePosition?.heading || missionState?.heading || 142,
              dronePosition?.altitude || missionState?.altitude || '42.5m',
              dronePosition?.speed || missionState?.speed || '8.6 m/s'
            )}
          >
            <Popup>
              <div className="font-sans text-xs p-1 text-[#F2F4F3]">
                <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                  <span className="font-bold text-aeris-cyan font-mono">{missionState.droneId || 'AERIS-01'}</span>
                  <span className="text-aeris-green text-[9.5px] font-mono">● {missionState.flightMode || 'SEARCH'}</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono">
                  <p className="flex justify-between"><span className="text-[#8C9492]">Lat:</span><strong>{droneLat.toFixed(5)}° N</strong></p>
                  <p className="flex justify-between"><span className="text-[#8C9492]">Lng:</span><strong>{droneLng.toFixed(5)}° E</strong></p>
                  <p className="flex justify-between"><span className="text-[#8C9492]">Alt:</span><strong className="text-aeris-cyan">{dronePosition?.altitude || missionState.altitude || '42.5m'}</strong></p>
                  <p className="flex justify-between"><span className="text-[#8C9492]">Speed:</span><strong className="text-white">{dronePosition?.speed || missionState.speed || '8.6 m/s'}</strong></p>
                  <p className="flex justify-between"><span className="text-[#8C9492]">Source:</span><strong className="text-aeris-green">SIMULATOR TELEMETRY</strong></p>
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* 7. Minimal Floating Recenter & Telemetry Status (Bottom-Right) */}
        <div className="absolute bottom-2.5 right-2.5 z-[1000] flex items-center space-x-1.5 font-mono text-[9.5px] pointer-events-auto">
          <button
            onClick={() => setTriggerRecenter(true)}
            className="bg-[#0B0E0F]/95 border border-aeris-cyan/40 hover:border-aeris-cyan px-2.5 py-1 rounded-card backdrop-blur-md text-aeris-cyan flex items-center space-x-1 transition-colors"
            title="Recenter Map to Drone Position"
          >
            <LocateFixed className="w-3 h-3 text-aeris-cyan" />
            <span>RECENTER DRONE</span>
          </button>

          <div className="bg-[#0B0E0F]/95 border border-aeris-border px-2.5 py-1 rounded-card backdrop-blur-md text-aeris-textSecondary">
            <span className="text-aeris-green font-bold">● SIMULATOR GPS</span> • LAT: {droneLat.toFixed(5)} LNG: {droneLng.toFixed(5)}
          </div>
        </div>
      </div>
    </div>
  );
}
