import React from 'react';

export default function DroneLineIllustration({ className = "w-full h-24", selected = false, status = "ACTIVE" }) {
  const accentColor = status === "OFFLINE" ? "#D99A4A" : status === "RETURNING" ? "#3B8EDB" : "#65C466";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg 
        viewBox="0 0 240 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full opacity-90 transition-opacity hover:opacity-100"
      >
        {/* Subtle grid background lines */}
        <line x1="10" y1="50" x2="230" y2="50" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />
        <line x1="120" y1="10" x2="120" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="2 4" />

        {/* Central Aerodynamic Fuselage */}
        <path 
          d="M85 50 C85 43, 105 38, 120 38 C135 38, 155 43, 155 50 C155 57, 135 62, 120 62 C105 62, 85 57, 85 50 Z" 
          stroke="#E2E8F0" 
          strokeWidth="1.2" 
          fill="rgba(16, 20, 24, 0.6)"
        />

        {/* Cockpit / Sensor Housing Dome */}
        <ellipse cx="120" cy="50" rx="14" ry="7" stroke="#38BDF8" strokeWidth="1" fill="rgba(56, 189, 248, 0.15)" />
        <circle cx="120" cy="50" r="2.5" fill="#38BDF8" />

        {/* Longitudinal Spine */}
        <line x1="95" y1="50" x2="145" y2="50" stroke="#94A3B8" strokeWidth="0.75" strokeDasharray="3 3" />

        {/* Front Left Rotor Arm */}
        <path d="M102 44 L45 28" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
        {/* Front Left Rotor Motor Nacelle */}
        <circle cx="45" cy="28" r="5" stroke="#E2E8F0" strokeWidth="1" fill="#15191B" />
        {/* Front Left Propeller Disc */}
        <ellipse cx="45" cy="28" rx="22" ry="5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" strokeDasharray="2 2" />

        {/* Front Right Rotor Arm */}
        <path d="M138 44 L195 28" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
        {/* Front Right Motor Nacelle */}
        <circle cx="195" cy="28" r="5" stroke="#E2E8F0" strokeWidth="1" fill="#15191B" />
        {/* Front Right Propeller Disc */}
        <ellipse cx="195" cy="28" rx="22" ry="5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" strokeDasharray="2 2" />

        {/* Rear Left Rotor Arm */}
        <path d="M102 56 L45 72" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
        {/* Rear Left Motor Nacelle */}
        <circle cx="45" cy="72" r="5" stroke="#E2E8F0" strokeWidth="1" fill="#15191B" />
        {/* Rear Left Propeller Disc */}
        <ellipse cx="45" cy="72" rx="22" ry="5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" strokeDasharray="2 2" />

        {/* Rear Right Rotor Arm */}
        <path d="M138 56 L195 72" stroke="#E2E8F0" strokeWidth="1.2" strokeLinecap="round" />
        {/* Rear Right Motor Nacelle */}
        <circle cx="195" cy="72" r="5" stroke="#E2E8F0" strokeWidth="1" fill="#15191B" />
        {/* Rear Right Propeller Disc */}
        <ellipse cx="195" cy="72" rx="22" ry="5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" strokeDasharray="2 2" />

        {/* Forward Optical Gimbal Nose Sensor */}
        <path d="M155 50 L168 50" stroke="#38BDF8" strokeWidth="1.5" />
        <circle cx="168" cy="50" r="3" stroke="#38BDF8" strokeWidth="1" fill={accentColor} />

        {/* Tech Dimension / Marker Ticks */}
        <line x1="25" y1="20" x2="35" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
        <line x1="205" y1="20" x2="215" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
        <line x1="120" y1="82" x2="120" y2="88" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
      </svg>
    </div>
  );
}
