import React from 'react';
import { 
  Radio, 
  Video, 
  Flame, 
  MapPin, 
  Compass, 
  Layers, 
  Cpu, 
  HardDrive, 
  CheckCircle2 
} from 'lucide-react';

export default function SensorStatusList({ sensors = [], isOffline }) {
  const getSensorIcon = (id) => {
    switch (id) {
      case 'rgb':
        return <Video className="w-3.5 h-3.5 text-[#3B9EFF]" />;
      case 'thermal':
        return <Flame className="w-3.5 h-3.5 text-[#F5A623]" />;
      case 'gps':
        return <MapPin className="w-3.5 h-3.5 text-[#63C174]" />;
      case 'imu':
        return <Compass className="w-3.5 h-3.5 text-[#3B9EFF]" />;
      case 'barometer':
        return <Layers className="w-3.5 h-3.5 text-[#63C174]" />;
      case 'ai':
        return <Cpu className="w-3.5 h-3.5 text-[#3B9EFF]" />;
      case 'buffer':
      default:
        return <HardDrive className="w-3.5 h-3.5 text-[#F5A623]" />;
    }
  };

  return (
    <div className="w-full h-full bg-[#111516] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between select-none font-sans overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2 shrink-0">
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-[#3B9EFF]" />
          <h3 className="text-xs font-semibold uppercase tracking-wider font-mono text-[#E8ECEF]">
            Sensor Systems
          </h3>
        </div>
        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-[#63C174]/15 text-[#63C174] border border-[#63C174]/30 font-bold">
          7 SENSORS ONLINE
        </span>
      </div>

      {/* Sensor Compact Rows List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5 min-h-0">
        {sensors.map((sensor) => {
          const isBufferAndOffline = sensor.id === 'buffer' && isOffline;
          const statusText = isBufferAndOffline ? 'BUFFERING (05)' : sensor.status;
          const statusColor = isBufferAndOffline 
            ? 'text-[#F5A623] bg-[#F5A623]/20 border-[#F5A623]/30' 
            : sensor.status === 'LIVE' 
              ? 'text-[#FF4D3D] bg-[#FF4D3D]/20 border-[#FF4D3D]/30'
              : 'text-[#63C174] bg-[#63C174]/20 border-[#63C174]/30';

          return (
            <div
              key={sensor.id}
              className="p-2 rounded-xl bg-[#181D1E] border border-white/5 flex items-center justify-between font-mono text-[10px] hover:border-white/10 transition-colors"
            >
              <div className="flex items-center space-x-2 min-w-0 pr-1.5">
                <div className="w-5 h-5 rounded-lg bg-[#111516] border border-white/5 flex items-center justify-center shrink-0">
                  {getSensorIcon(sensor.id)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-[#E8ECEF] truncate block text-[10.5px]">
                    {sensor.name}
                  </span>
                  <span className="text-[8.5px] text-[#8B949E] block truncate">
                    {sensor.spec}
                  </span>
                </div>
              </div>

              <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${statusColor}`}>
                ● {statusText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
