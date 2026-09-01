import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';

// Tactical Drone DivIcon with state-based glowing accents
const createTacticalDroneIcon = (drone, isSelected) => {
  const isOffline = drone.status === "OFFLINE";
  const isReturning = drone.status === "RETURNING";
  const isStandby = drone.status === "STANDBY";

  const color = isOffline ? "#D99A4A" : isReturning ? "#3B8EDB" : isStandby ? "#9A9F9D" : "#65C466";
  const glow = isSelected ? `0 0 16px ${color}` : `0 0 8px ${color}80`;

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Drone ID Callout Pill -->
        <div style="background: rgba(8, 10, 12, 0.9); border: 1px solid ${color}; color: #F1F3F2; font-family: monospace; font-size: 8.5px; font-weight: 600; padding: 1px 5px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: ${glow}; backdrop-filter: blur(8px);">
          ${drone.id}
        </div>
        <!-- Drone Marker Disc with Rotating Heading Triangle -->
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          ${isSelected ? `<div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${color}30; animation: ping 2.5s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #101315; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; transform: rotate(${drone.heading}deg); box-shadow: ${glow};">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'tactical-drone-marker',
    iconSize: [60, 50],
    iconAnchor: [30, 35],
    popupAnchor: [0, -35]
  });
};

// Last Known Connected Checkpoint Icon
const createLastConnectedCheckpointIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: rgba(217, 154, 74, 0.2); border: 1px dashed #D99A4A; color: #D99A4A; font-family: monospace; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; backdrop-filter: blur(6px);">
          LAST CONNECTED CHECKPOINT
        </div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #15191B; border: 2px dashed #D99A4A; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(217,154,74,0.5);">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #D99A4A;"></div>
        </div>
      </div>
    `,
    className: 'lcc-marker',
    iconSize: [140, 44],
    iconAnchor: [70, 32],
    popupAnchor: [0, -32]
  });
};

