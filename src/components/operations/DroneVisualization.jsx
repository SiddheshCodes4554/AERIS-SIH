import React from 'react';
import { 
  Compass, 
  BatteryMedium, 
  Cpu, 
  Video, 
  MapPin, 
  Radio, 
  Crosshair, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

export default function DroneVisualization({ healthData, isOffline }) {
  const { battery, navigation, imu, edgeAi, flightTelemetry } = healthData;

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans relative overflow-hidden shadow-2xl">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 shrink-0 z-10">
        <div className="flex items-center space-x-2">
          <Crosshair className="w-3.5 h-3.5 text-[#3B9EFF] animate-spin" style={{ animationDuration: '12s' }} />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            AERIS-01 System Status Visualization
          </h3>
        </div>
        <div className="flex items-center space-x-2 font-mono text-[9.5px]">
          <span className="text-[#8B949E]">HEADING: <strong className="text-[#3B9EFF]">{imu.headingCardinal}</strong></span>
          <span className="text-white/20">|</span>
          <span className="text-[#63C174] font-bold">● {imu.orientation}</span>
        </div>
      </div>

      {/* 2. Central Technical UAV Quadcopter Diagram with Surrounding Telemetry Nodes */}
      <div className="flex-1 relative flex items-center justify-center min-h-[220px]">
        {/* Subtle Background Radial Grid & Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-48 h-48 rounded-full border border-[#3B9EFF]/20 animate-ping-subtle"></div>
          <div className="w-64 h-64 rounded-full border border-white/5"></div>
          <div className="w-80 h-80 rounded-full border border-dashed border-white/5"></div>
          {/* Crosshair guidelines */}
          <div className="absolute w-full h-[1px] bg-white/5"></div>
          <div className="absolute h-full w-[1px] bg-white/5"></div>
        </div>

        {/* TOP CALLOUT NODE: GPS NAVIGATION */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="px-2.5 py-1 rounded-pill bg-[#181D1E] border border-[#63C174]/40 shadow-lg text-[9.5px] font-mono flex items-center space-x-1.5 text-[#E8ECEF]">
            <MapPin className="w-3 h-3 text-[#63C174]" />
            <span>GPS: <strong className="text-[#63C174]">{navigation.gpsStatus}</strong> ({navigation.satellites} Sats • {navigation.fixType})</span>
          </div>
          {/* Vertical subtle connection line */}
          <div className="w-[1px] h-4 bg-gradient-to-b from-[#63C174]/60 to-transparent"></div>
        </div>

        {/* LEFT CALLOUT NODE: BATTERY & POWER */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center">
          <div className="px-2.5 py-1.5 rounded-xl bg-[#181D1E] border border-[#63C174]/40 shadow-lg text-[9.5px] font-mono text-[#E8ECEF] space-y-0.5">
            <div className="flex items-center space-x-1 text-[#63C174] font-bold">
              <BatteryMedium className="w-3.5 h-3.5" />
              <span>BATTERY {battery.percentage}%</span>
            </div>
            <div className="text-[8.5px] text-[#8B949E]">
              {battery.voltage}V • {battery.temperature}°C • {battery.estimatedFlightTimeMin}m rem
            </div>
          </div>
          {/* Horizontal connection line */}
          <div className="h-[1px] w-4 bg-gradient-to-r from-[#63C174]/60 to-transparent"></div>
        </div>

        {/* RIGHT CALLOUT NODE: EDGE AI ENGINE */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center flex-row-reverse">
          <div className="px-2.5 py-1.5 rounded-xl bg-[#181D1E] border border-[#3B9EFF]/40 shadow-lg text-[9.5px] font-mono text-[#E8ECEF] space-y-0.5 text-right">
            <div className="flex items-center justify-end space-x-1 text-[#3B9EFF] font-bold">
              <span>EDGE AI: {edgeAi.status}</span>
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="text-[8.5px] text-[#8B949E]">
              {edgeAi.inferenceSpeedFps} FPS • {edgeAi.inferenceMode.split(' ')[0]}
            </div>
          </div>
          {/* Horizontal connection line */}
          <div className="h-[1px] w-4 bg-gradient-to-l from-[#3B9EFF]/60 to-transparent"></div>
        </div>

        {/* BOTTOM CALLOUT NODE: CAMERA EO/IR SYSTEM */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div className="w-[1px] h-4 bg-gradient-to-t from-[#3B9EFF]/60 to-transparent"></div>
          <div className="px-2.5 py-1 rounded-pill bg-[#181D1E] border border-[#3B9EFF]/40 shadow-lg text-[9.5px] font-mono flex items-center space-x-1.5 text-[#E8ECEF]">
            <Video className="w-3 h-3 text-[#3B9EFF]" />
            <span>CAMERA: <strong className="text-[#FF4D3D]">● LIVE</strong> (1080p Optical + MLX90640 Thermal)</span>
          </div>
        </div>

        {/* TECHNICAL QUADCOPTER VECTOR GRAPHIC */}
        <div className="relative w-36 h-36 flex items-center justify-center transform rotate-45">
          {/* Carbon Fiber Arm Cross */}
          <div className="absolute w-full h-3 bg-[#1C2125] border border-white/10 rounded-sm"></div>
          <div className="absolute h-full w-3 bg-[#1C2125] border border-white/10 rounded-sm"></div>

          {/* 4 Brushless Motor Pods & Propellers */}
          {/* Top-Left Rotor */}
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full border border-[#3B9EFF]/50 bg-[#070909] flex items-center justify-center shadow-[0_0_8px_rgba(59,158,255,0.3)]">
            <div className="w-7 h-7 rounded-full border border-dashed border-[#3B9EFF]/40 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#3B9EFF] absolute"></div>
          </div>

          {/* Top-Right Rotor */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full border border-[#3B9EFF]/50 bg-[#070909] flex items-center justify-center shadow-[0_0_8px_rgba(59,158,255,0.3)]">
            <div className="w-7 h-7 rounded-full border border-dashed border-[#3B9EFF]/40 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#3B9EFF] absolute"></div>
          </div>

          {/* Bottom-Left Rotor */}
          <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full border border-[#3B9EFF]/50 bg-[#070909] flex items-center justify-center shadow-[0_0_8px_rgba(59,158,255,0.3)]">
            <div className="w-7 h-7 rounded-full border border-dashed border-[#3B9EFF]/40 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#3B9EFF] absolute"></div>
          </div>

          {/* Bottom-Right Rotor */}
          <div className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full border border-[#3B9EFF]/50 bg-[#070909] flex items-center justify-center shadow-[0_0_8px_rgba(59,158,255,0.3)]">
            <div className="w-7 h-7 rounded-full border border-dashed border-[#3B9EFF]/40 animate-spin" style={{ animationDuration: '1.2s' }}></div>
            <div className="w-2 h-2 rounded-full bg-[#3B9EFF] absolute"></div>
          </div>

          {/* Central Avionics & Jetson Orin Core Fuselage */}
          <div className="relative z-20 w-16 h-16 rounded-xl bg-[#15191C] border-2 border-[#3B9EFF] flex flex-col items-center justify-center shadow-[0_0_16px_rgba(59,158,255,0.3)] transform -rotate-45">
            <span className="text-[8px] font-mono font-bold text-[#3B9EFF] tracking-wider">AERIS-01</span>
            <div className="w-2 h-2 rounded-full bg-[#63C174] my-0.5 animate-pulse"></div>
            <span className="text-[6.5px] font-mono text-[#8B949E]">CORE FUSED</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Telemetry Quick Strip */}
      <div className="grid grid-cols-4 gap-1 text-center font-mono text-[9px] pt-2 border-t border-white/5 shrink-0">
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-[#8B949E] block text-[8px]">ALTITUDE</span>
          <strong className="text-[#E8ECEF]">{flightTelemetry.altitudeAgl} m</strong>
        </div>
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-[#8B949E] block text-[8px]">GROUND SPEED</span>
          <strong className="text-[#E8ECEF]">{flightTelemetry.groundSpeed} m/s</strong>
        </div>
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-[#8B949E] block text-[8px]">VERT SPEED</span>
          <strong className="text-[#63C174]">+{flightTelemetry.verticalSpeed} m/s</strong>
        </div>
        <div className="p-1 rounded bg-[#181D1E] border border-white/5">
          <span className="text-[#8B949E] block text-[8px]">MISSION TIME</span>
          <strong className="text-[#3B9EFF]">{flightTelemetry.missionTimeFormatted}</strong>
        </div>
      </div>
    </div>
  );
}
