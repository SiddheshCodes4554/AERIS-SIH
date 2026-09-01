import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  BatteryMedium, 
  Radio, 
  Sparkles, 
  Sliders 
} from 'lucide-react';

import MissionConfigPanel from './MissionConfigPanel.jsx';
import RouteBuilderMap from './RouteBuilderMap.jsx';
import MissionSummaryPanel from './MissionSummaryPanel.jsx';
import LaunchConfirmationModal from './LaunchConfirmationModal.jsx';

import { DEFAULT_MISSION_PLAN } from '../../data/planningData.js';

export default function MissionPlanningView({ onNavigateToLiveMission }) {
  const [plan, setPlan] = useState(DEFAULT_MISSION_PLAN);
  const [isLaunchModalOpen, setIsLaunchModalOpen] = useState(false);

  const handleAddWaypoint = () => {
    const nextIdx = plan.waypoints.length + 1;
    const newWp = {
      id: `WP-0${nextIdx}`,
      label: `WP-0${nextIdx}`,
      name: `Extended Search Corridor ${nextIdx}`,
      lat: 30.3245 + (nextIdx * 0.0015),
      lng: 78.0410 + (nextIdx * 0.0015),
      altitude: plan.altitudeMeters,
      speed: plan.cruiseSpeedMs,
    };

    setPlan(prev => ({
      ...prev,
      waypoints: [...prev.waypoints, newWp],
      metrics: {
        ...prev.metrics,
        waypointsCount: prev.waypoints.length + 1,
        totalDistanceKm: +(prev.metrics.totalDistanceKm + 0.9).toFixed(1),
        estimatedDurationMin: prev.metrics.estimatedDurationMin + 3,
      }
    }));
  };

  const handleAutoGenerateCheckpoints = () => {
    alert("AI Checkpoint Optimizer: Generated 3 optimal Line-of-Sight RF relay checkpoints along the planned route.");
  };

  const handleClearRoute = () => {
    if (window.confirm("Clear current waypoint route?")) {
      setPlan(prev => ({
        ...prev,
        waypoints: [prev.waypoints[0]],
        metrics: {
          ...prev.metrics,
          waypointsCount: 1,
          totalDistanceKm: 1.2,
          estimatedDurationMin: 4,
        }
      }));
    }
  };

  const handleLaunchSuccess = () => {
    setIsLaunchModalOpen(false);
    if (onNavigateToLiveMission) {
      onNavigateToLiveMission();
    }
  };

  return (
    <div className="w-full h-full p-3 overflow-y-auto font-sans select-none space-y-2.5 bg-[#070909] text-[#F2F4F3]">
      {/* 1. PAGE HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-[#111516] border border-white/5 rounded-2xl p-3 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-semibold tracking-wider font-mono text-[#F2F4F3]">
              Mission Planning
            </h1>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 font-bold">
              UAV AUTONOMY PLANNER
            </span>
          </div>
          <p className="text-[11px] text-[#8C9492] mt-0.5 font-light">
            Configure and deploy autonomous disaster-response missions for AERIS-01.
          </p>
        </div>

        {/* Right Drone State & Readiness Status */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#181D1E] border border-white/5 text-[#F2F4F3]">
            <span className="text-[#3B9EFF] font-bold">{plan.droneId}</span>
            <span className="text-white/20">|</span>
            <span className="text-[#63C174] font-bold">● READY FOR MISSION</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#181D1E] border border-white/5 text-[10.5px]">
            <span className="text-[#8C9492]">BATTERY: <strong className="text-[#63C174]">85%</strong></span>
            <span className="text-white/20">|</span>
            <span className="text-[#8C9492]">GPS: <strong className="text-[#63C174]">ACTIVE</strong></span>
          </div>
        </div>
      </div>

      {/* 2. PRIMARY THREE-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-[calc(100vh-130px)] min-h-[600px]">
        {/* LEFT COLUMN: MISSION CONFIGURATION (3 Cols / 25% width) */}
        <div className="lg:col-span-3 h-full min-h-0">
          <MissionConfigPanel 
            config={plan}
            onChangeConfig={setPlan}
          />
        </div>

        {/* CENTER COLUMN: INTERACTIVE MAP & ROUTE BUILDER (6 Cols / 50% width) */}
        <div className="lg:col-span-6 h-full min-h-0">
          <RouteBuilderMap 
            plan={plan}
            onAddWaypoint={handleAddWaypoint}
            onAutoGenerateCheckpoints={handleAutoGenerateCheckpoints}
            onClearRoute={handleClearRoute}
          />
        </div>

        {/* RIGHT COLUMN: MISSION SUMMARY & READINESS (3 Cols / 25% width) */}
        <div className="lg:col-span-3 h-full min-h-0">
          <MissionSummaryPanel 
            plan={plan}
            onOpenLaunchModal={() => setIsLaunchModalOpen(true)}
          />
        </div>
      </div>

      {/* 3. CONFIRMATION & PRE-FLIGHT VERIFICATION MODAL */}
      <LaunchConfirmationModal 
        plan={plan}
        isOpen={isLaunchModalOpen}
        onClose={() => setIsLaunchModalOpen(false)}
        onLaunchSuccess={handleLaunchSuccess}
      />
    </div>
  );
}
