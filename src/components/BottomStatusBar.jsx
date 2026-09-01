import React from 'react';

export default function BottomStatusBar({ telemetry, isOfflineMode, dronePosition }) {
  const alt = String(telemetry?.position?.altitudeAgl || dronePosition?.altitude || '42.5').replace('m', '');
  const spd = String(telemetry?.position?.groundSpeed || dronePosition?.speed || '8.6').replace('m/s', '').trim();

  const lat = dronePosition?.latitude || 30.4158;
  const lng = dronePosition?.longitude || 79.3245;
  const locDisplay = `${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E`;

  return (
    <footer className="h-7 bg-[#090C0D] border-t border-aeris-border px-4 flex items-center justify-between text-[10px] font-mono select-none text-aeris-textSecondary shrink-0 z-20">
      {/* Left items */}
      <div className="flex items-center space-x-2.5">
        <span className="flex items-center text-aeris-textPrimary font-bold">
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isOfflineMode ? 'bg-aeris-amber animate-pulse' : 'bg-aeris-green shadow-glow-green'
          }`}></span>
          {telemetry?.droneId || 'AERIS-01'} {isOfflineMode ? '● OFFLINE' : '● ONLINE'}
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          LOCATION: <strong className="text-aeris-cyan">{locDisplay}</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          SOURCE: <strong className="text-aeris-green font-bold">SIMULATOR TELEMETRY</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          ALT: <strong className="text-aeris-textPrimary">{alt}m</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          SPEED: <strong className="text-aeris-textPrimary">{spd} m/s</strong>
        </span>
      </div>

      {/* Right items */}
      <div className="flex items-center space-x-2.5">
        <span>
          BATTERY: <strong className={(telemetry?.battery?.percentage || 84) > 50 ? 'text-aeris-green' : 'text-aeris-amber'}>
            {telemetry?.battery?.percentage || 84}%
          </strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span className="text-aeris-green font-medium">
          ● SIMULATOR GPS
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span className="text-aeris-cyan font-medium">
          YOLO ACTIVE
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
