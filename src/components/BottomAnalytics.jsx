import React from 'react';
import { 
  Clock, 
  Scan, 
  Database, 
  ArrowUpRight 
} from 'lucide-react';

export default function BottomAnalytics({ fleetSummary }) {
  return (
    <div className="flex items-center space-x-3 select-none">
      {/* 1. Response Time Card */}
      <div className="aeris-glass-card rounded-card p-3.5 w-44 flex flex-col justify-between shadow-aeris-card">
        <div className="flex items-center justify-between text-xs text-aeris-textSecondary">
          <span className="text-[10px] uppercase font-mono tracking-wider text-aeris-textMuted">Avg Response</span>
          <Clock className="w-3.5 h-3.5 text-aeris-textMuted" />
        </div>
        <div className="my-1">
          <div className="text-2xl font-light text-aeris-textPrimary font-mono">
            {fleetSummary.averageResponseMin} <span className="text-xs text-aeris-textSecondary">min</span>
          </div>
        </div>
        {/* Mini SVG Sparkline */}
        <div className="h-4 w-full">
          <svg viewBox="0 0 100 20" className="w-full h-full">
            <polyline
              fill="none"
              stroke="#65C466"
              strokeWidth="1.2"
              points="0,15 20,12 40,16 60,8 80,10 100,5"
            />
          </svg>
        </div>
      </div>

      {/* 2. Area Coverage Card */}
      <div className="aeris-glass-card rounded-card p-3.5 w-44 flex flex-col justify-between shadow-aeris-card">
        <div className="flex items-center justify-between text-xs text-aeris-textSecondary">
          <span className="text-[10px] uppercase font-mono tracking-wider text-aeris-textMuted">Area Coverage</span>
          <Scan className="w-3.5 h-3.5 text-aeris-textMuted" />
        </div>
        <div className="my-1">
          <div className="text-2xl font-light text-aeris-cyan font-mono">
            {fleetSummary.areaCoveragePercent}%
          </div>
        </div>
        <p className="text-[9.5px] text-aeris-textMuted font-mono">
          Disaster Zone Scanned
        </p>
      </div>

      {/* 3. Live Data Observations */}
      <div className="aeris-glass-card rounded-card p-3.5 w-44 flex flex-col justify-between shadow-aeris-card">
        <div className="flex items-center justify-between text-xs text-aeris-textSecondary">
          <span className="text-[10px] uppercase font-mono tracking-wider text-aeris-textMuted">Live Data</span>
          <Database className="w-3.5 h-3.5 text-aeris-textMuted" />
        </div>
        <div className="my-1">
          <div className="text-2xl font-light text-aeris-textPrimary font-mono">
            {fleetSummary.liveObservationsCount}
          </div>
        </div>
        <p className="text-[9.5px] text-aeris-textMuted font-mono">
          Critical Observations
        </p>
      </div>
    </div>
  );
}
