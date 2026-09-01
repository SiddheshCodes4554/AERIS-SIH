import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('aeris01-operations'); // 'aeris01-operations' | 'live-mission' | 'incidents' | 'intelligence'
  const [simulationMode, setSimulationMode] = useState('NORMAL');
  const [missionState, setMissionState] = useState(INITIAL_MISSION_STATE);
  const [eventLog, setEventLog] = useState(CHRONOLOGICAL_EVENTS);

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
        { time: now, text: "RF Signal Lost (Mountain Ridge Obstruction) • Local Edge AI Active", color: "red" },
        ...prev
      ]);
    } else if (mode === 'BACKTRACKING') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'BACKTRACKING',
        backtrackingProgress: 72,
        checkpoint: 'CP-03'
      }));
      setEventLog(prev => [
        { time: now, text: "Autonomous Backtracking Active • Returning to CP-03 (72%)", color: "amber" },
        ...prev
      ]);
    } else if (mode === 'RECONNECTED') {
      setMissionState(prev => ({
        ...prev,
        connectionState: 'CONNECTED',
        bufferedEventsCount: 0
      }));
      setEventLog(prev => [
        { time: now, text: "Mesh Link Restored at CP-03 • 24 Buffered Events Transmitted", color: "green" },
        ...prev
      ]);
    } else if (mode === 'DETECTION') {
      setEventLog(prev => [
        { time: now, text: "YOLO AI Detection: Survivor Confirmed (94% Conf, Sector B-4)", color: "amber" },
        ...prev
      ]);
    } else {
      setMissionState(INITIAL_MISSION_STATE);
      setEventLog(prev => [
        { time: now, text: "System State Normal • Autonomous Search Pattern Active", color: "green" },
        ...prev
      ]);
    }
  };

  const handleActionTrigger = (action) => {
    const now = new Date().toISOString().substring(11, 19);
    if (action === 'PAUSE_MISSION') {
      setEventLog(prev => [{ time: now, text: "Mission Paused • Loitering at 120m AGL", color: "amber" }, ...prev]);
    } else if (action === 'RESUME_MISSION') {
      setEventLog(prev => [{ time: now, text: "Mission Resumed • Navigating to Waypoint", color: "green" }, ...prev]);
    } else if (action === 'RETURN_TO_BASE') {
      setEventLog(prev => [{ time: now, text: "RTL Command Issued • Returning to Staging Heli-Pad LZ", color: "blue" }, ...prev]);
    } else if (action === 'MARK_LOCATION') {
      setEventLog(prev => [{ time: now, text: "Geo-Marker Dropped at Lat: 30.5610, Lng: 79.5680", color: "blue" }, ...prev]);
    } else if (action === 'MANUAL_OVERRIDE_ACTIVE') {
      setEventLog(prev => [{ time: now, text: "EMERGENCY MANUAL OVERRIDE ENGAGED", color: "red" }, ...prev]);
    }
  };

  const isOffline = simulationMode === 'SIGNAL_LOSS';
  const isBacktracking = simulationMode === 'BACKTRACKING';

  return (
    <div className="h-screen w-screen bg-[#070909] text-[#F2F4F3] flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP GLOBAL AERIS NAVIGATION BAR */}
      <Navigation 
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 2. MAIN APPLICATION VIEWS */}
      {activeTab === 'aeris01-operations' ? (
        /* AERIS-01 SYSTEM OPERATIONS & UAV HEALTH VIEW */
        <div className="flex-1 min-h-0 overflow-hidden">
          <AERIS01OperationsView />
        </div>
      ) : activeTab === 'incidents' ? (
        /* INCIDENT RESPONSE & AI ALERT MANAGEMENT VIEW */
        <div className="flex-1 min-h-0 overflow-hidden">
          <IncidentResponseView />
        </div>
      ) : activeTab === 'intelligence' ? (
        /* MISSION INTELLIGENCE & SATELLITE HEATMAP VIEW */
        <div className="flex-1 min-h-0 overflow-hidden">
          <MissionIntelligenceView />
        </div>
      ) : (
        /* LIVE MISSION DISASTER RESPONSE COMMAND CENTER VIEW */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header 
            missionState={missionState}
            simulationMode={simulationMode}
            onSetSimulationMode={handleSetSimulationMode}
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
                  checkpoints={CHECKPOINTS_ROUTE}
                  flightPaths={FLIGHT_PATHS}
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
              checkpoints: { currentId: missionState.checkpoint, total: 5 },
              flightMode: missionState.flightMode,
              position: { altitudeAgl: missionState.altitude, groundSpeed: missionState.speed },
              battery: { percentage: missionState.battery }
            }}
            isOfflineMode={isOffline || isBacktracking}
          />
        </div>
      )}
    </div>
  );
}
