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
import IncidentResponseView from './components/operations/IncidentResponseView';
import MissionIntelligenceView from './components/operations/MissionIntelligenceView';

import { 
  DEFAULT_MISSION_STATE, 
  DISASTER_ZONES,
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
  const [simulationMode, setSimulationMode] = useState('NORMAL'); // 'NORMAL' | 'SIGNAL_LOSS' | 'BACKTRACKING' | 'RECONNECTED' | 'DETECTION'
  const [isPlayingAutoDemo, setIsPlayingAutoDemo] = useState(false);
  const [eventLog, setEventLog] = useState(INITIAL_EVENT_LOG);
  const [layoutMode, setLayoutMode] = useState('DUAL_SPLIT'); // 'DUAL_SPLIT' (50/50) | '3_PANE' | 'CAM_FOCUS' | 'MAP_FOCUS'

  const activeZone = DISASTER_ZONES.find(z => z.id === selectedZoneId) || DISASTER_ZONES[0];
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const wsUrl = backendUrl.replace(/^http/, 'ws') + '/ws/live';

  // 1. Initial State & Real-Time WebSocket Synchronization
  useEffect(() => {
    let ws = null;
    let pollTimer = null;

    const fetchInitialTelemetry = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/telemetry/current`, { mode: 'cors' });
        if (res.ok) {
          const data = await res.json();
          setMissionState(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (err) {
        console.debug("Backend telemetry standby:", err);
      }
    };

    const connectWS = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected to AERIS Telemetry Stream");
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'init') {
              if (msg.telemetry) {
                setMissionState(prev => ({ ...prev, ...msg.telemetry }));
              }
            } else if (msg.type === 'telemetry') {
              setMissionState(prev => ({
                ...prev,
                ...msg.data
              }));
            } else if (msg.type === 'detection') {
              const det = msg.data;
              const now = new Date().toISOString().substring(11, 19);
              const confPct = det.confidence_pct || Math.round((det.confidence || 0.95) * 100);
              setEventLog(prev => [
                {
                  time: now,
                  text: `AERIS Vision AI: ${det.display_name} (${confPct}% Conf) • CAM-01`,
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
          if (!pollTimer) pollTimer = setInterval(fetchInitialTelemetry, 2500);
        };

        ws.onclose = () => {
          if (!pollTimer) pollTimer = setInterval(fetchInitialTelemetry, 2500);
        };
      } catch (e) {
        pollTimer = setInterval(fetchInitialTelemetry, 2500);
      }
    };

    fetchInitialTelemetry();
    connectWS();

    return () => {
      if (ws) ws.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [backendUrl, wsUrl]);

  // 2. Automated Backtracking Recovery Demo Engine
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

  // 3. Dynamic Disaster Zone Switcher
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
      { time: now, text: `Autonomous Search Pattern Loaded • Coordinates: ${zone.coordinatesFormatted}`, color: "green" },
      ...prev
    ]);
  };

  // 4. Failover & Backtracking Simulation Mode
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
        bufferedEventsCount: 24,
        signalLostTime: '02:14 AGO'
      }));
      setEventLog(prev => [
        { time: now, text: "⚠ RF Signal Lost (Mountain Gorge Obstruction) • Local Edge AI Autonomous Mode Active", color: "red" },
        { time: now, text: "Edge AI Buffering Critical Video & Detection Data to NVMe Storage (24 Events)", color: "amber" },
        ...prev
      ]);
    } else if (mode === 'BACKTRACKING') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'BACKTRACKING',
        backtrackingProgress: 72,
        checkpoint: activeZone.lastConnectedCheckpoint
      }));
      setEventLog(prev => [
        { time: now, text: `Autonomous Backtracking Engaged • Reversing along recorded path to ${activeZone.lastConnectedCheckpoint} (72%)`, color: "amber" },
        ...prev
      ]);
    } else if (mode === 'RECONNECTED') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'CONNECTED',
        bufferedEventsCount: 0
      }));
      setEventLog(prev => [
        { time: now, text: `5.8 GHz Mesh Link Restored at ${activeZone.lastConnectedCheckpoint} • Transmitting Buffered Telemetry`, color: "green" },
        { time: now, text: "Data Synchronization Complete • 100% Data Integrity Verified", color: "green" },
        ...prev
      ]);
    } else if (mode === 'DETECTION') {
      setEventLog(prev => [
        { time: now, text: `YOLO AI Detection: Target Confirmed (${activeZone.shortName})`, color: "green" },
        ...prev
      ]);
    } else {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'CONNECTED',
        bufferedEventsCount: 0
      }));
      setEventLog(prev => [
        { time: now, text: "Autonomous Search Pattern Resumed • Mission Status Nominal", color: "green" },
        ...prev
      ]);
    }
  };

  // 5. Operator Command Triggers
  const handleActionTrigger = async (action) => {
    const now = new Date().toISOString().substring(11, 19);

    try {
      await fetch(`${backendUrl}/api/mission/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
    } catch (e) {
      console.debug("Backend action sync:", e);
    }

    if (action === 'PAUSE_MISSION') {
      setEventLog(prev => [{ time: now, text: `Mission Paused • Loitering at ${activeZone.altitude}m AGL`, color: "amber" }, ...prev]);
    } else if (action === 'RESUME_MISSION') {
      setEventLog(prev => [{ time: now, text: "Mission Resumed • Navigating to Waypoint", color: "green" }, ...prev]);
    } else if (action === 'RETURN_TO_BASE') {
      setEventLog(prev => [{ time: now, text: "RTL Command Issued • Returning to Staging Heli-Pad LZ", color: "blue" }, ...prev]);
    } else if (action === 'MARK_LOCATION') {
      setEventLog(prev => [{ time: now, text: `Geo-Marker Dropped at ${activeZone.coordinatesFormatted}`, color: "blue" }, ...prev]);
    } else if (action === 'MANUAL_OVERRIDE_ACTIVE') {
      setEventLog(prev => [{ time: now, text: "EMERGENCY MANUAL OVERRIDE ENGAGED", color: "red" }, ...prev]);
    }
  };

  const isOffline = simulationMode === 'SIGNAL_LOSS' || missionState.connectionState === 'OFFLINE_MODE';
  const isBacktracking = simulationMode === 'BACKTRACKING' || missionState.connectionState === 'BACKTRACKING';

  return (
    <div className="h-screen w-screen bg-[#070909] text-[#F2F4F3] flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP GLOBAL AERIS NAVIGATION BAR WITH AREA SELECTOR */}
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
                      isOffline={isOffline}
                      isBacktracking={isBacktracking}
                    />
                  </div>
                  <div className="col-span-5 h-full min-h-0 shadow-2xl">
                    <LiveDisasterMap 
                      missionState={missionState}
                      checkpoints={activeZone.checkpoints || CHECKPOINTS_ROUTE}
                      flightPaths={activeZone.flightPaths || FLIGHT_PATHS}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                      isOffline={isOffline}
                      isBacktracking={isBacktracking}
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
                      checkpoints={activeZone.checkpoints || CHECKPOINTS_ROUTE}
                      flightPaths={activeZone.flightPaths || FLIGHT_PATHS}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                      isOffline={isOffline}
                      isBacktracking={isBacktracking}
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
                      checkpoints={activeZone.checkpoints || CHECKPOINTS_ROUTE}
                      flightPaths={activeZone.flightPaths || FLIGHT_PATHS}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                      isOffline={isOffline}
                      isBacktracking={isBacktracking}
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
                      checkpoints={activeZone.checkpoints || CHECKPOINTS_ROUTE}
                      flightPaths={activeZone.flightPaths || FLIGHT_PATHS}
                      survivors={SURVIVORS_LIST}
                      hazards={HAZARDS_LIST}
                      heatmapData={RISK_HEATMAP_DATA}
                      isOffline={isOffline}
                      isBacktracking={isBacktracking}
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
                <AIDetectionsPanel />
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
              battery: { percentage: Math.round(missionState.battery) }
            }}
            isOfflineMode={isOffline || isBacktracking}
          />
        </div>
      ) : activeTab === 'aeris01-operations' ? (
        /* AERIS-01 SYSTEM OPERATIONS & UAV HEALTH VIEW */
        <div className="flex-1 min-h-0 overflow-hidden">
          <AERIS01OperationsView />
        </div>
      ) : activeTab === 'incidents' ? (
        /* INCIDENT RESPONSE & AI ALERT MANAGEMENT VIEW */
        <div className="flex-1 min-h-0 overflow-hidden">
          <IncidentResponseView />
        </div>
      ) : (
        /* MISSION INTELLIGENCE & SATELLITE HEATMAP VIEW */
        <div className="flex-1 min-h-0 overflow-hidden">
          <MissionIntelligenceView />
        </div>
      )}
    </div>
  );
}
