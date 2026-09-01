import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  Home, 
  MapPin, 
  Wifi, 
  RotateCcw, 
  Radio, 
  Sparkles, 
  Navigation, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';

// 1. Home Base Marker
const createHomeIcon = () => {
  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="background: #111516; border: 1px solid #63C174; color: #63C174; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 1px 4px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap;">
          ⌂ HOME BASE
        </div>
        <div style="width: 24px; height: 24px; border-radius: 50%; background: #070909; border: 2px solid #63C174; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px #63C174;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#63C174" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </div>
      </div>
    `,
    className: 'aeris-backtrack-home-icon',
    iconSize: [80, 44],
    iconAnchor: [40, 30],
    popupAnchor: [0, -30]
  });
};

// 2. Checkpoint Marker with Last Connected Highlight
const createCheckpointIcon = (cp, isLastConnected, isBacktracking) => {
  const isSpecial = isLastConnected;
  const color = isSpecial ? '#F5A623' : '#63C174';
  const shadow = isSpecial ? '0 0 14px rgba(245, 166, 35, 0.8)' : '0 0 8px rgba(99, 193, 116, 0.4)';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${isSpecial ? `
          <div style="background: #111516; border: 1.5px solid #F5A623; color: #F5A623; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 1px 5px; border-radius: 3px; margin-bottom: 2px; white-space: nowrap; box-shadow: ${shadow};">
            📶 LAST CONNECTED: ${cp.label}
          </div>
        ` : `
          <div style="background: #111516; border: 1px solid #63C174; color: #63C174; font-family: monospace; font-size: 7px; font-weight: 700; padding: 0.5px 3px; border-radius: 2px; margin-bottom: 2px;">
            ${cp.label} ✓
          </div>
        `}
        <div style="width: ${isSpecial ? '24px' : '18px'}; height: ${isSpecial ? '24px' : '18px'}; border-radius: 50%; background: ${isSpecial ? 'rgba(245,166,35,0.3)' : '#181D1E'}; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 8px; font-weight: bold; color: #F2F4F3; box-shadow: ${shadow};">
          ${cp.label.replace('CP-', '')}
        </div>
      </div>
    `,
    className: 'aeris-backtrack-cp-icon',
    iconSize: [110, 48],
    iconAnchor: [55, 34],
    popupAnchor: [0, -34]
  });
};

