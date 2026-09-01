import React, { useState } from 'react';
import { 
  Video, 
  Flame, 
  Box, 
  Disc, 
  Camera, 
  Radio, 
  Crosshair, 
  Eye,
  Sliders
} from 'lucide-react';

export default function CameraPanel({ droneTelemetry }) {
  const [feedMode, setFeedMode] = useState('RGB'); // RGB | THERMAL

  return (
    <div className="bg-aeris-panel border border-aeris-border rounded-md flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="px-3.5 py-2 bg-aeris-panelHeader border-b border-aeris-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-aeris-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-aeris-textPrimary">
            Camera & AI Live Feed
          </h2>
        </div>

        {/* RGB / Thermal Switcher */}
        <div className="flex items-center space-x-1.5 font-mono">
          <button
            onClick={() => setFeedMode('RGB')}
            className={`px-2.5 py-0.5 text-[11px] rounded border transition-colors flex items-center space-x-1 ${
              feedMode === 'RGB'
                ? 'bg-aeris-cyan/20 text-aeris-cyan border-aeris-cyan font-bold'
                : 'bg-aeris-surface text-aeris-textSecondary border-aeris-border hover:text-aeris-textPrimary'
            }`}
          >
            <Video className="w-3 h-3" />
            <span>RGB OPTICAL (4K)</span>
          </button>

          <button
            onClick={() => setFeedMode('THERMAL')}
            className={`px-2.5 py-0.5 text-[11px] rounded border transition-colors flex items-center space-x-1 ${
              feedMode === 'THERMAL'
                ? 'bg-aeris-warning/20 text-aeris-warning border-aeris-warning font-bold'
                : 'bg-aeris-surface text-aeris-textSecondary border-aeris-border hover:text-aeris-textPrimary'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>FLIR THERMAL IR</span>
          </button>
        </div>
      </div>

      {/* Main Video Screen Placeholder Area */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {/* RGB Mode Placeholder */}
        {feedMode === 'RGB' && (
          <div className="w-full h-full relative bg-[#09111c] flex items-center justify-center">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#1e3a5f_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Simulated flood terrain flow */}
            <div className="absolute w-[160%] h-24 bg-cyan-950/30 rotate-6 blur-sm"></div>

            {/* AI Bounding Box 1: Survivor */}
            <div className="absolute top-[22%] left-[44%] w-28 h-28 border-2 border-aeris-danger rounded-sm animate-pulse flex flex-col justify-between p-1 bg-aeris-danger/10">
              <span className="text-[9px] font-mono bg-aeris-danger text-white px-1 rounded w-fit font-bold">
                SURVIVOR 94.8%
              </span>
              <div className="flex justify-between text-[8px] font-mono text-aeris-danger font-bold">
                <span>T:36.8°C</span>
                <span>ROOFTOP</span>
              </div>
            </div>

            {/* AI Bounding Box 2: Hazard */}
            <div className="absolute bottom-[20%] right-[18%] w-32 h-16 border border-aeris-warning border-dashed rounded-sm flex flex-col justify-between p-1 bg-aeris-warning/10">
              <span className="text-[9px] font-mono bg-aeris-warning text-black px-1 rounded w-fit font-bold">
                SUBMERGED HV 89.2%
              </span>
              <span className="text-[8px] font-mono text-aeris-warning">
                ELECTRICAL ARC RISK
              </span>
            </div>
          </div>
        )}

        {/* Thermal Mode Placeholder */}
        {feedMode === 'THERMAL' && (
          <div className="w-full h-full relative bg-[#120622] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#090224] via-[#4d0c5a] to-[#e65c00] opacity-85"></div>
            
            {/* Thermal human hotspot */}
            <div className="absolute top-[28%] left-[46%] w-14 h-16 bg-yellow-300 rounded-full blur-md opacity-90 animate-pulse"></div>
            <div className="absolute top-[28%] left-[46%] text-[9px] font-mono text-yellow-300 bg-black/70 px-1 border border-yellow-400">
              HEAT SIGN: 36.8°C
            </div>

            {/* Thermal Gradient Palette Key on right */}
            <div className="absolute right-3 top-6 bottom-6 w-3 bg-gradient-to-b from-white via-yellow-400 via-red-600 via-purple-800 to-blue-950 rounded border border-aeris-border flex flex-col justify-between text-[8px] font-mono text-white px-0.5">
              <span>45°</span>
              <span>25°</span>
              <span>10°</span>
            </div>
          </div>
        )}

        {/* HUD Tactical Reticle */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-65">
          <div className="relative w-28 h-28">
            <div className="absolute top-1/2 left-1/2 w-6 h-[1px] -translate-x-1/2 -translate-y-1/2 bg-aeris-cyan"></div>
            <div className="absolute top-1/2 left-1/2 h-6 w-[1px] -translate-x-1/2 -translate-y-1/2 bg-aeris-cyan"></div>
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-aeris-cyan"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-aeris-cyan"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-aeris-cyan"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-aeris-cyan"></div>
          </div>
        </div>

        {/* Top HUD Telemetry Bar */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/90 drop-shadow z-10">
          <div className="flex items-center space-x-2 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            <span className="flex items-center text-aeris-danger font-bold">
              <Disc className="w-3 h-3 mr-1 animate-pulse" />
              LIVE 4K
            </span>
            <span className="text-white/40">|</span>
            <span>60 FPS</span>
            <span className="text-white/40">|</span>
            <span>6.4 Mbps</span>
            <span className="text-white/40">|</span>
            <span className="text-aeris-cyan">22ms</span>
          </div>

          <div className="bg-black/60 px-2 py-0.5 rounded border border-white/10">
            GIMBAL: <span className="text-aeris-cyan">P -35.0°</span> | <span className="text-aeris-cyan">R 0.0°</span>
          </div>
        </div>

        {/* Bottom HUD Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/90 z-10">
          <div className="bg-black/60 px-2 py-0.5 rounded border border-white/10">
            EO/IR SENSOR: SONY IMX586 + FLIR BOSON
          </div>
          <div className="bg-black/60 px-2 py-0.5 rounded border border-white/10 text-aeris-cyan">
            TARGET TRACK: LOCK ACQUIRED
          </div>
        </div>
      </div>
    </div>
  );
}
