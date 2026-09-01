import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  RotateCcw, 
  Cpu, 
  HardDrive, 
  ShieldCheck, 
  Navigation, 
  Sparkles, 
  Clock 
} from 'lucide-react';

import RecoveryMap from './RecoveryMap.jsx';
import AutonomyStatusPanel from './AutonomyStatusPanel.jsx';
import RecoveryProcessFlow from './RecoveryProcessFlow.jsx';
import RecoveryTimeline from './RecoveryTimeline.jsx';
import SimulationControls from './SimulationControls.jsx';

import { BACKTRACK_SCENARIOS } from '../../data/backtrackData.js';

export default function OfflineAutonomyView() {
  const [scenario] = useState(BACKTRACK_SCENARIOS);
  const [currentStage, setCurrentStage] = useState('CONNECTED'); // 'CONNECTED' | 'SIGNAL_LOST' | 'OFFLINE_AUTONOMY' | 'BACKTRACKING' | 'RECONNECTED' | 'DATA_SYNC' | 'MISSION_RESUMED'
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [dronePos, setDronePos] = useState([30.3255, 78.0435]); // Beyond CP-04
  const [droneHeading, setDroneHeading] = useState(42);
  const [syncProgress, setSyncProgress] = useState(0);
  const [backtrackProgress, setBacktrackProgress] = useState(0);
  const [timelineEvents, setTimelineEvents] = useState(BACKTRACK_SCENARIOS.timelineLog);

  // Smooth Demo Player Engine
  useEffect(() => {
    let timer;
    if (isPlayingDemo) {
      if (currentStage === 'CONNECTED') {
        setDronePos([30.3225, 78.0395]);
        setDroneHeading(42);
        timer = setTimeout(() => setCurrentStage('SIGNAL_LOST'), 2000);
      } else if (currentStage === 'SIGNAL_LOST') {
        setDronePos([30.3255, 78.0435]);
        timer = setTimeout(() => setCurrentStage('OFFLINE_AUTONOMY'), 2500);
      } else if (currentStage === 'OFFLINE_AUTONOMY') {
        timer = setTimeout(() => setCurrentStage('BACKTRACKING'), 3000);
      } else if (currentStage === 'BACKTRACKING') {
        setDroneHeading(222); // Reverse towards CP-04
        setDronePos([30.3235, 78.0405]);
        setBacktrackProgress(72);
        timer = setTimeout(() => {
          setDronePos([30.3210, 78.0375]); // Reached CP-04
          setBacktrackProgress(100);
          setCurrentStage('RECONNECTED');
        }, 3500);
      } else if (currentStage === 'RECONNECTED') {
        setDroneHeading(42);
        timer = setTimeout(() => setCurrentStage('DATA_SYNC'), 2000);
      } else if (currentStage === 'DATA_SYNC') {
        setSyncProgress(82);
        timer = setTimeout(() => {
          setSyncProgress(100);
          setCurrentStage('MISSION_RESUMED');
        }, 2500);
      } else if (currentStage === 'MISSION_RESUMED') {
        setDronePos([30.3240, 78.0415]); // Advancing forward
        timer = setTimeout(() => setIsPlayingDemo(false), 3000);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlayingDemo, currentStage]);

  const handleSetStage = (stage) => {
    setIsPlayingDemo(false);
    setCurrentStage(stage);
    if (stage === 'CONNECTED') {
      setDronePos([30.3210, 78.0375]);
      setDroneHeading(42);
      setSyncProgress(0);
      setBacktrackProgress(0);
    } else if (stage === 'SIGNAL_LOST' || stage === 'OFFLINE_AUTONOMY') {
      setDronePos([30.3255, 78.0435]);
      setDroneHeading(42);
    } else if (stage === 'BACKTRACKING') {
      setDronePos([30.3235, 78.0405]);
      setDroneHeading(222);
      setBacktrackProgress(72);
    } else if (stage === 'RECONNECTED' || stage === 'DATA_SYNC') {
      setDronePos([30.3210, 78.0375]);
      setDroneHeading(42);
      setSyncProgress(stage === 'DATA_SYNC' ? 82 : 0);
    } else if (stage === 'MISSION_RESUMED') {
      setDronePos([30.3240, 78.0415]);
      setDroneHeading(42);
      setSyncProgress(100);
    }
  };

  const isOffline = currentStage === 'SIGNAL_LOST' || currentStage === 'OFFLINE_AUTONOMY' || currentStage === 'BACKTRACKING';

  return (
    <div className="w-full h-full p-3 overflow-y-auto font-sans select-none space-y-2.5 bg-[#070909] text-[#F2F4F3]">
      {/* 1. PAGE HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-[#111516] border border-white/5 rounded-2xl p-3 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-semibold tracking-wider font-mono text-[#F2F4F3]">
              Offline Autonomy
            </h1>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30 font-bold">
              AUTONOMOUS BACKTRACKING RECOVERY
            </span>
          </div>
          <p className="text-[11px] text-[#8C9492] mt-0.5 font-light">
            Communication-resilient autonomous mission recovery.
          </p>
        </div>

        {/* Dynamic Top-Right Status Badge */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#181D1E] border border-white/5 text-[#F2F4F3]">
            <span className={`w-2 h-2 rounded-full ${
              currentStage === 'BACKTRACKING' ? 'bg-[#F5A623] animate-spin' :
              currentStage === 'SIGNAL_LOST' ? 'bg-[#FF4D3D] animate-pulse' :
              currentStage === 'OFFLINE_AUTONOMY' ? 'bg-[#A78BFA] animate-pulse' :
              'bg-[#63C174] shadow-[0_0_6px_#63C174]'
            }`}></span>
            <span className={`font-bold text-[11px] ${
              currentStage === 'BACKTRACKING' ? 'text-[#F5A623]' :
              currentStage === 'SIGNAL_LOST' ? 'text-[#FF4D3D]' :
              currentStage === 'OFFLINE_AUTONOMY' ? 'text-[#A78BFA]' :
              'text-[#63C174]'
            }`}>
              ● {currentStage.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOP SYSTEM SUMMARY ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-[10px] bg-[#111516] border border-white/5 rounded-2xl p-2.5 shadow-xl text-center">
        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">DRONE</span>
          <strong className="text-sm text-[#3B9EFF] font-bold block">{scenario.droneId}</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">MISSION</span>
          <strong className="text-xs text-[#F2F4F3] font-bold block truncate">{scenario.missionName}</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">FLIGHT MODE</span>
          <strong className="text-xs text-[#63C174] font-bold block">AUTONOMOUS</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">CURRENT CHECKPOINT</span>
          <strong className="text-xs text-[#F5A623] font-bold block">CP-04</strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">CONNECTION</span>
          <strong className={`text-xs font-bold block ${isOffline ? 'text-[#FF4D3D]' : 'text-[#63C174]'}`}>
            {isOffline ? '● SIGNAL LOST' : '● CONNECTED'}
          </strong>
        </div>

        <div className="p-1.5 rounded-xl bg-[#181D1E] border border-white/5">
          <span className="text-[#8C9492] block text-[8px] uppercase">DATA BUFFER</span>
          <strong className="text-xs text-[#F5A623] font-bold block">
            {isOffline ? '05 EVENTS' : '0 EVENTS'}
          </strong>
        </div>
      </div>

      {/* 3. PRIMARY LARGE RECOVERY SATELLITE MAP (Dominant Visual Centerpiece) */}
      <div className="w-full h-[400px]">
        <RecoveryMap 
          scenario={scenario}
          currentStage={currentStage}
          dronePos={dronePos}
          droneHeading={droneHeading}
        />
      </div>

      {/* 4. MIDDLE SECTION: AUTONOMY STATUS (Left 6 Cols) | RECOVERY PROCESS PIPELINE (Right 6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-[230px]">
        <div className="lg:col-span-6 h-full min-h-0">
          <AutonomyStatusPanel 
            currentStage={currentStage}
            bufferedEvents={scenario.bufferedEventsQueue}
          />
        </div>

        <div className="lg:col-span-6 h-full min-h-0">
          <RecoveryProcessFlow 
            currentStage={currentStage}
            syncProgress={syncProgress}
            backtrackProgress={backtrackProgress}
          />
        </div>
      </div>

      {/* 5. BOTTOM SECTION: EVENT TIMELINE (Left 6 Cols) | SIMULATION CONTROLS (Right 6 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-[160px]">
        <div className="lg:col-span-6 h-full min-h-0">
          <RecoveryTimeline 
            timelineEvents={timelineEvents}
          />
        </div>

        <div className="lg:col-span-6 h-full min-h-0">
          <SimulationControls 
            currentStage={currentStage}
            onSetStage={handleSetStage}
            onPlayFullDemo={() => {
              setCurrentStage('CONNECTED');
              setIsPlayingDemo(true);
            }}
            isPlayingDemo={isPlayingDemo}
          />
        </div>
      </div>
    </div>
  );
}
