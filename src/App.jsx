import React, { useState } from 'react';
import TopNavbar from './components/TopNavbar.jsx';
import LeftOperationsPanel from './components/LeftOperationsPanel.jsx';
import RightAlertsPanel from './components/RightAlertsPanel.jsx';
import SelectedDroneCard from './components/SelectedDroneCard.jsx';
import BottomAnalytics from './components/BottomAnalytics.jsx';
import MapControls from './components/MapControls.jsx';
import MissionMap from './components/MissionMap.jsx';

import {
  FLEET_SUMMARY,
  EFFICIENCY_TIMELINE,
  DRONE_FLEET,
  ACTIVE_ALERTS,
  AI_INTELLIGENCE,
  INCIDENT_ZONES,
  MISSION_CHECKPOINTS
} from './data/mockData.js';

export default function App() {
  const [activeNavTab, setActiveNavTab] = useState("Live Operations");
  const [selectedDroneId, setSelectedDroneId] = useState("AERIS-01");
  const [mapLayer, setMapLayer] = useState("satellite"); // satellite | terrain
  const [showIncidentZones, setShowIncidentZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapCenter, setMapCenter] = useState([30.5520, 79.5580]);

  // Find currently selected drone object
  const selectedDrone = DRONE_FLEET.find(d => d.id === selectedDroneId) || DRONE_FLEET[0];

  // Handle Drone selection
  const handleSelectDrone = (droneId) => {
    setSelectedDroneId(droneId);
    const target = DRONE_FLEET.find(d => d.id === droneId);
    if (target && target.position) {
      setMapCenter([target.position.lat, target.position.lng]);
    }
  };

  // Recenter on disaster operations zone
  const handleRecenter = () => {
    if (selectedDrone && selectedDrone.position) {
      setMapCenter([selectedDrone.position.lat, selectedDrone.position.lng]);
    } else {
      setMapCenter([30.5520, 79.5580]);
    }
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-aeris-bg text-aeris-textPrimary flex flex-col font-sans select-none">
      {/* 1. LAYER 0: FULL-SCREEN INTERACTIVE SATELLITE / TERRAIN MAP CANVAS */}
      <MissionMap 
        drones={DRONE_FLEET}
        selectedDroneId={selectedDroneId}
        onSelectDrone={handleSelectDrone}
        incidentZones={INCIDENT_ZONES}
        checkpoints={MISSION_CHECKPOINTS}
        mapLayer={mapLayer}
        showIncidentZones={showIncidentZones}
        showRoutes={showRoutes}
        centerPosition={mapCenter}
      />

      {/* 2. LAYER 1: TOP NAVIGATION BAR */}
      <TopNavbar 
        activeTab={activeNavTab} 
        onTabChange={setActiveNavTab} 
      />

      {/* 3. LAYER 2: FLOATING DASHBOARD INTERFACE PANELS */}
      <div className="relative flex-1 p-4 pointer-events-none flex justify-between z-10 overflow-hidden">
        {/* LEFT FLOATING OPERATIONS PANEL */}
        <div className="pointer-events-auto h-full flex flex-col">
          <LeftOperationsPanel 
            fleetSummary={FLEET_SUMMARY}
            efficiencyData={EFFICIENCY_TIMELINE}
            drones={DRONE_FLEET}
            selectedDroneId={selectedDroneId}
            onSelectDrone={handleSelectDrone}
          />
        </div>

        {/* CENTER FLOATING AREA (Top Controls + Bottom Selected Drone Card) */}
        <div className="flex-1 flex flex-col justify-between items-center px-4 h-full">
          {/* Top Map Action Bar */}
          <div className="pointer-events-auto">
            <MapControls 
              mapLayer={mapLayer}
              onToggleLayer={setMapLayer}
              showIncidentZones={showIncidentZones}
              onToggleIncidents={() => setShowIncidentZones(!showIncidentZones)}
              showRoutes={showRoutes}
              onToggleRoutes={() => setShowRoutes(!showRoutes)}
              onRecenter={handleRecenter}
            />
          </div>

          {/* Bottom Selected Drone Detail Card */}
          <div className="pointer-events-auto w-full max-w-[760px] pb-1">
            <SelectedDroneCard drone={selectedDrone} />
          </div>
        </div>

        {/* RIGHT FLOATING ALERTS & ANALYTICS COLUMN */}
        <div className="pointer-events-auto h-full flex flex-col justify-between space-y-3">
          <div className="flex-1 min-h-0">
            <RightAlertsPanel 
              alerts={ACTIVE_ALERTS}
              aiIntelligence={AI_INTELLIGENCE}
            />
          </div>
          
          {/* Bottom Right Analytics Summary Strip */}
          <div className="shrink-0">
            <BottomAnalytics fleetSummary={FLEET_SUMMARY} />
          </div>
        </div>
      </div>
    </div>
  );
}
