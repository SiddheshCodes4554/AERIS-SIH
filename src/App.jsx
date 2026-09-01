import React, { useState } from 'react';
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
  const [simulationMode, setSimulationMode] = useState('NORMAL'); // 'NORMAL' | 'DETECTION' | 'SIGNAL_LOSS' | 'BACKTRACKING' | 'RECONNECTED'
  const [missionState, setMissionState] = useState(INITIAL_MISSION_STATE);
  const [eventLog, setEventLog] = useState(CHRONOLOGICAL_EVENTS);

  // Handle Scenario Transitions
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
    <div className="h-screen w-screen bg-[#070909] text-aeris-textPrimary flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER (56px) */}
      <Header 
        missionState={missionState}
        simulationMode={simulationMode}
        onSetSimulationMode={handleSetSimulationMode}
      />

      {/* 2. MAIN DASHBOARD WORKSPACE (Exact Layout from Prompt 2) */}
      <main className="flex-1 p-2 flex flex-col gap-2 min-h-0 overflow-hidden">
        {/* ========================================================================= */}
        {/* UPPER ROW (70% Height): MISSION STATUS | LIVE MAP | LIVE AI CAMERA        */}
        {/* ========================================================================= */}
        <section className="flex-[7] min-h-0 grid grid-cols-12 gap-2">
          {/* Left: Mission Status + Telemetry (Col 1-3 / ~25% Width) */}
          <div className="col-span-3 h-full min-h-0">
            <MissionTelemetry 
              missionState={missionState}
              isOffline={isOffline}
              isBacktracking={isBacktracking}
            />
          </div>

          {/* Center: Dominant Live Mission Map (Col 4-9 / ~50% Width, 50-60% of Screen) */}
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

          {/* Right: Live AI Camera (RGB / Thermal / AI Overlay) (Col 10-12 / ~25% Width) */}
          <div className="col-span-3 h-full min-h-0">
            <LiveAICameraFeed 
              missionState={missionState}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LOWER ROW (30% Height): EVENT LOG | AI DETECTIONS | RISK HEATMAP | CONTROLS*/}
        {/* ========================================================================= */}
        <section className="flex-[3] min-h-0 grid grid-cols-12 gap-2">
          {/* Col 1-4 (33%): Live Chronological Event Log */}
          <div className="col-span-4 h-full min-h-0">
            <LiveEventLog 
              events={eventLog}
            />
          </div>

          {/* Col 5-7 (25%): AI Detections Stream */}
          <div className="col-span-3 h-full min-h-0">
            <AIDetectionsPanel 
              detections={AI_DETECTIONS_LOG}
            />
          </div>

          {/* Col 8-10 (25%): Risk Heatmap & Multi-Sensor Fusion */}
          <div className="col-span-3 h-full min-h-0">
            <RiskHeatmapStatus />
          </div>

          {/* Col 11-12 (17%): Mission Action Controls & Emergency Override */}
          <div className="col-span-2 h-full min-h-0">
            <MissionControlPanel 
              onActionTrigger={handleActionTrigger}
            />
          </div>
        </section>
      </main>

      {/* 3. SLIM PERSISTENT STATUS BAR (28px) */}
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
  );
}
