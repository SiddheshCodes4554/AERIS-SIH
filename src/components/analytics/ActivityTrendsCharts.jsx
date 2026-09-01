import React from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export default function ActivityTrendsCharts({ 
  activityData = [], 
  riskDistribution = [] 
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full select-none font-sans">
      {/* 1. Left Panel (7 Cols): Incident Activity Line/Area Trend Chart */}
      <div className="lg:col-span-7 bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl">
        {/* Header & Legend */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#3B9EFF]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Incident Activity Trends
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-[9.5px] font-mono">
            <span className="flex items-center text-[#3B9EFF]">
              <span className="w-2 h-0.5 bg-[#3B9EFF] mr-1"></span>
              Current Activity
            </span>
            <span className="flex items-center text-[#8B949E]">
              <span className="w-2 h-0.5 bg-[#8B949E] mr-1 border-dashed"></span>
              Historical Avg
            </span>
            <span className="flex items-center text-[#FF4D3D]">
              <span className="w-2 h-0.5 bg-[#FF4D3D] mr-1"></span>
              Threshold (25)
            </span>
          </div>
        </div>

        {/* SVG Line / Area Graph */}
        <div className="h-36 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B9EFF" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B9EFF" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold Line (Y = 25 -> scaled to ~20px from top) */}
            <line x1="0" y1="20" x2="500" y2="20" stroke="#FF4D3D" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

            {/* Historical Average Line (Dashed) */}
            <polyline
              fill="none"
              stroke="#8B949E"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.5"
              points="0,75 70,88 140,65 210,50 280,45 350,55 420,42 500,68"
            />

            {/* Area Fill for Current Activity */}
            <polygon
              fill="url(#activityGradient)"
              points="0,90 70,102 140,60 210,12 280,38 350,48 420,30 500,62 500,120 0,120"
            />

            {/* Current Activity Solid Line */}
            <polyline
              fill="none"
              stroke="#3B9EFF"
              strokeWidth="2.5"
              points="0,90 70,102 140,60 210,12 280,38 350,48 420,30 500,62"
            />

            {/* Peak Activity Dot at 09:00 */}
            <circle cx="210" cy="12" r="4" fill="#3B9EFF" stroke="#07090B" strokeWidth="2" />
          </svg>

          {/* Time Labels on X-Axis */}
          <div className="flex justify-between text-[9px] font-mono text-[#8B949E] mt-2 pt-1 border-t border-white/5">
            {activityData.map((d, i) => (
              <span key={i}>{d.time}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Right Panel (5 Cols): Risk Distribution Donut Chart */}
      <div className="lg:col-span-5 bg-[#15191C] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
          <div className="flex items-center space-x-2">
            <PieChart className="w-3.5 h-3.5 text-[#F5A623]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
              Risk Distribution
            </h3>
          </div>
          <span className="text-[9.5px] font-mono text-[#8B949E]">100% ASSESSED</span>
        </div>

        <div className="flex items-center justify-around h-36">
          {/* Donut Visual via SVG */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1C2125" strokeWidth="4.5" />
              {/* Medium Risk: 38% */}
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F5A623" strokeWidth="4.5" strokeDasharray="38 100" strokeDashoffset="0" />
              {/* Low Risk: 31% */}
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#63C174" strokeWidth="4.5" strokeDasharray="31 100" strokeDashoffset="-38" />
              {/* High Risk: 24% */}
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#FF922B" strokeWidth="4.5" strokeDasharray="24 100" strokeDashoffset="-69" />
              {/* Critical: 7% */}
              <circle cx="18" cy="18" r="14" fill="transparent" stroke="#FF4D3D" strokeWidth="4.5" strokeDasharray="7 100" strokeDashoffset="-93" />
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute flex flex-col items-center justify-center font-mono">
              <span className="text-sm font-bold text-[#E8ECEF]">247</span>
              <span className="text-[7.5px] text-[#8B949E]">ZONES</span>
            </div>
          </div>

          {/* Clean Outside Labels */}
          <div className="space-y-1.5 font-mono text-[10px]">
            {riskDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between space-x-3">
                <span className="flex items-center text-[#A0AAB0]">
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: item.color }}></span>
                  {item.label}
                </span>
                <strong className="text-[#E8ECEF] font-bold">{item.percentage}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