// 3. Drone Marker for Simulation
const createSimulationDroneIcon = (currentStage, heading) => {
  const isBacktracking = currentStage === 'BACKTRACKING';
  const isOffline = currentStage === 'SIGNAL_LOST' || currentStage === 'OFFLINE_AUTONOMY';
  const color = isBacktracking ? '#F5A623' : isOffline ? '#A78BFA' : '#3B9EFF';

  return L.divIcon({
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #111516; border: 1.5px solid ${color}; color: #F2F4F3; font-family: monospace; font-size: 7.5px; font-weight: 700; padding: 1px 4px; border-radius: 9999px; margin-bottom: 2px; white-space: nowrap; box-shadow: 0 0 10px ${color}80;">
          AERIS-01 • ALT 50m • ${isBacktracking ? '◄ BACKTRACKING' : isOffline ? 'OFFLINE AI' : 'AUTONOMOUS'}
        </div>
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: ${color}40; animation: ping-subtle 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #07090B; border: 2px solid ${color}; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); box-shadow: 0 0 12px ${color};">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="${color}">
              <polygon points="12 2 20 20 12 16 4 20 12 2"></polygon>
            </svg>
          </div>
        </div>
      </div>
    `,
    className: 'aeris-sim-drone-icon',
    iconSize: [120, 50],
    iconAnchor: [60, 35],
    popupAnchor: [0, -35]
  });
};

export default function RecoveryMap({ 
  scenario, 
  currentStage, 
  dronePos, 
  droneHeading 
}) {
  const isOffline = currentStage === 'SIGNAL_LOST' || currentStage === 'OFFLINE_AUTONOMY';
  const isBacktracking = currentStage === 'BACKTRACKING';
  const isReconnected = currentStage === 'RECONNECTED' || currentStage === 'DATA_SYNC' || currentStage === 'MISSION_RESUMED';

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl flex flex-col overflow-hidden relative select-none shadow-2xl">
      {/* 1. Header Bar */}
      <div className="h-9 px-3.5 bg-[#181D20] border-b border-white/5 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <RotateCcw className={`w-3.5 h-3.5 ${isBacktracking ? 'text-[#F5A623] animate-spin' : 'text-[#3B9EFF]'}`} />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Mission Recovery & Tactical Path Map
          </h3>
        </div>

        {/* Dynamic State Indicator */}
        <div className="flex items-center space-x-2 text-[9.5px] font-mono">
          <span className="text-[#8B949E]">TARGET RECOVERY:</span>
          <span className="text-[#F5A623] font-bold px-2 py-0.5 rounded bg-[#F5A623]/15 border border-[#F5A623]/30">
            CP-04 (Gorge Gateway)
          </span>
        </div>
      </div>

      {/* 2. Main Leaflet Satellite Map Canvas */}
      <div className="flex-1 w-full h-full relative min-h-0">
        <MapContainer
          center={[30.3200, 78.0360]}
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

          {/* 3. RF Ground Link Coverage Zone (Connected Zone vs Mountain Gorge Shadow) */}
          <Circle
            center={scenario.rfCoverageZone.center}
            radius={scenario.rfCoverageZone.radiusMeters}
            pathOptions={{
              color: '#3B9EFF',
              weight: 1.5,
              fillColor: '#3B9EFF',
              fillOpacity: 0.05,
              dashArray: '4, 6'
            }}
          >
            <Tooltip direction="top" className="font-mono text-[9px] text-[#3B9EFF] bg-black/90">
              5.8 GHz RF MESH CONNECTED ZONE (LINE-OF-SIGHT)
            </Tooltip>
          </Circle>

          {/* 4. Normal Mission Path from Base to CP-04 (Muted Blue) */}
          <Polyline
            positions={scenario.paths.normalRoute.slice(0, 5)}
            pathOptions={{
              color: '#3B9EFF',
              weight: 2.5,
              opacity: isBacktracking ? 0.4 : 0.85
            }}
          />

          {/* 5. Recorded Path Taken Beyond CP-04 (Visible during offline operation) */}
          {(isOffline || isBacktracking || isReconnected) && (
            <Polyline
              positions={scenario.paths.recordedOfflinePath}
              pathOptions={{
                color: '#FFFFFF',
                weight: 2,
                opacity: 0.6,
                dashArray: '3, 4'
              }}
            >
              <Tooltip direction="bottom" className="font-mono text-[9px] text-white bg-black/90">
                RECORDED FLIGHT PATH (1.4 km BUFFERED)
              </Tooltip>
            </Polyline>
          )}

          {/* 6. Active Backtracking Path (Amber/Orange Dashed Line) */}
          {isBacktracking && (
            <Polyline
              positions={scenario.paths.backtrackPath}
              pathOptions={{
                color: '#F5A623',
                weight: 4,
                opacity: 0.95,
                dashArray: '6, 6'
              }}
            >
              <Tooltip sticky direction="top" className="font-mono text-xs text-[#F5A623] bg-black/90 font-bold">
                ◄ AUTONOMOUS BACKTRACKING IN PROGRESS: Returning to CP-04
              </Tooltip>
            </Polyline>
          )}

          {/* 7. Resuming Route (Green line after sync) */}
          {currentStage === 'MISSION_RESUMED' && (
            <Polyline
              positions={scenario.paths.resumeRoute}
              pathOptions={{
                color: '#63C174',
                weight: 3.5,
                opacity: 0.95
              }}
            />
          )}

          {/* 8. Home Base Marker */}
          <Marker
            position={[scenario.homeBase.lat, scenario.homeBase.lng]}
            icon={createHomeIcon()}
          >
            <Popup>
              <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                <span className="font-bold text-[#63C174] font-mono">{scenario.homeBase.name}</span>
                <p className="text-[10px] text-[#8B949E] font-mono">Start & Base Staging LZ</p>
              </div>
            </Popup>
          </Marker>

          {/* 9. Checkpoints (CP-01 to CP-04) */}
          {scenario.checkpoints.map((cp) => (
            <Marker
              key={cp.id}
              position={[cp.lat, cp.lng]}
              icon={createCheckpointIcon(cp, cp.isLastConnected, isBacktracking)}
            >
              <Popup>
                <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                  <span className="font-bold text-[#F5A623] font-mono">{cp.label}: {cp.name}</span>
                  {cp.isLastConnected && (
                    <p className="text-[#63C174] font-bold text-[10px] font-mono mt-0.5">
                      📶 LAST KNOWN CONNECTED CHECKPOINT (Signal Verified)
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* 10. AERIS-01 Autonomous Drone Marker */}
          <Marker
            position={dronePos}
            icon={createSimulationDroneIcon(currentStage, droneHeading)}
          >
            <Popup>
              <div className="font-sans text-xs p-1 text-[#E8ECEF]">
                <span className="font-bold text-[#3B9EFF] font-mono">AERIS-01</span>
                <p className="text-[10px] text-[#8B949E] font-mono">
                  State: <strong className="text-[#F5A623]">{currentStage}</strong>
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* 11. Over-Map Status Banners */}
        {isBacktracking && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#111516]/95 border border-[#F5A623]/60 px-3.5 py-1.5 rounded-xl backdrop-blur-md font-mono text-[10.5px] text-[#F5A623] font-bold shadow-[0_0_16px_rgba(245,166,35,0.4)] flex items-center space-x-2 pointer-events-auto animate-pulse">
            <RotateCcw className="w-3.5 h-3.5 text-[#F5A623] animate-spin" />
            <span>AUTONOMOUS BACKTRACKING ACTIVE • REVERSING ALONG RECORDED FLIGHT PATH TO CP-04</span>
          </div>
        )}

        {isOffline && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-[#111516]/95 border border-[#A78BFA]/60 px-3.5 py-1.5 rounded-xl backdrop-blur-md font-mono text-[10.5px] text-[#A78BFA] font-bold shadow-[0_0_16px_rgba(167,139,250,0.3)] flex items-center space-x-2 pointer-events-auto">
            <Radio className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>OFFLINE AUTONOMOUS OPERATION • LOCAL EDGE AI INFERENCE & DATA BUFFERING ACTIVE</span>
          </div>
        )}

        {/* 12. Bottom-Left Map Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-[#111516]/95 border border-white/10 p-2 rounded-xl backdrop-blur-md font-mono text-[8.5px] shadow-lg pointer-events-auto space-y-1">
          <div className="text-[#8B949E] font-bold uppercase tracking-wider text-[8px] border-b border-white/5 pb-0.5">
            TACTICAL PATH LEGEND
          </div>
          <div className="flex flex-col space-y-1 text-[#E8ECEF]">
            <span className="flex items-center">
              <span className="w-3 h-0.5 bg-[#3B9EFF] mr-1.5"></span>
              Mission Path (Forward)
            </span>
            <span className="flex items-center">
              <span className="w-3 h-0.5 bg-white mr-1.5 border-dashed"></span>
              Recorded Offline Path
            </span>
            <span className="flex items-center text-[#F5A623]">
              <span className="w-3 h-0.5 bg-[#F5A623] mr-1.5"></span>
              Backtracking Path (Reverse)
            </span>
            <span className="flex items-center text-[#63C174]">
              <span className="w-3 h-0.5 bg-[#63C174] mr-1.5"></span>
              Mission Resumed Path
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