// Checkpoint Waypoint Icon
const createCheckpointWaypointIcon = (label, status) => {
  const isDone = status === 'COMPLETED';
  const color = isDone ? '#65C466' : '#3B8EDB';

  return L.divIcon({
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="width: 16px; height: 16px; border-radius: 50%; background: #101315; border: 1.5px solid ${color}; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 8px; font-weight: bold; color: #F1F3F2;">
          <div style="width: 5px; height: 5px; border-radius: 50%; background: ${color};"></div>
        </div>
        <div style="background: rgba(8, 10, 12, 0.85); color: #9A9F9D; font-family: monospace; font-size: 7.5px; padding: 0.5px 3px; border-radius: 2px; margin-top: 1px;">
          ${label}
        </div>
      </div>
    `,
    className: 'waypoint-marker',
    iconSize: [36, 32],
    iconAnchor: [18, 16],
    popupAnchor: [0, -18]
  });
};

// Recenter Map Helper Component
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MissionMap({
  drones = [],
  selectedDroneId,
  onSelectDrone,
  incidentZones = [],
  checkpoints = [],
  mapLayer = 'satellite',
  showIncidentZones = true,
  showRoutes = true,
  centerPosition
}) {
  const selectedDrone = drones.find(d => d.id === selectedDroneId) || drones[0];
  const initialCenter = centerPosition || [30.5520, 79.5580];

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-aeris-bg">
      <MapContainer
        center={initialCenter}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
        zoomControl={false}
      >
        <MapViewUpdater center={centerPosition} />

        {/* 1. Base Map Tile Layer (Satellite vs Terrain) */}
        {mapLayer === 'satellite' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            className="satellite-map-tiles"
            maxZoom={18}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            className="dark-terrain-tiles"
            maxZoom={19}
          />
        )}

        {/* 2. Soft Incident Zones Overlays */}
        {showIncidentZones && incidentZones.map((zone) => (
          <Polygon
            key={zone.id}
            positions={zone.polygon}
            pathOptions={{
              color: zone.color,
              weight: 1.2,
              dashArray: '4, 6',
              fillColor: zone.fillColor,
              fillOpacity: 0.08
            }}
          >
            <Tooltip direction="center" className="font-mono text-xs text-slate-100 bg-aeris-surface1/90 border border-white/10">
              {zone.name}
            </Tooltip>
          </Polygon>
        ))}

        {/* 3. Checkpoints */}
        {checkpoints.map((cp) => (
          <Marker
            key={cp.id}
            position={[cp.lat, cp.lng]}
            icon={createCheckpointWaypointIcon(cp.label, cp.status)}
          >
            <Popup>
              <div className="font-mono text-xs p-1">
                <span className="font-bold text-aeris-textPrimary">{cp.name}</span>
                <p className="text-aeris-textSecondary text-[10px]">Status: {cp.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Normal Mission Routes (Thin glowing white/cyan line with small glowing nodes) */}
        {showRoutes && drones.map((drone) => {
          if (!drone.flightPath || drone.flightPath.length === 0) return null;
          const isSelected = drone.id === selectedDroneId;

          return (
            <Polyline
              key={`route-${drone.id}`}
              positions={drone.flightPath}
              pathOptions={{
                color: isSelected ? '#F1F3F2' : 'rgba(241, 243, 242, 0.4)',
                weight: isSelected ? 2 : 1.2,
                opacity: isSelected ? 0.9 : 0.45,
                dashArray: isSelected ? '4, 4' : '3, 6',
              }}
            />
          );
        })}

        {/* 5. Last Known Connected Checkpoint & Backtracking Route for Offline Drones */}
        {drones.filter(d => d.status === "OFFLINE" && d.lastConnectedCheckpoint).map((drone) => (
          <React.Fragment key={`offline-${drone.id}`}>
            {/* Last Known Connected Checkpoint Marker */}
            <Marker
              position={[drone.lastConnectedCheckpoint.lat, drone.lastConnectedCheckpoint.lng]}
              icon={createLastConnectedCheckpointIcon()}
            >
              <Popup>
                <div className="font-mono text-xs p-1">
                  <span className="font-bold text-aeris-amber">LAST KNOWN CONNECTION</span>
                  <p className="text-aeris-textSecondary text-[10px]">Lost at: {drone.lastConnectedCheckpoint.timeLost}</p>
                </div>
              </Popup>
            </Marker>

            {/* Backtracking Path: Dashed Amber Line */}
            {drone.backtrackPath && (
              <Polyline
                positions={drone.backtrackPath}
                pathOptions={{
                  color: '#D99A4A',
                  weight: 2.5,
                  opacity: 0.95,
                  dashArray: '6, 6'
                }}
              >
                <Tooltip sticky direction="top" className="font-mono text-xs text-amber-300 bg-black/90">
                  AERIS-03 Autonomous Backtracking Path
                </Tooltip>
              </Polyline>
            )}
          </React.Fragment>
        ))}

        {/* 6. Drone Position Markers */}
        {drones.map((drone) => {
          const isSelected = drone.id === selectedDroneId;
          return (
            <Marker
              key={drone.id}
              position={[drone.position.lat, drone.position.lng]}
              icon={createTacticalDroneIcon(drone, isSelected)}
              eventHandlers={{
                click: () => onSelectDrone && onSelectDrone(drone.id),
              }}
            >
              <Popup>
                <div className="font-mono text-xs p-1">
                  <div className="flex items-center justify-between border-b border-white/10 pb-1 mb-1">
                    <span className="font-bold text-aeris-textPrimary">{drone.id} ({drone.callsign})</span>
                    <span className="text-[10px] text-aeris-green font-medium">{drone.status}</span>
                  </div>
                  <p className="text-aeris-textSecondary text-[11px]">Mission: {drone.mission}</p>
                  <p className="text-aeris-textMuted text-[10px]">Alt: {drone.altitude}m • Speed: {drone.speed}m/s • Bat: {drone.battery}%</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
