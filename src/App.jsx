import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Header from './components/Header';
import MissionTelemetry from './components/MissionTelemetry';
import LiveDisasterMap from './components/LiveDisasterMap';
import LiveAICameraFeed from './components/LiveAICameraFeed';
import LiveEventLog from './components/LiveEventLog';
import AIDetectionsPanel from './components/AIDetectionsPanel';
import RiskHeatmapStatus from './components/RiskHeatmapStatus';
import MissionControlPanel from './components/MissionControlPanel';
import BottomStatusBar from './components/BottomStatusBar';

// Full Screen Operations Sub-views
import AERIS01OperationsView from './components/operations/AERIS01OperationsView';
import IncidentResponseView from './components/incidents/IncidentResponseView';
import MissionIntelligenceView from './components/analytics/MissionIntelligenceView';

import { DISASTER_ZONES } from './data/operationalAreas';
import { 
  DEFAULT_MISSION_STATE, 
  INITIAL_MISSION_STATE,
  CHECKPOINTS_ROUTE, 
  FLIGHT_PATHS, 
  SURVIVORS_LIST, 
  HAZARDS_LIST, 
  RISK_HEATMAP_DATA,
  INITIAL_EVENT_LOG 
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('live-mission'); // 'live-mission' | 'aeris01-operations' | 'incidents' | 'intelligence'
  const [selectedZoneId, setSelectedZoneId] = useState('chamoli-flood');
  const [missionState, setMissionState] = useState(DEFAULT_MISSION_STATE);
  const [simulationMode, setSimulationMode] = useState('NORMAL'); // 'NORMAL' | 'SIGNAL_LOSS' | 'BACKTRACKING' | 'RECONNECTED'
  const [isPlayingAutoDemo, setIsPlayingAutoDemo] = useState(false);
  const [eventLog, setEventLog] = useState(INITIAL_EVENT_LOG);
  const [layoutMode, setLayoutMode] = useState('DUAL_SPLIT'); // 'DUAL_SPLIT' (50/50) | '3_PANE' | 'CAM_FOCUS' | 'MAP_FOCUS'
  const [detectionEvents, setDetectionEvents] = useState([]);
  const [locationPath, setLocationPath] = useState([]);

  const activeZone = DISASTER_ZONES.find(z => z.id === selectedZoneId) || DISASTER_ZONES[0];
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://10.10.8.241:8000';
  const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/live';

  // 1. Centralized Authoritative Drone Position (Derived strictly from PX4/Gazebo Telemetry & /api/location/current)
  const rawLat = missionState.lat ?? missionState.latitude;
  const rawLng = missionState.lng ?? missionState.longitude;

  const isValidGps = Number.isFinite(rawLat) && Number.isFinite(rawLng) && 
                     rawLat >= -90 && rawLat <= 90 && 
                     rawLng >= -180 && rawLng <= 180;

  const dronePosition = {
    latitude: isValidGps ? rawLat : null,
    longitude: isValidGps ? rawLng : null,
    altitude: missionState.altitude ?? 0,
    speed: missionState.speed ?? 0,
    heading: missionState.heading ?? 0,
    source: missionState.locationSource ?? 'PX4_SIMULATOR'
  };

  // Record continuous simulator drone flight path using valid GPS coordinates only
  useEffect(() => {
    if (dronePosition.latitude !== null && dronePosition.longitude !== null) {
      setLocationPath(prev => {
        const last = prev[prev.length - 1];
        if (!last || Math.abs(last.latitude - dronePosition.latitude) > 0.000005 || Math.abs(last.longitude - dronePosition.longitude) > 0.000005) {
          return [...prev.slice(-999), {
            latitude: dronePosition.latitude,
            longitude: dronePosition.longitude,
            timestamp: new Date().toISOString()
          }];
        }
        return prev;
      });
    }
  }, [dronePosition.latitude, dronePosition.longitude]);

  // 2. Fetch Initial Telemetry, Explicit PX4 Location Endpoint & Recorded Flight Path
  useEffect(() => {
    let ws = null;
    let pollTimer = null;

    const fetchInitialData = async () => {
      try {
        const [telemRes, locationRes, pathRes] = await Promise.all([
          fetch(`${backendUrl}/api/telemetry/current`, { mode: 'cors' }),
          fetch(`${backendUrl}/api/location/current`, { mode: 'cors' }),
          fetch(`${backendUrl}/api/location/path`, { mode: 'cors' })
        ]);

        if (telemRes.ok) {
          const data = await telemRes.json();
          setMissionState(prev => ({
            ...prev,
            ...data
          }));
        }

        // Explicitly prioritize PX4 drone GPS from /api/location/current
        if (locationRes.ok) {
          const locationData = await locationRes.json();
          if (locationData.location) {
            const location = locationData.location;
            if (
              Number.isFinite(location.latitude) &&
              Number.isFinite(location.longitude) &&
              location.latitude >= -90 && location.latitude <= 90 &&
              location.longitude >= -180 && location.longitude <= 180
            ) {
              setMissionState(prev => ({
                ...prev,

                // Primary coordinates
                lat: location.latitude,
                lng: location.longitude,

                // Compatibility coordinates
                latitude: location.latitude,
                longitude: location.longitude,

                altitude: location.altitude ?? prev.altitude,
                speed: location.speed ?? prev.speed,
                heading: location.heading ?? prev.heading,

                locationSource: location.source || 'PX4_SIMULATOR',
                gpsActive: true
              }));
            }
          }
        }

        if (pathRes.ok) {
          const pathData = await pathRes.json();
          if (pathData.path && pathData.path.length > 0) {
            setLocationPath(pathData.path);
          }
        }
      } catch (err) {
        console.debug("Backend telemetry standby:", err);
      }
    };

    const connectWS = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected to AERIS PX4 Simulator Command Stream");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'init') {
              if (msg.data?.telemetry) {
                const tData = msg.data.telemetry;
                setMissionState(prev => {
                  const nextState = { ...prev, ...tData };
                  const rLat = tData.lat ?? tData.latitude;
                  const rLng = tData.lng ?? tData.longitude;
                  if (Number.isFinite(rLat) && Number.isFinite(rLng) &&
                      rLat >= -90 && rLat <= 90 && rLng >= -180 && rLng <= 180) {
                    nextState.lat = rLat;
                    nextState.lng = rLng;
                    nextState.latitude = rLat;
                    nextState.longitude = rLng;
                    nextState.locationSource = tData.source || tData.locationSource || 'PX4_SIMULATOR';
                    nextState.gpsActive = true;
                  }
                  return nextState;
                });
              }
              if (msg.data?.location?.location) {
                const loc = msg.data.location.location;
                if (Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude) &&
                    loc.latitude >= -90 && loc.latitude <= 90 && loc.longitude >= -180 && loc.longitude <= 180) {
                  setMissionState(prev => ({
                    ...prev,
                    lat: loc.latitude,
                    lng: loc.longitude,
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    altitude: loc.altitude ?? prev.altitude,
                    speed: loc.speed ?? prev.speed,
                    heading: loc.heading ?? prev.heading,
                    locationSource: loc.source || 'PX4_SIMULATOR',
                    gpsActive: true
                  }));
                }
              }
            } else if (msg.type === 'telemetry') {
              const tData = msg.data;
              if (tData) {
                setMissionState(prev => {
                  const nextState = { ...prev, ...tData };
                  const rLat = tData.lat ?? tData.latitude;
                  const rLng = tData.lng ?? tData.longitude;
                  if (Number.isFinite(rLat) && Number.isFinite(rLng) &&
                      rLat >= -90 && rLat <= 90 && rLng >= -180 && rLng <= 180) {
                    nextState.lat = rLat;
                    nextState.lng = rLng;
                    nextState.latitude = rLat;
                    nextState.longitude = rLng;
                    nextState.locationSource = tData.source || tData.locationSource || 'PX4_SIMULATOR';
                    nextState.gpsActive = true;
                  }
                  return nextState;
                });
              }
            } else if (msg.type === 'location') {
              const locData = msg.data;
              if (locData && locData.latitude !== undefined && locData.longitude !== undefined) {
                const rLat = locData.latitude;
                const rLng = locData.longitude;
                if (Number.isFinite(rLat) && Number.isFinite(rLng) &&
                    rLat >= -90 && rLat <= 90 && rLng >= -180 && rLng <= 180) {
                  setMissionState(prev => ({
                    ...prev,
                    lat: rLat,
                    lng: rLng,
                    latitude: rLat,
                    longitude: rLng,
                    altitude: locData.altitude ?? prev.altitude,
                    speed: locData.speed ?? prev.speed,
                    heading: locData.heading ?? prev.heading,
                    locationSource: locData.source || 'PX4_SIMULATOR',
                    gpsActive: true
                  }));
                }
              }
            } else if (msg.type === 'detection') {
              const det = msg.data;
              const now = new Date().toISOString().substring(11, 19);
              const confPct = det.confidence_pct || Math.round((det.confidence || 0.95) * 100);
              
              setDetectionEvents(prev => [det, ...prev.slice(0, 50)]);

              const locNote = (det.observation_location && det.observation_location.latitude && det.observation_location.longitude)
                ? ` • Loc: [${det.observation_location.latitude.toFixed(4)}, ${det.observation_location.longitude.toFixed(4)}]`
                : '';

              setEventLog(prev => [
                {
                  time: now,
                  text: `AERIS AI: ${det.display_name} (${confPct}% Conf) [${det.priority || 'HIGH'}]${locNote}`,
                  color: det.class === 'person' ? 'green' : 'amber'
                },
                ...prev.slice(0, 40)
              ]);
            }
          } catch (e) {
            console.debug("WS parse:", e);
          }
        };

        ws.onerror = () => {
          if (!pollTimer) pollTimer = setInterval(fetchInitialData, 2500);
        };

        ws.onclose = () => {
          if (!pollTimer) pollTimer = setInterval(fetchInitialData, 2500);
        };
      } catch (e) {
        pollTimer = setInterval(fetchInitialData, 2500);
      }
    };

    fetchInitialData();
    connectWS();

    return () => {
      if (ws) ws.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [backendUrl, wsUrl]);

  // 3. Automated Failover Demo Engine
  useEffect(() => {
    let timer;
    if (isPlayingAutoDemo) {
      if (simulationMode === 'NORMAL') {
        timer = setTimeout(() => handleSetSimulationMode('SIGNAL_LOSS'), 2000);
      } else if (simulationMode === 'SIGNAL_LOSS') {
        timer = setTimeout(() => handleSetSimulationMode('BACKTRACKING'), 3000);
      } else if (simulationMode === 'BACKTRACKING') {
        timer = setTimeout(() => handleSetSimulationMode('RECONNECTED'), 4000);
      } else if (simulationMode === 'RECONNECTED') {
        timer = setTimeout(() => {
          handleSetSimulationMode('NORMAL');
          setIsPlayingAutoDemo(false);
        }, 2500);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlayingAutoDemo, simulationMode]);

  // 4. Dynamic Disaster Zone Switcher
  const handleSelectZone = async (zoneId) => {
    setSelectedZoneId(zoneId);
    const zone = DISASTER_ZONES.find(z => z.id === zoneId);
    if (!zone) return;

    const now = new Date().toISOString().substring(11, 19);

    try {
      await fetch(`${backendUrl}/api/telemetry/zone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: zoneId })
      });
    } catch (e) {
      console.debug("Backend zone sync:", e);
    }

    setMissionState(prev => ({
      ...prev,
      missionName: zone.missionType,
      altitude: `${zone.altitude}m`,
      speed: `${zone.speed} m/s`,
      battery: zone.battery,
      checkpoint: zone.currentCheckpoint,
      survivorsCount: zone.survivorsCount,
      hazardsCount: zone.hazardsCount,
      coordinates: zone.coordinatesFormatted
    }));

    setEventLog(prev => [
      { time: now, text: `Operational Disaster Zone Switched to: ${zone.name}`, color: "blue" },
      { time: now, text: `Search Pattern Loaded • Region: ${zone.region}`, color: "green" },
      ...prev
    ]);
  };

  // 5. Failover & Backtracking Simulation Mode
  const handleSetSimulationMode = async (mode) => {
    setSimulationMode(mode);
    const now = new Date().toISOString().substring(11, 19);

    try {
      await fetch(`${backendUrl}/api/telemetry/mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
    } catch (e) {
      console.debug("Backend mode sync:", e);
    }

    if (mode === 'SIGNAL_LOSS') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'OFFLINE_MODE',
        systemStatus: 'WARNING',
        signalLostTime: 'JUST NOW'
      }));
      setEventLog(prev => [
        { time: now, text: "COMMUNICATION LINK FAILURE • RSSI Dropped to 0 dBm", color: "red" },
        { time: now, text: "Failsafe Triggered: Switching to Autonomous Edge Recovery Mode", color: "amber" },
        ...prev
      ]);
    } else if (mode === 'BACKTRACKING') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'BACKTRACKING',
        systemStatus: 'AUTONOMOUS',
        flightMode: 'AUTO_RETURN'
      }));
      setEventLog(prev => [
        { time: now, text: "Executing Reverse Path Navigation to Last Known Connected Point", color: "amber" },
        ...prev
      ]);
    } else if (mode === 'RECONNECTED') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'CONNECTED',
        systemStatus: 'ONLINE',
        flightMode: 'AUTO',
        signalLostTime: 'RESTORED'
      }));
      setEventLog(prev => [
        { time: now, text: "LINK RESTORED at Checkpoint CP-03 • Signal 5.8 GHz Solid", color: "green" },
        ...prev
      ]);
    } else {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'CONNECTED',
        systemStatus: 'ONLINE',
        flightMode: 'AUTO'
      }));
      setEventLog(prev => [
        { time: now, text: "Mission Mode Reset to Normal Auto-Pilot", color: "blue" },
        ...prev
      ]);
    }
  };

  const handleActionTrigger = async (action) => {
    const now = new Date().toISOString().substring(11, 19);
    try {
      await fetch(`${backendUrl}/api/mission/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (e) {
      console.debug("Backend command sync:", e);
    }

    if (action === 'PAUSE_MISSION') {
      setEventLog(prev => [{ time: now, text: "Operator Command: AERIS-01 Mission Suspended • Hovering", color: "amber" }, ...prev]);
    } else if (action === 'RESUME_MISSION') {
      setEventLog(prev => [{ time: now, text: "Operator Command: AERIS-01 Mission Resumed", color: "green" }, ...prev]);
    } else if (action === 'RETURN_TO_BASE') {
      setEventLog(prev => [{ time: now, text: "Operator Command: Return-to-Base (RTL) Initiated", color: "red" }, ...prev]);
    } else if (action === 'MARK_LOCATION') {
      const locText = (dronePosition.latitude && dronePosition.longitude)
        ? `[${dronePosition.latitude.toFixed(5)}, ${dronePosition.longitude.toFixed(5)}]`
        : 'Current Fix';
      setEventLog(prev => [{ time: now, text: `Tactical Drone Waypoint Logged at: ${locText}`, color: "blue" }, ...prev]);
    }
  };

  const isOffline = simulationMode === 'SIGNAL_LOSS';
  const isBacktracking = simulationMode === 'BACKTRACKING';

  return (
    <div className="h-screen w-screen flex flex-col bg-[#07090A] text-aeris-textPrimary overflow-hidden font-sans select-none">
      {/* 1. TOP AERIS NAVIGATION BAR */}
      <Navigation 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedZoneId={selectedZoneId}
        onSelectZoneId={handleSelectZone}
      />

      {/* 2. MAIN APPLICATION VIEWS */}
      {activeTab === 'live-mission' ? (
        /* LIVE MISSION DISASTER RESPONSE COMMAND CENTER VIEW */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header 
            missionState={missionState}
            simulationMode={simulationMode}
            onSetSimulationMode={handleSetSimulationMode}
            isPlayingAutoDemo={isPlayingAutoDemo}
            onToggleAutoDemo={() => {
              if (isPlayingAutoDemo) {
                setIsPlayingAutoDemo(false);
              } else {
                setSimulationMode('NORMAL');
                setIsPlayingAutoDemo(true);
              }
            }}
            layoutMode={layoutMode}
            onSetLayoutMode={setLayoutMode}
          />

          <main className="flex-1 p-2 flex flex-col gap-2 min-h-0 overflow-hidden">
            {/* Upper Operations Row: Dual Primary Command View */}
            <section className="flex-[7] min-h-0 grid grid-cols-12 gap-2">
              {layoutMode === '3_PANE' ? (
                <>
                  <div className="col-span-3 h-full min-h-0">
                    <MissionTelemetry 
                      missionState={missionState}
                      dronePosition={dronePosition}
                      isOffline={isOffline}
                      isBacktracking={isBacktracking}
                    />
                  </div>
                  <div className="col-span-5 h-full min-h-0 shadow-2xl">
                    <LiveDisasterMap 
                      missionState={missionState}
                      dronePosition={dronePosition}
                      locationPath={locationPath}
                      detectionEvents={detectionEvents}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                    />
                  </div>
                  <div className="col-span-4 h-full min-h-0">
                    <LiveAICameraFeed missionState={missionState} />
                  </div>
                </>
              ) : layoutMode === 'CAM_FOCUS' ? (
                <>
                  <div className="col-span-4 h-full min-h-0 shadow-2xl">
                    <LiveDisasterMap 
                      missionState={missionState}
                      dronePosition={dronePosition}
                      locationPath={locationPath}
                      detectionEvents={detectionEvents}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                    />
                  </div>
                  <div className="col-span-8 h-full min-h-0">
                    <LiveAICameraFeed missionState={missionState} />
                  </div>
                </>
              ) : layoutMode === 'MAP_FOCUS' ? (
                <>
                  <div className="col-span-8 h-full min-h-0 shadow-2xl">
                    <LiveDisasterMap 
                      missionState={missionState}
                      dronePosition={dronePosition}
                      locationPath={locationPath}
                      detectionEvents={detectionEvents}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                    />
                  </div>
                  <div className="col-span-4 h-full min-h-0">
                    <LiveAICameraFeed missionState={missionState} />
                  </div>
                </>
              ) : (
                /* DUAL_SPLIT (50/50 Balanced Power View - Default) */
                <>
                  <div className="col-span-6 h-full min-h-0 shadow-2xl">
                    <LiveDisasterMap 
                      missionState={missionState}
                      dronePosition={dronePosition}
                      locationPath={locationPath}
                      detectionEvents={detectionEvents}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                    />
                  </div>
                  <div className="col-span-6 h-full min-h-0 shadow-2xl">
                    <LiveAICameraFeed missionState={missionState} />
                  </div>
                </>
              )}
            </section>

            {/* Lower Diagnostics & Events Row */}
            <section className="flex-[3] min-h-0 grid grid-cols-12 gap-2">
              <div className="col-span-3 h-full min-h-0">
                <LiveEventLog events={eventLog} />
              </div>

              <div className="col-span-4 h-full min-h-0">
                <AIDetectionsPanel onDetectionsUpdate={setDetectionEvents} />
              </div>

              <div className="col-span-3 h-full min-h-0">
                <RiskHeatmapStatus />
              </div>

              <div className="col-span-2 h-full min-h-0">
                <MissionControlPanel onActionTrigger={handleActionTrigger} />
              </div>
            </section>
          </main>

          <BottomStatusBar 
            telemetry={{
              droneId: missionState.droneId,
              checkpoints: { currentId: missionState.checkpoint, total: 4 },
              flightMode: missionState.flightMode,
              position: { altitudeAgl: missionState.altitude, groundSpeed: missionState.speed },
              battery: { percentage: Math.round(missionState.battery || 84) }
            }}
            dronePosition={dronePosition}
            isOfflineMode={isOffline}
          />
        </div>
      ) : activeTab === 'aeris01-operations' ? (
        <AERIS01OperationsView 
          missionState={missionState}
          activeZone={activeZone}
          onBack={() => setActiveTab('live-mission')}
        />
      ) : activeTab === 'incidents' ? (
        <IncidentResponseView 
          survivors={SURVIVORS_LIST}
          hazards={HAZARDS_LIST}
          activeZone={activeZone}
          onBack={() => setActiveTab('live-mission')}
        />
      ) : (
        <MissionIntelligenceView 
          missionState={missionState}
          activeZone={activeZone}
          onBack={() => setActiveTab('live-mission')}
        />
      )}
    </div>
  );
}
