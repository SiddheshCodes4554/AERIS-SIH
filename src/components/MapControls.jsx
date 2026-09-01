import React from 'react';
import { 
  Plus, 
  Minus, 
  Crosshair, 
  Layers, 
  Map, 
  ShieldAlert, 
  Radio,
  Zap,
  RotateCcw
} from 'lucide-react';

export default function MapControls({ 
  mapLayer, 
  onToggleLayer, 
  showIncidentZones, 
  onToggleIncidents,
  showRoutes,
  onToggleRoutes,
  onRecenter,
  onQuickAction
}) {
  return (
    <div className="flex flex-col items-center space-y-3 select-none">
      {/* 1. Quick Emergency Floating Circular Actions */}
      <div className="flex items-center space-x-2 bg-aeris-surface1/80 border border-aeris-border p-1.5 rounded-pill backdrop-blur-xl shadow-aeris-card">
        <button
          onClick={() => onQuickAction && onQuickAction('DEPLOY')}
          className="px-3 py-1 rounded-pill bg-aeris-surface3 hover:bg-aeris-surface3/80 text-aeris-textPrimary border border-white/10 text-xs font-mono flex items-center space-x-1.5 transition-colors"
          title="Deploy Drone"
        >
          <Plus className="w-3.5 h-3.5 text-aeris-green" />
          <span>Deploy</span>
        </button>

        <button
          onClick={onRecenter}
          className="px-3 py-1 rounded-pill bg-aeris-surface3 hover:bg-aeris-surface3/80 text-aeris-textPrimary border border-white/10 text-xs font-mono flex items-center space-x-1.5 transition-colors"
          title="Focus Mission Area"
        >
          <Crosshair className="w-3.5 h-3.5 text-aeris-cyan" />
          <span>Focus</span>
        </button>

        <button
          onClick={onToggleRoutes}
          className={`px-3 py-1 rounded-pill border text-xs font-mono flex items-center space-x-1.5 transition-colors ${
            showRoutes 
              ? 'bg-aeris-blue/20 border-aeris-blue text-aeris-blue' 
              : 'bg-aeris-surface3 text-aeris-textSecondary border-white/10'
          }`}
          title="Toggle Flight Routes"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Routes</span>
        </button>

        <button
          onClick={onToggleIncidents}
          className={`px-3 py-1 rounded-pill border text-xs font-mono flex items-center space-x-1.5 transition-colors ${
            showIncidentZones 
              ? 'bg-aeris-red/20 border-aeris-red text-aeris-red' 
              : 'bg-aeris-surface3 text-aeris-textSecondary border-white/10'
          }`}
          title="Toggle Incident Zones"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Incidents</span>
        </button>
      </div>

      {/* 2. Map View Selector & Minimal Zoom Strip */}
      <div className="flex items-center space-x-2 bg-aeris-surface1/80 border border-aeris-border px-3 py-1 rounded-pill backdrop-blur-xl text-xs font-mono">
        <span className="text-[10px] text-aeris-textMuted uppercase mr-1">Layer:</span>
        <button
          onClick={() => onToggleLayer('satellite')}
          className={`px-2 py-0.5 rounded-pill transition-colors ${
            mapLayer === 'satellite' ? 'bg-aeris-surface3 text-aeris-textPrimary font-medium border border-white/10' : 'text-aeris-textSecondary hover:text-aeris-textPrimary'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => onToggleLayer('terrain')}
          className={`px-2 py-0.5 rounded-pill transition-colors ${
            mapLayer === 'terrain' ? 'bg-aeris-surface3 text-aeris-textPrimary font-medium border border-white/10' : 'text-aeris-textSecondary hover:text-aeris-textPrimary'
          }`}
        >
          Terrain
        </button>
      </div>
    </div>
  );
}
