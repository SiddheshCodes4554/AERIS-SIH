import React, { useState } from 'react';
import { 
  Download, 
  Calendar, 
  MapPin, 
  Filter, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

import MetricsTopRow from './MetricsTopRow.jsx';
import HeatmapMapPanel from './HeatmapMapPanel.jsx';
import LiveIntelligenceFeed from './LiveIntelligenceFeed.jsx';
import ActivityTrendsCharts from './ActivityTrendsCharts.jsx';
import AIInsightsPanel from './AIInsightsPanel.jsx';
import LiveVisionIntelligence from './LiveVisionIntelligence.jsx';
import MissionPerformanceFooter from './MissionPerformanceFooter.jsx';

import {
  ANALYTICS_METRICS,
  HEATMAP_REGIONS,
  MAP_INCIDENTS,
  MAP_DRONES,
  MAP_FLIGHT_PATHS,
  LIVE_INTELLIGENCE_EVENTS,
  ACTIVITY_TRENDS_DATA,
  RISK_DISTRIBUTION_DATA,
  AI_INSIGHTS,
  LIVE_VISION_STREAMS,
  MISSION_PERFORMANCE
} from '../../data/analyticsData.js';

export default function MissionIntelligenceView() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 24 Hours');
  const [selectedRegion, setSelectedRegion] = useState('Chamoli Disaster Basin (Sector 4B)');
  const [isOfflineSimulation, setIsOfflineSimulation] = useState(false);

  const handleExportReport = () => {
    alert("Exporting AERIS Mission Intelligence Assessment PDF report...");
  };

  return (
    <div className="w-full h-full p-3 overflow-y-auto font-sans select-none space-y-3 bg-[#07090B] text-[#E8ECEF]">
      {/* 1. MAIN PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#15191C] border border-white/5 rounded-2xl p-3.5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-semibold tracking-wider font-mono text-[#E8ECEF]">
              Mission Intelligence
            </h1>
            <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#3B9EFF]/15 text-[#3B9EFF] border border-[#3B9EFF]/30 font-bold">
              AI ANALYTICS ENGINE
            </span>
          </div>
          <p className="text-[11px] text-[#8B949E] mt-0.5 font-light">
            AI-powered situational awareness, environmental risk heatmaps & operational fleet insights
          </p>
        </div>

        {/* Right Side Controls: Time Range, Region Selector, Export Report */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C2125] border border-white/5 text-[#E8ECEF]">
            <Calendar className="w-3.5 h-3.5 text-[#3B9EFF]" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="bg-transparent text-[10.5px] focus:outline-none cursor-pointer"
            >
              <option value="Last 6 Hours" className="bg-[#15191C]">Last 6 Hours</option>
              <option value="Last 24 Hours" className="bg-[#15191C]">Last 24 Hours</option>
              <option value="Last 7 Days" className="bg-[#15191C]">Last 7 Days</option>
              <option value="All Mission Data" className="bg-[#15191C]">All Mission Data</option>
            </select>
          </div>

          {/* Region Selector */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-[#1C2125] border border-white/5 text-[#E8ECEF]">
            <MapPin className="w-3.5 h-3.5 text-[#63C174]" />
            <span className="text-[10.5px] truncate max-w-[170px]">{selectedRegion}</span>
          </div>

          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#3B9EFF]/20 hover:bg-[#3B9EFF]/30 text-[#3B9EFF] border border-[#3B9EFF]/40 font-bold transition-all text-[11px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. TOP ROW: 4 COMPACT INTELLIGENCE METRICS CARDS */}
      <MetricsTopRow metrics={ANALYTICS_METRICS} />

      {/* 3. MAIN CENTER SECTION: AI Risk Heatmap (8 Cols) + Live Intelligence Feed (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-[460px]">
        {/* Real Satellite Heatmap Panel (8 Cols) */}
        <div className="lg:col-span-8 h-full min-h-0">
          <HeatmapMapPanel 
            heatmapRegions={HEATMAP_REGIONS}
            incidents={MAP_INCIDENTS}
            drones={MAP_DRONES}
            flightPaths={MAP_FLIGHT_PATHS}
          />
        </div>

        {/* Live Intelligence Feed (4 Cols) */}
        <div className="lg:col-span-4 h-full min-h-0">
          <LiveIntelligenceFeed 
            events={LIVE_INTELLIGENCE_EVENTS}
          />
        </div>
      </div>

      {/* 4. ACTIVITY TRENDS & RISK DISTRIBUTION CHARTS */}
      <ActivityTrendsCharts 
        activityData={ACTIVITY_TRENDS_DATA}
        riskDistribution={RISK_DISTRIBUTION_DATA}
      />

      {/* 5. AI INSIGHTS PANEL (3 ACTIONABLE RECOMMENDATIONS) */}
      <AIInsightsPanel 
        insights={AI_INSIGHTS}
      />

      {/* 6. LIVE VISION INTELLIGENCE (3 DRONE CAMERA FEEDS WITH AI BOUNDING BOXES) */}
      <LiveVisionIntelligence 
        streams={LIVE_VISION_STREAMS}
      />

      {/* 7. MISSION PERFORMANCE & CONNECTIVITY INTELLIGENCE FOOTER */}
      <MissionPerformanceFooter 
        performance={MISSION_PERFORMANCE}
        isOffline={isOfflineSimulation}
        onToggleOffline={() => setIsOfflineSimulation(!isOfflineSimulation)}
      />
    </div>
  );
}
