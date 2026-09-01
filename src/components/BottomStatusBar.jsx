import React from 'react';

export default function BottomStatusBar({ telemetry, isOfflineMode }) {
  return (
    <footer className="h-7 bg-[#090C0D] border-t border-aeris-border px-4 flex items-center justify-between text-[10px] font-mono select-none text-aeris-textSecondary shrink-0 z-20">
      {/* Left items */}
      <div className="flex items-center space-x-2.5">
        <span className="flex items-center text-aeris-textPrimary font-bold">
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isOfflineMode ? 'bg-aeris-amber animate-pulse' : 'bg-aeris-green shadow-glow-green'
          }`}></span>
          {telemetry.droneId} {isOfflineMode ? '● OFFLINE' : '● ONLINE'}
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          CP: <strong className="text-aeris-cyan">{telemetry.checkpoints.currentId} / {telemetry.checkpoints.total}</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          MODE: <strong className="text-aeris-textPrimary">{telemetry.flightMode}</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          ALT: <strong className="text-aeris-textPrimary">{telemetry.position.altitudeAgl}m</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          SPEED: <strong className="text-aeris-textPrimary">{telemetry.position.groundSpeed} m/s</strong>
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center space-x-2.5">
        <span>
          BATTERY: <strong className={telemetry.battery.percentage > 50 ? 'text-aeris-green' : 'text-aeris-amber'}>
            {telemetry.battery.percentage}%
          </strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span className="text-aeris-green font-medium">
          GPS RTK FIXED
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span className="text-aeris-cyan font-medium">
          AI ACTIVE
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          BUFFERED: <strong className={isOfflineMode ? 'text-aeris-amber font-bold' : 'text-aeris-textSecondary'}>
            {isOfflineMode ? '5 EVENTS' : '0'}
          </strong>
        </span>
      </div>
    </footer>
  );
}
