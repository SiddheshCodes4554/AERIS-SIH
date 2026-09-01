import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation.jsx';
import AERIS01OperationsView from './components/operations/AERIS01OperationsView.jsx';
import IncidentResponseView from './components/incidents/IncidentResponseView.jsx';
import MissionIntelligenceView from './components/analytics/MissionIntelligenceView.jsx';

// Live Operations Components
import Header from './components/Header.jsx';
import MissionTelemetry from './components/MissionTelemetry.jsx';
import LiveDisasterMap from './components/LiveDisasterMap.jsx';
import LiveAICameraFeed from './components/LiveAICameraFeed.jsx';
import LiveEventLog from './components/LiveEventLog.jsx';
import AIDetectionsPanel from './components/AIDetectionsPanel.jsx';
import RiskHeatmapStatus from './components/RiskHeatmapStatus.jsx';
import MissionControlPanel from './components/MissionControlPanel.jsx';
import BottomStatusBar from './components/BottomStatusBar.jsx';

import { DISASTER_ZONES } from './data/operationalAreas.js';
import {
  INITIAL_MISSION_STATE,
  CHECKPOINTS_ROUTE,
  FLIGHT_PATHS,
  SURVIVORS_LIST,
  HAZARDS_LIST,
  RISK_HEATMAP_DATA,
  AI_DETECTIONS_LOG,
  CHRONOLOGICAL_EVENTS
} from './data/mockData.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('live-mission'); // 'live-mission' | 'aeris01-operations' | 'incidents' | 'intelligence'
  const [selectedZoneId, setSelectedZoneId] = useState('chamoli-flood');
  const [simulationMode, setSimulationMode] = useState('NORMAL');
  const [isPlayingAutoDemo, setIsPlayingAutoDemo] = useState(false);
  const [missionState, setMissionState] = useState(INITIAL_MISSION_STATE);
  const [eventLog, setEventLog] = useState(CHRONOLOGICAL_EVENTS);

  // Active Selected Operational Disaster Zone
  const activeZone = DISASTER_ZONES.find(z => z.id === selectedZoneId) || DISASTER_ZONES[0];

  // Automated Backtracking Recovery Demo Engine
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

  const handleSelectZone = (zoneId) => {
    setSelectedZoneId(zoneId);
    const zone = DISASTER_ZONES.find(z => z.id === zoneId) || DISASTER_ZONES[0];
    const now = new Date().toISOString().substring(11, 19);

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

  const handleSetSimulationMode = (mode) => {
    setSimulationMode(mode);
    const now = new Date().toISOString().substring(11, 19);

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
        { time: now, text: `YOLO AI Detection: Survivor Confirmed (96% Conf, ${activeZone.shortName})`, color: "amber" },
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

  const handleActionTrigger = (action) => {
    const now = new Date().toISOString().substring(11, 19);
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

  const isOffline = simulationMode === 'SIGNAL_LOSS';
  const isBacktracking = simulationMode === 'BACKTRACKING';

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
          />

          <main className="flex-1 p-2 flex flex-col gap-2 min-h-0 overflow-hidden">
            {/* Upper Operations Row */}
            <section className="flex-[7] min-h-0 grid grid-cols-12 gap-2">
              <div className="col-span-3 h-full min-h-0">
                <MissionTelemetry 
                  missionState={missionState}
                  isOffline={isOffline}
                  isBacktracking={isBacktracking}
                />
              </div>

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

              <div className="col-span-3 h-full min-h-0">
                <LiveAICameraFeed 
                  missionState={missionState}
                />
              </div>
            </section>

            {/* Lower Diagnostics & Events Row */}
            <section className="flex-[3] min-h-0 grid grid-cols-12 gap-2">
              <div className="col-span-4 h-full min-h-0">
                <LiveEventLog 
                  events={eventLog}
                />
              </div>

              <div className="col-span-3 h-full min-h-0">
                <AIDetectionsPanel 
                  detections={AI_DETECTIONS_LOG}
                />
              </div>

              <div className="col-span-3 h-full min-h-0">
                <RiskHeatmapStatus />
              </div>

              <div className="col-span-2 h-full min-h-0">
                <MissionControlPanel 
                  onActionTrigger={handleActionTrigger}
                />
              </div>
            </section>
          </main>

          <BottomStatusBar 
            telemetry={{
              droneId: missionState.droneId,
              checkpoints: { currentId: missionState.checkpoint, total: 4 },
              flightMode: missionState.flightMode,
              position: { altitudeAgl: missionState.altitude, groundSpeed: missionState.speed },
              battery: { percentage: missionState.battery }
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
