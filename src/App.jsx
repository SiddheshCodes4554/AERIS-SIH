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
      // Add event for signal lost and backtracking
      setMissionEvents(prev => [
        { time: new Date().toISOString().substring(11, 19), label: "Signal Lost (Terrain Shadow) • Autonomous Backtracking Initiated", color: "amber", icon: "backtrack" },
        ...prev
      ]);
    } else {
      // Add event for reconnection
      setMissionEvents(prev => [
        { time: new Date().toISOString().substring(11, 19), label: "Link Restored via CP-3 Mesh • Synchronizing Buffered Data", color: "green", icon: "wifi" },
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
    <div className="h-screen w-screen bg-aeris-bg text-aeris-textPrimary flex flex-col overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER (72px) */}
      <Header 
        metadata={MISSION_METADATA}
        isOfflineMode={isOfflineMode}
        onToggleOfflineSimulation={() => handleToggleOffline()}
      />

      {/* 2. MAIN STRUCTURED DASHBOARD CONTAINER (Full Viewport Grid Layout) */}
      <main className="flex-1 p-2.5 flex flex-col gap-2.5 min-h-0 overflow-y-auto lg:overflow-hidden">
        {/* UPPER ROW: MISSION TELEMETRY (Left) + LIVE DISASTER MAP (Center) + RESCUE INTELLIGENCE (Right) */}
        <section className="flex-1 flex flex-col lg:flex-row gap-2.5 min-h-[320px] lg:min-h-0">
          {/* Left Panel: Dedicated Mission Telemetry (300px) */}
          <MissionTelemetry 
            telemetry={telemetry}
            isOfflineMode={isOfflineMode}
          />

          {/* Center Panel: Large Live Disaster Map (~50-55% Width, Clear & Unobstructed) */}
          <LiveDisasterMap 
            telemetry={telemetry}
            checkpoints={CHECKPOINTS_LIST}
            flightRoutes={FLIGHT_ROUTES}
            survivors={SURVIVORS_DATA}
            hazards={HAZARDS_DATA}
            heatmapZones={RISK_HEATMAP_ZONES}
            isOfflineMode={isOfflineMode}
          />

          {/* Right Panel: Dedicated Rescue Intelligence (320px) */}
          <RescueIntelligence 
            detections={RESCUE_INTELLIGENCE_ITEMS}
          />
        </section>

        {/* MIDDLE ROW: LIVE CAMERA & AI FEED (Full Lower-Middle Row with RGB, Thermal, and Sensor Fusion) */}
        <section className="shrink-0">
          <LiveCameraFeeds 
            fusionData={SENSOR_FUSION_DATA}
          />
        </section>

        {/* BOTTOM ROW: COMMUNICATION & OFFLINE (1fr) + MISSION EVENTS (1.2fr) + MISSION CONTROLS (1fr) */}
        <section className="h-[148px] shrink-0 grid grid-cols-1 md:grid-cols-12 gap-2.5">
          {/* Communication & Offline Backtracking (Cols 1-4) */}
          <div className="md:col-span-4 h-full">
            <CommunicationPanel 
              commData={COMMUNICATION_STATE}
              isOfflineMode={isOfflineMode}
              onToggleOffline={handleToggleOffline}
            />
          </div>

          {/* Mission Events Chronological Timeline (Cols 5-8) */}
          <div className="md:col-span-4 lg:col-span-5 h-full">
            <MissionEvents 
              events={missionEvents}
            />
          </div>

          {/* Mission Controls (Cols 9-12) */}
          <div className="md:col-span-4 lg:col-span-3 h-full">
            <MissionControls 
              onActionTrigger={handleActionTrigger}
              isOfflineMode={isOfflineMode}
              onToggleOffline={handleToggleOffline}
            />
          </div>
        </section>
      </main>

      {/* 3. SLIM PERSISTENT STATUS BAR */}
      <BottomStatusBar 
        telemetry={telemetry}
        isOfflineMode={isOfflineMode}
      />
    </div>
  );
}
