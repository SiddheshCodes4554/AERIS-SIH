import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  RotateCcw, 
  Activity, 
  Compass, 
  Sparkles,
  Sliders
} from 'lucide-react';

import DroneVisualization from './DroneVisualization.jsx';
import SystemHealthGrid from './SystemHealthGrid.jsx';
import SensorStatusList from './SensorStatusList.jsx';
import OperationsMap from './OperationsMap.jsx';
import AutonomyPipeline from './AutonomyPipeline.jsx';
import CameraPreviewCompact from './CameraPreviewCompact.jsx';
import TimelineAndControls from './TimelineAndControls.jsx';

import { AERIS01_HEALTH_DATA } from '../../data/droneHealthData.js';

export default function AERIS01OperationsView() {
  const [healthData, setHealthData] = useState(AERIS01_HEALTH_DATA);
  const [isOfflineSimulation, setIsOfflineSimulation] = useState(false);
  const [isBacktrackingSimulation, setIsBacktrackingSimulation] = useState(false);

  const handleToggleOffline = (forceState) => {
    const nextState = typeof forceState === 'boolean' ? forceState : !isOfflineSimulation;
    setIsOfflineSimulation(nextState);
    if (nextState) {
      setIsBacktrackingSimulation(true);
    } else {
      setIsBacktrackingSimulation(false);
    }
  };

  const handleActionTrigger = (action) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (action === 'INITIATE_BACKTRACK') {
      setIsBacktrackingSimulation(true);
      setIsOfflineSimulation(true);
      setHealthData(prev => ({
        ...prev,
        systemEvents: [
          { time: now, category: "BACKTRACK", text: "Autonomous Backtracking Initiated • Returning to CP-03 (72%)", color: "amber" },
          ...prev.systemEvents
        ]
      }));
    } else if (action === 'PAUSE_MISSION') {
      setHealthData(prev => ({
        ...prev,
        systemEvents: [
          { time: now, category: "MISSION", text: "Mission Paused • Holding Altitude at 42.5m AGL", color: "amber" },
          ...prev.systemEvents
        ]
      }));
    } else if (action === 'RESUME_MISSION') {
      setHealthData(prev => ({
        ...prev,
        systemEvents: [
          { time: now, category: "MISSION", text: "Mission Resumed • Autonomous Waypoint Navigation Active", color: "green" },
          ...prev.systemEvents
        ]
      }));
    } else if (action === 'RETURN_TO_BASE') {
      setHealthData(prev => ({
        ...prev,
        systemEvents: [
          { time: now, category: "NAVIGATION", text: "RTL Command Executed • Returning to Base Staging LZ", color: "blue" },
          ...prev.systemEvents
        ]
      }));
    } else if (action === 'MANUAL_OVERRIDE_ACTIVE') {
      setHealthData(prev => ({
        ...prev,
        systemEvents: [
          { time: now, category: "OVERRIDE", text: "EMERGENCY MANUAL JOYSTICK OVERRIDE ENGAGED", color: "red" },
          ...prev.systemEvents
        ]
      }));
    }
  };

  return (
    <div className="w-full h-full p-3 overflow-y-auto font-sans select-none space-y-2.5 bg-[#070909] text-[#F2F4F3]">
      {/* 1. PAGE TITLE & STATUS HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-[#111516] border border-white/5 rounded-2xl p-3 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-semibold tracking-wider font-mono text-[#F2F4F3]">
              AERIS-01 Operations
            </h1>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 font-bold">
              AUTONOMOUS UAV GROUND CONTROL
            </span>
          </div>
          <p className="text-[11px] text-[#8C9492] mt-0.5 font-light">
            Real-time autonomous system monitoring and mission control.
          </p>
        </div>

        {/* Right Status & Offline Simulation Toggle */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Interactive Simulation Switch */}
          <button
            onClick={() => handleToggleOffline()}
            className={`px-3 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 text-[10.5px] font-bold ${
              isOfflineSimulation || isBacktrackingSimulation
                ? 'bg-[#F5A623]/20 text-[#F5A623] border-[#F5A623]/40 shadow-[0_0_10px_rgba(245,166,35,0.4)] animate-pulse'
                : 'bg-[#181D1E] hover:bg-[#1C2125] text-[#8C9492] hover:text-[#F2F4F3] border-white/5'
            }`}
            title="Click to simulate signal loss and autonomous backtracking recovery"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isOfflineSimulation ? 'SIMULATING OFFLINE' : 'SIMULATE OFFLINE'}</span>
          </button>

          {/* System Status: NOMINAL */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#181D1E] border border-white/5 text-[#F2F4F3]">
            <span className={`w-2 h-2 rounded-full ${
              isOfflineSimulation ? 'bg-[#F5A623] animate-pulse' : 'bg-[#63C174] shadow-[0_0_6px_#63C174]'
            }`}></span>
            <span className={`font-bold text-[11px] ${isOfflineSimulation ? 'text-[#F5A623]' : 'text-[#63C174]'}`}>
              {isOfflineSimulation ? '● OFFLINE / BACKTRACK' : '● SYSTEM NOMINAL'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP SYSTEM SUMMARY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-[10px] bg-[#111516] border border-white/5 rounded-2xl p-2.5 shadow-xl text-center">
        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">DRONE UNIT</span>
          <strong className="text-sm text-[#3B9EFF] font-bold block">{healthData.droneId}</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">SYSTEM STATUS</span>
          <strong className="text-sm text-[#63C174] font-bold block">● {healthData.missionStatus}</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">CURRENT MISSION</span>
          <strong className="text-xs text-[#F2F4F3] font-bold block truncate">{healthData.missionName}</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">FLIGHT MODE</span>
          <strong className="text-sm text-[#3B9EFF] font-bold block">{healthData.flightMode}</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">MISSION PROGRESS</span>
          <div className="flex items-center justify-center space-x-1.5 mt-0.5">
            <strong className="text-sm text-[#63C174] font-bold">{healthData.missionProgress}%</strong>
            <div className="w-12 bg-[#070909] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#63C174] h-full rounded-full w-[68%]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. UPPER SECTION: SYSTEM HEALTH (Left ~45%) | DRONE STATUS VISUALIZATION (Right ~55%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-[340px]">
        {/* Left: Detailed System Health Grid */}
        <div className="lg:col-span-5 h-full min-h-0">
          <SystemHealthGrid 
            healthData={healthData}
            isOffline={isOfflineSimulation}
          />
        </div>

        {/* Right: Technical Drone Quadcopter Visualization with Surrounding Telemetry */}
        <div className="lg:col-span-7 h-full min-h-0">
          <DroneVisualization 
            healthData={healthData}
            isOffline={isOfflineSimulation}
          />
        </div>
      </div>

      {/* 4. MIDDLE SECTION: SENSOR SYSTEMS (Left ~35%) | LIVE POSITION MAP (Center ~45%) | CAMERA PREVIEW (Right ~20%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-[280px]">
        {/* Sensor Systems Status List (4 Cols) */}
        <div className="lg:col-span-4 h-full min-h-0">
          <SensorStatusList 
            sensors={healthData.sensors}
            isOffline={isOfflineSimulation}
          />
        </div>

        {/* Live Satellite Position Map (5 Cols) */}
        <div className="lg:col-span-5 h-full min-h-0">
          <OperationsMap 
            checkpoints={healthData.checkpoints}
            flightPaths={healthData.flightPaths}
            flightTelemetry={healthData.flightTelemetry}
            isOffline={isOfflineSimulation}
            isBacktracking={isBacktrackingSimulation}
          />
        </div>

        {/* Compact Camera Preview (3 Cols) */}
        <div className="lg:col-span-3 h-full min-h-0">
          <CameraPreviewCompact />
        </div>
      </div>

      {/* 5. LOWER AUTONOMY PIPELINE FLOW (Standard vs Offline Backtracking Sequence) */}
      <div className="w-full">
        <AutonomyPipeline 
          isOffline={isOfflineSimulation}
          isBacktracking={isBacktrackingSimulation}
        />
      </div>

      {/* 6. BOTTOM SECTION: SYSTEM EVENT TIMELINE & MISSION CONTROLS */}
      <div className="w-full h-[180px]">
        <TimelineAndControls 
          events={healthData.systemEvents}
          onActionTrigger={handleActionTrigger}
          isOffline={isOfflineSimulation}
          onToggleOffline={() => handleToggleOffline()}
        />
      </div>
    </div>
  );
}
