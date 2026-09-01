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
  LocateFixed,
  ShieldAlert
} from 'lucide-react';

// 1. Prominent Animated AERIS Device Location Marker
const createDeviceMarker = (heading, accuracy, status) => {
  const isFix = status === 'ACTIVE';
  const color = isFix ? '#3B8EDB' : '#F5A623';
  const pulseColor = isFix ? 'rgba(59, 142, 219, 0.45)' : 'rgba(245, 166, 35, 0.45)';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Telemetry Callout Badge -->
        <div style="background: #0B0E0F; border: 1.5px solid ${color}; color: #F2F4F3; font-family: monospace; font-size: 8px; font-weight: 700; padding: 1.5px 6px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 12px ${pulseColor}; letter-spacing: 0.5px;">
          AERIS DEVICE • ${accuracy ? `±${Math.round(accuracy)}m` : 'LOCATING'}
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
    className: 'aeris-device-icon',
    iconSize: [120, 52],
    iconAnchor: [60, 36],
    popupAnchor: [0, -36]
  });
};

// 2. Real YOLO Person Observation Marker (Honestly labeled as observed device position)
const createPersonObservationIcon = (obs) => {
  const confPct = Math.round((obs.confidence || 0.9) * 100);
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

// 3. Map Pan Controller (Smoothly Centers on First Fix & Handles Recenter Button)
function MapController({ targetCenter, shouldRecenter, onRecenterDone }) {
  const map = useMap();
  const hasInitialCenteredRef = useRef(false);

  // Auto-center on first valid location
  useEffect(() => {
    if (targetCenter && targetCenter[0] && targetCenter[1] && !hasInitialCenteredRef.current) {
      hasInitialCenteredRef.current = true;
      map.flyTo(targetCenter, 16, { animate: true, duration: 1.2 });
    }
  }, [targetCenter, map]);

  // User-triggered manual recenter
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
  deviceLocation = null,
  locationStatus = 'ACQUIRING',
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

  // Derive active coordinates (Real Device Location)
  const hasRealCoords = deviceLocation && deviceLocation.latitude && deviceLocation.longitude;
  const currentPos = hasRealCoords 
    ? [deviceLocation.latitude, deviceLocation.longitude] 
    : [30.5610, 79.5680]; // Initial map view bounds while acquiring fix

  const accuracyMeters = deviceLocation?.accuracy || 25;

  // Filter real YOLO person observations that contain valid device observation locations
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
            DEVICE LOCATION
          </span>
        </div>

        {/* Minimal Layer Toggles: [ RECORDED PATH ] [ HEAT MAP ] [ OBSERVATIONS ] */}
        <div className="flex items-center space-x-1 text-[9.5px] font-mono">
          <button
            onClick={() => setShowRoute(!showRoute)}
            className={`px-2 py-0.5 rounded-pill border transition-colors ${
              showRoute 
                ? 'bg-aeris-blue/20 border-aeris-blue text-aeris-blue font-bold' 
                : 'bg-aeris-surface border-aeris-border text-aeris-textMuted'
            }`}
          >
            PATH ({locationPath.length})
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
            targetCenter={hasRealCoords ? currentPos : null}
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

          {/* 3. Location Accuracy Circle (Radius in meters matching browser accuracy) */}
          {hasRealCoords && (
            <Circle
              center={currentPos}
              radius={accuracyMeters}
              pathOptions={{
                color: '#3B8EDB',
                weight: 1.5,
                fillColor: '#3B8EDB',
                fillOpacity: 0.12,
                dashArray: '4, 4'
              }}
            >
              <Tooltip direction="center" className="font-mono text-xs text-cyan-200 bg-black/85 border border-cyan-500/30">
                LOCATION ACCURACY: ±{Math.round(accuracyMeters)}m
              </Tooltip>
            </Circle>
          )}

          {/* 4. Real Recorded Movement Breadcrumb Trail */}
          {showRoute && locationPath.length > 1 && (
            <Polyline
              positions={locationPath.map(p => [p.latitude, p.longitude])}
              pathOptions={{
                color: '#62C370',
                weight: 3,
                opacity: 0.9,
                dashArray: '4, 6'
              }}
            >
              <Tooltip sticky direction="top" className="font-mono text-xs text-green-300 bg-black/90">
                RECORDED DEVICE PATH ({locationPath.length} points)
              </Tooltip>
            </Polyline>
          )}

          {/* 5. Geographically Connected Disaster Risk Heat Map Layer */}
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

          {/* 6. Real YOLO Person Observation Markers (Captured at device location) */}
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
                    <p className="flex justify-between"><span className="text-[#8C9492]">Obs. Location:</span><strong className="text-[#F2F4F3] font-mono">{obs.observation_location.latitude.toFixed(6)}, {obs.observation_location.longitude.toFixed(6)}</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Accuracy:</span><strong className="text-[#F2F4F3] font-mono">±{Math.round(obs.observation_location.accuracy || 25)}m</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Source:</span><strong className="text-aeris-cyan font-mono">DEVICE LOCATION</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Timestamp:</span><strong className="text-[#F2F4F3] font-mono">{new Date(obs.timestamp).toLocaleTimeString()}</strong></p>
                    <p className="text-[10px] text-[#A0AAB0] pt-1 border-t border-white/10 leading-tight italic">
                      * Position represents device coordinates when optical detection occurred.
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 7. Active Real Device Location Marker */}
          {hasRealCoords && (
            <Marker
              position={currentPos}
              icon={createDeviceMarker(deviceLocation.heading, accuracyMeters, locationStatus)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#F2F4F3]">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-aeris-cyan font-mono">AERIS DEVICE POSITION</span>
                    <span className="text-aeris-green text-[9.5px] font-mono">● {locationStatus}</span>
                  </div>
                  <div className="space-y-1 text-[11px] font-mono">
                    <p className="flex justify-between"><span className="text-[#8C9492]">Lat:</span><strong>{deviceLocation.latitude.toFixed(6)}</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Lng:</span><strong>{deviceLocation.longitude.toFixed(6)}</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Accuracy:</span><strong className="text-aeris-cyan">±{Math.round(accuracyMeters)} m</strong></p>
                    <p className="flex justify-between"><span className="text-[#8C9492]">Source:</span><strong className="text-aeris-green">DEVICE LOCATION</strong></p>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* 8. Location Status Banner (Top-Center) */}
        {locationStatus === 'DENIED' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-aeris-red/90 border border-aeris-red px-3.5 py-1.5 rounded-card backdrop-blur-md font-mono text-[11px] text-white font-bold shadow-glow-red flex items-center space-x-2 pointer-events-auto">
            <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse" />
            <span>LOCATION ACCESS DENIED — Enable browser location permission</span>
          </div>
        )}

        {locationStatus === 'ACQUIRING' && !hasRealCoords && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#0B0E0F]/90 border border-aeris-cyan/40 px-3.5 py-1.5 rounded-card backdrop-blur-md font-mono text-[11px] text-aeris-cyan font-bold flex items-center space-x-2 pointer-events-auto">
            <Navigation className="w-3.5 h-3.5 text-aeris-cyan animate-spin" />
            <span>ACQUIRING REAL DEVICE LOCATION...</span>
          </div>
        )}

        {/* 9. Minimal Floating Status & Recenter Button (Bottom-Right) */}
        <div className="absolute bottom-2.5 right-2.5 z-[1000] flex items-center space-x-1.5 font-mono text-[9.5px] pointer-events-auto">
          {hasRealCoords && (
            <button
              onClick={() => setTriggerRecenter(true)}
              className="bg-[#0B0E0F]/95 border border-aeris-cyan/40 hover:border-aeris-cyan px-2.5 py-1 rounded-card backdrop-blur-md text-aeris-cyan flex items-center space-x-1 transition-colors"
              title="Recenter Map to Device Position"
            >
              <LocateFixed className="w-3 h-3 text-aeris-cyan" />
              <span>RECENTER</span>
            </button>
          )}

          <div className="bg-[#0B0E0F]/95 border border-aeris-border px-2.5 py-1 rounded-card backdrop-blur-md text-aeris-textSecondary">
            {hasRealCoords ? (
              <>
                <span className="text-aeris-green font-bold">● ACTIVE</span> • LAT: {deviceLocation.latitude.toFixed(5)} LNG: {deviceLocation.longitude.toFixed(5)} (±{Math.round(accuracyMeters)}m)
              </>
            ) : (
              <span className="text-aeris-amber font-bold">● {locationStatus}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
