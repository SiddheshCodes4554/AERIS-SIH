import React, { useState } from 'react';
import Header from './components/Header.jsx';
import MissionTelemetry from './components/MissionTelemetry.jsx';
import LiveDisasterMap from './components/LiveDisasterMap.jsx';
import RescueIntelligence from './components/RescueIntelligence.jsx';
import LiveCameraFeeds from './components/LiveCameraFeeds.jsx';
import CommunicationPanel from './components/CommunicationPanel.jsx';
import MissionEvents from './components/MissionEvents.jsx';
import MissionControls from './components/MissionControls.jsx';
import BottomStatusBar from './components/BottomStatusBar.jsx';

import {
  MISSION_METADATA,
  DRONE_TELEMETRY,
  CHECKPOINTS_LIST,
  FLIGHT_ROUTES,
  SURVIVORS_DATA,
  HAZARDS_DATA,
  RESCUE_INTELLIGENCE_ITEMS,
  RISK_HEATMAP_ZONES,
  SENSOR_FUSION_DATA,
  COMMUNICATION_STATE,
  INITIAL_MISSION_EVENTS
} from './data/mockData.js';

export default function App() {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [missionEvents, setMissionEvents] = useState(INITIAL_MISSION_EVENTS);
  const [telemetry, setTelemetry] = useState(DRONE_TELEMETRY);

  // Toggle Signal Loss / Autonomous Backtracking Simulation
  const handleToggleOffline = (forceState) => {
    const newState = typeof forceState === 'boolean' ? forceState : !isOfflineMode;
    setIsOfflineMode(newState);

    if (newState) {
      setMissionEvents(prev => [
        { time: new Date().toISOString().substring(11, 19), label: "Signal Lost (Terrain Shadow) • Backtrack Initiated", color: "amber", icon: "backtrack" },
        ...prev
      ]);
    } else {
      setMissionEvents(prev => [
        { time: new Date().toISOString().substring(11, 19), label: "Link Restored via CP-3 Mesh • Data Synchronized", color: "green", icon: "wifi" },
        ...prev
      ]);
    }
  };

  const handleActionTrigger = (action) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    if (action === 'START_MISSION') {
      setMissionEvents(prev => [{ time: timestamp, label: "Mission Resumed (Autonomous Navigation Active)", color: "green" }, ...prev]);
    } else if (action === 'PAUSE_MISSION') {
      setMissionEvents(prev => [{ time: timestamp, label: "Mission Paused (Holding Position / Loitering)", color: "amber" }, ...prev]);
    } else if (action === 'RETURN_TO_BASE') {
      setMissionEvents(prev => [{ time: timestamp, label: "RTL Command Issued (Returning to Base LZ)", color: "blue" }, ...prev]);
    } else if (action === 'MANUAL_OVERRIDE_ACTIVE') {
      setMissionEvents(prev => [{ time: timestamp, label: "EMERGENCY MANUAL OVERRIDE ENGAGED", color: "red" }, ...prev]);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#070909] text-aeris-textPrimary flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER (Sleek 56px) */}
      <Header 
        metadata={MISSION_METADATA}
        isOfflineMode={isOfflineMode}
        onToggleOfflineSimulation={() => handleToggleOffline()}
      />

      {/* 2. MAIN 3-COLUMN STRUCTURED COMMAND CENTER WORKSPACE */}
      <main className="flex-1 p-2 grid grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT COLUMN (Cols 1-3 / ~25%): MISSION TELEMETRY & COMMS LINK             */}
        {/* ========================================================================= */}
        <section className="col-span-3 flex flex-col gap-2 min-h-0 h-full">
          {/* Upper Left: Mission Telemetry (Battery, Alt, Speed, GPS, Checkpoints) */}
          <div className="flex-[6] min-h-0">
            <MissionTelemetry 
              telemetry={telemetry}
              isOfflineMode={isOfflineMode}
            />
          </div>

          {/* Lower Left: Communication & Offline Backtracking Mode */}
          <div className="flex-[4] min-h-0">
            <CommunicationPanel 
              commData={COMMUNICATION_STATE}
              isOfflineMode={isOfflineMode}
              onToggleOffline={handleToggleOffline}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CENTER COLUMN (Cols 4-9 / ~50%): DOMINANT DISASTER MAP + EO/IR CAMERAS    */}
        {/* ========================================================================= */}
        <section className="col-span-6 flex flex-col gap-2 min-h-0 h-full">
          {/* Dominant Upper Center: Large Live Disaster Satellite Map */}
          <div className="flex-[6] min-h-0 relative shadow-2xl">
            <LiveDisasterMap 
              telemetry={telemetry}
              checkpoints={CHECKPOINTS_LIST}
              flightRoutes={FLIGHT_ROUTES}
              survivors={SURVIVORS_DATA}
              hazards={HAZARDS_DATA}
              heatmapZones={RISK_HEATMAP_ZONES}
              isOfflineMode={isOfflineMode}
            />
          </div>

          {/* Lower Center: Live RGB 4K + MLX90640 Thermal EO/IR Feeds + Sensor Fusion */}
          <div className="flex-[4] min-h-0">
            <LiveCameraFeeds 
              fusionData={SENSOR_FUSION_DATA}
            />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (Cols 10-12 / ~25%): RESCUE INTELLIGENCE, EVENTS & CONTROLS  */}
        {/* ========================================================================= */}
        <section className="col-span-3 flex flex-col gap-2 min-h-0 h-full">
          {/* Upper Right: Rescue Intelligence (AI Detection Triage Feed) */}
          <div className="flex-[5] min-h-0">
            <RescueIntelligence 
              detections={RESCUE_INTELLIGENCE_ITEMS}
            />
          </div>

          {/* Middle Right: Live Chronological Mission Events Timeline */}
          <div className="flex-[3] min-h-0">
            <MissionEvents 
              events={missionEvents}
            />
          </div>

          {/* Bottom Right: Mission Action Controls & Emergency Override */}
          <div className="flex-[2] min-h-0">
            <MissionControls 
              onActionTrigger={handleActionTrigger}
              isOfflineMode={isOfflineMode}
              onToggleOffline={handleToggleOffline}
            />
          </div>
        </section>
      </main>

      {/* 3. SLIM PERSISTENT STATUS BAR (30px) */}
      <BottomStatusBar 
        telemetry={telemetry}
        isOfflineMode={isOfflineMode}
      />
    </div>
  );
}
