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
  BarChart3,
  Search,
  Sparkles
} from 'lucide-react';

export default function Navigation({ activeTab, onSelectTab }) {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: Activity },
    { id: 'live-mission', label: 'Live Mission', icon: Compass },
    { id: 'intelligence', label: 'Intelligence', icon: Sparkles, badge: 'AI' },
    { id: 'incidents', label: 'Incidents / Alerts', icon: ShieldAlert, badge: '3' },
    { id: 'fleet', label: 'Fleet', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="h-14 px-4 bg-[#0B0E0F] border-b border-aeris-border flex items-center justify-between select-none shrink-0 z-30 font-sans">
      {/* 1. Left: Brand Logo & Title */}
      <div className="flex items-center space-x-5">
        <div 
          className="flex items-center space-x-2.5 cursor-pointer" 
          onClick={() => onSelectTab('command-center')}
        >
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
            <span className="text-[8px] uppercase tracking-[0.08em] text-[#8B949E] leading-none">
              AUTONOMOUS COMMAND
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
                  <span className={`text-[8.5px] px-1.5 py-0.2 rounded-full font-bold ${
                    item.badge === 'AI' 
                      ? 'bg-[#3B9EFF]/20 text-[#3B9EFF] border border-[#3B9EFF]/30'
                      : isActive 
                        ? 'bg-[#FF4D3D]/20 text-[#FF4D3D] border border-[#FF4D3D]/30' 
                        : 'bg-white/10 text-[#8B949E]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Right: Search, System Status, Notifications & Profile */}
      <div className="flex items-center space-x-2.5 text-xs font-mono">
        {/* Search */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-pill bg-[#15191C] border border-white/5 text-[#8B949E]">
          <Search className="w-3 h-3 text-[#8B949E]" />
          <input 
            type="text" 
            placeholder="Search zones, drones, alerts..." 
            className="bg-transparent text-[10px] text-[#E8ECEF] placeholder-[#8B949E] focus:outline-none w-36"
          />
        </div>

        {/* System Status: Subtle Green */}
        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-pill bg-[#15191C] border border-white/5 text-[#E8ECEF]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#63C174] shadow-[0_0_8px_rgba(99,193,116,0.6)]"></span>
          <span className="text-[10px] tracking-wider text-[#8B949E] hidden sm:inline">STATUS:</span>
          <span className="text-[10px] font-bold text-[#63C174]">● OPERATIONAL</span>
        </div>

        {/* Notifications with Alert Badge */}
        <button className="relative p-1.5 rounded-pill bg-[#15191C] border border-white/5 text-[#8B949E] hover:text-[#E8ECEF] transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FF4D3D] shadow-[0_0_4px_#FF4D3D]"></span>
        </button>

        {/* Operator Profile */}
        <div className="flex items-center space-x-2 pl-1.5 border-l border-white/5">
          <div className="w-7 h-7 rounded-full bg-[#1C2125] border border-white/10 flex items-center justify-center text-[#E8ECEF]">
            <User className="w-3.5 h-3.5 text-[#3B9EFF]" />
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-[10.5px] font-semibold text-[#E8ECEF] leading-tight">CMD. SIDDHESH</span>
            <span className="text-[8px] text-[#8B949E] leading-tight">AERIS OP-01</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
