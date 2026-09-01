import React from 'react';

export default function BottomStatusBar({ telemetry, isOfflineMode, deviceLocation, locationStatus }) {
  const alt = String(telemetry?.position?.altitudeAgl || '42.5').replace('m', '');
  const spd = String(telemetry?.position?.groundSpeed || '8.5').replace('m/s', '').trim();

  const hasCoords = deviceLocation && deviceLocation.latitude && deviceLocation.longitude;
  const locDisplay = hasCoords
    ? `${deviceLocation.latitude.toFixed(5)}, ${deviceLocation.longitude.toFixed(5)} (±${Math.round(deviceLocation.accuracy || 25)}m)`
    : (locationStatus || 'ACQUIRING LOCATION');

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
          LOCATION: <strong className={hasCoords ? 'text-aeris-cyan' : 'text-aeris-amber'}>{locDisplay}</strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span>
          SOURCE: <strong className="text-aeris-green font-bold">DEVICE LOCATION</strong>
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
          BATTERY: <strong className={(telemetry?.battery?.percentage || 85) > 50 ? 'text-aeris-green' : 'text-aeris-amber'}>
            {telemetry?.battery?.percentage || 85}%
          </strong>
        </span>

        <span className="text-aeris-textMuted">|</span>

        <span className={hasCoords ? 'text-aeris-green font-medium' : 'text-aeris-amber font-medium'}>
          {hasCoords ? '● GPS FIX' : '● LOCATING'}
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
