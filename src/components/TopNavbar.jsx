import React from 'react';
import { 
  Search, 
  Bell, 
  Radio, 
  Wifi, 
  ShieldCheck, 
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function TopNavbar({ activeTab = "Live Operations", onTabChange }) {
  const navTabs = [
    "Live Operations",
    "Fleet",
    "Missions",
    "Analytics",
    "Incidents",
    "AI Intelligence"
  ];

  return (
    <header className="h-16 px-6 flex items-center justify-between z-30 select-none bg-aeris-bg/60 backdrop-blur-md border-b border-aeris-border shrink-0">
      {/* Left: Minimal Geometric Brand Logo & Subtitle */}
      <div className="flex items-center space-x-3.5 min-w-[340px]">
        {/* Geometric Hex/Aero Logo Mark */}
        <div className="w-8 h-8 rounded-lg bg-aeris-surface2 border border-white/10 flex items-center justify-center shadow-inner group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 8.5L12 15L22 8.5L12 2Z" stroke="#F1F3F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 15.5L12 22L22 15.5" stroke="#3B8EDB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="11.5" r="2" fill="#65C466" />
          </svg>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-base font-medium tracking-[0.12em] text-aeris-textPrimary">
              AERIS
            </span>
            <span className="text-[10px] tracking-widest text-aeris-textMuted font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
              v2.6
            </span>
          </div>
          <p className="text-[9.5px] tracking-[0.08em] uppercase text-aeris-textMuted font-medium leading-none mt-0.5">
            Autonomous Emergency Response & Intelligence System
          </p>
        </div>
      </div>

      {/* Center Navigation: Minimal Pill Navigation */}
      <nav className="hidden lg:flex items-center bg-aeris-surface1/80 border border-aeris-border p-1 rounded-pill backdrop-blur-xl">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange && onTabChange(tab)}
              className={`px-4 py-1.5 rounded-pill text-xs font-normal transition-all duration-200 ${
                isActive
                  ? 'bg-aeris-surface3 text-aeris-textPrimary border border-white/10 shadow-sm font-medium'
                  : 'text-aeris-textSecondary hover:text-aeris-textPrimary hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Right: Search, Connectivity, Notifications, User Profile */}
      <div className="flex items-center space-x-3.5">
        {/* Search */}
        <button 
          className="w-8 h-8 rounded-full bg-aeris-surface1 border border-aeris-border flex items-center justify-center text-aeris-textSecondary hover:text-aeris-textPrimary hover:border-aeris-borderHover transition-colors"
          title="Search Drones, Zones, Missions"
        >
          <Search className="w-3.5 h-3.5 stroke-[1.5]" />
        </button>

        {/* Connectivity Status Pill */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-aeris-surface1 border border-aeris-border rounded-pill text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-aeris-green shadow-[0_0_8px_#65C466]"></span>
          <span className="text-[11px] font-mono text-aeris-textSecondary tracking-tight">
            5G MESH <span className="text-aeris-green font-medium">98.4%</span>
          </span>
        </div>

        {/* Notifications */}
        <button 
          className="relative w-8 h-8 rounded-full bg-aeris-surface1 border border-aeris-border flex items-center justify-center text-aeris-textSecondary hover:text-aeris-textPrimary hover:border-aeris-borderHover transition-colors"
          title="Active Alerts"
        >
          <Bell className="w-3.5 h-3.5 stroke-[1.5]" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-aeris-red rounded-full"></span>
        </button>

        {/* User / Operator Profile */}
        <div className="flex items-center space-x-2 pl-1.5 border-l border-aeris-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border border-white/20 flex items-center justify-center text-[10px] font-medium text-white shadow-sm">
            ND
          </div>
          <div className="hidden xl:block text-left font-sans">
            <span className="text-xs font-medium text-aeris-textPrimary block leading-tight">NDRF Command</span>
            <span className="text-[9.5px] text-aeris-textMuted block font-mono">SECTOR-04</span>
          </div>
        </div>
      </div>
    </header>
  );
}
