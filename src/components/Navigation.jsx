import React from 'react';
import { 
  ShieldAlert, 
  Wifi, 
  Radio, 
  Bell, 
  User, 
  Activity, 
  Layers, 
  Compass, 
  FileText, 
  Cpu,
  BarChart3
} from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'live-operations', label: 'Live Operations', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: '3' },
    { id: 'fleet', label: 'Fleet', icon: Compass },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Mission History', icon: FileText },
  ];

  return (
    <nav className="h-14 px-4 bg-[#0B0E0F] border-b border-aeris-border flex items-center justify-between select-none shrink-0 z-30 font-sans">
      {/* 1. Left: Brand Logo & Title */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onSelectTab('live-operations')}>
          <div className="w-8 h-8 rounded-lg bg-[#15191C] border border-white/10 flex items-center justify-center shadow-inner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7V13C3 18.5 6.8 23.2 12 24.5C17.2 23.2 21 18.5 21 13V7L12 2Z" stroke="#3B9EFF" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(59, 158, 255, 0.1)"/>
              <path d="M8 12L11 15L16 9" stroke="#63C174" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.14em] text-[#E8ECEF]">
              AERIS
            </span>
            <span className="text-[8.5px] uppercase tracking-[0.08em] text-[#8B949E] leading-none">
              COMMAND CENTER
            </span>
          </div>
        </div>

        {/* 2. Top Nav Items (Subtle rounded dark pill style) */}
        <div className="hidden md:flex items-center space-x-1 p-0.5 rounded-pill bg-[#15191C] border border-white/5 text-[11px] font-mono">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1 rounded-pill flex items-center space-x-1.5 transition-all ${
                  isActive
                    ? 'bg-[#1C2125] text-[#E8ECEF] font-semibold border border-white/10 shadow-sm'
                    : 'text-[#8B949E] hover:text-[#E8ECEF] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#3B9EFF]' : 'text-[#8B949E]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#FF4D3D]/20 text-[#FF4D3D] border border-[#FF4D3D]/30' : 'bg-white/10 text-[#8B949E]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Right: System Status, Network & Profile */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        {/* System Status: Subtle Green */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-pill bg-[#15191C] border border-white/5 text-[#E8ECEF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#63C174] shadow-[0_0_8px_rgba(99,193,116,0.6)]"></span>
          <span className="text-[10px] tracking-wider text-[#8B949E]">SYSTEM STATUS</span>
          <span className="text-[10px] font-bold text-[#63C174]">● OPERATIONAL</span>
        </div>

        {/* RF / Satellite Link */}
        <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-pill bg-[#15191C] border border-white/5 text-[#8B949E]" title="Mesh Ground Link 48 Mbps">
          <Wifi className="w-3.5 h-3.5 text-[#3B9EFF]" />
          <span className="text-[10px] text-[#3B9EFF]">5.8 GHz</span>
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-pill bg-[#15191C] border border-white/5 text-[#8B949E] hover:text-[#E8ECEF] transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FF4D3D]"></span>
        </button>

        {/* Operator Profile */}
        <div className="flex items-center space-x-2 pl-2 border-l border-white/5">
          <div className="w-7 h-7 rounded-full bg-[#1C2125] border border-white/10 flex items-center justify-center text-[#E8ECEF]">
            <User className="w-3.5 h-3.5 text-[#3B9EFF]" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[10.5px] font-semibold text-[#E8ECEF] leading-tight">CMD. SIDDHESH</span>
            <span className="text-[8.5px] text-[#8B949E] leading-tight">AERIS OP-01</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
