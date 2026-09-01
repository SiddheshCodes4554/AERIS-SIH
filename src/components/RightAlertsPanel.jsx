import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Radio, 
  BatteryLow, 
  Wind, 
  Users, 
  ChevronRight,
  ShieldAlert,
  BrainCircuit,
  Cpu
} from 'lucide-react';

export default function RightAlertsPanel({ alerts = [], aiIntelligence }) {
  const [expandedAlertId, setExpandedAlertId] = useState(alerts[0]?.id || null);

  const getSeverityIcon = (severity, type) => {
    if (type === 'SIGNAL_LOSS') return <Radio className="w-3.5 h-3.5 text-aeris-amber" />;
    if (type === 'LOW_BATTERY') return <BatteryLow className="w-3.5 h-3.5 text-aeris-amber" />;
    if (type === 'HIGH_WIND') return <Wind className="w-3.5 h-3.5 text-aeris-textSecondary" />;
    return <Users className="w-3.5 h-3.5 text-aeris-red" />;
  };

  return (
    <div className="w-[380px] h-full flex flex-col aeris-glass-panel rounded-panel p-5 overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-xl font-normal tracking-tight text-aeris-textPrimary">
            Active Alerts
          </h2>
          <p className="text-xs text-aeris-textSecondary font-light mt-0.5">
            Mission-critical anomalies & telemetry
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-aeris-red animate-ping-subtle"></span>
      </div>

      {/* Alerts Scroll Container */}
      <div className="flex-1 space-y-3.5 overflow-y-auto pr-1">
        {/* 1. Critical Incident Card (Subtle Red Tinted Surface) */}
        {alerts.filter(a => a.severity === 'CRITICAL').map((alert) => (
          <div 
            key={alert.id} 
            className="aeris-alert-card rounded-card p-4 transition-all shadow-aeris-card"
          >
            {/* Incident Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-aeris-red shadow-[0_0_8px_#FF3B30]"></span>
                <span className="text-xs font-medium text-aeris-textPrimary">
                  {alert.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-aeris-textMuted">
                {alert.timeAgo}
              </span>
            </div>

            {/* Subtitle / Location */}
            <p className="text-[11px] text-aeris-textSecondary mt-1 font-light">
              {alert.subtitle}
            </p>

            {/* Situation Details */}
            {alert.details && (
              <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-aeris-textMuted">Affected Population:</span>
                  <span className="text-aeris-textPrimary font-medium">{alert.details.estimatedPeople}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-aeris-textMuted">AI Detection Confidence:</span>
                  <span className="text-aeris-green font-medium">{alert.details.confidence}%</span>
                </div>
                <p className="text-[11px] text-aeris-textSecondary/90 font-light mt-1 leading-relaxed">
                  {alert.details.situation}
                </p>
              </div>
            )}

            {/* AI Recommendation Callout */}
            {alert.aiRecommendation && (
              <div className="mt-3 p-2.5 rounded-xl bg-aeris-surface1/80 border border-white/10 flex items-start space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-aeris-cyan shrink-0 mt-0.5" />
                <div>
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-aeris-cyan font-semibold block leading-none mb-1">
                    AI RECOMMENDATION
                  </span>
                  <span className="text-xs text-aeris-textPrimary font-normal leading-tight block">
                    {alert.aiRecommendation}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* 2. Warning & Secondary Alert Cards */}
        {alerts.filter(a => a.severity !== 'CRITICAL').map((alert) => (
          <div 
            key={alert.id}
            className="aeris-glass-card rounded-card p-3.5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getSeverityIcon(alert.severity, alert.type)}
                <span className="text-xs font-medium text-aeris-textPrimary">
                  {alert.title}
                </span>
              </div>
              <span className="text-[10px] font-mono text-aeris-textMuted">
                {alert.timeAgo}
              </span>
            </div>

            <p className="text-[11px] text-aeris-textSecondary mt-1 font-light">
              {alert.subtitle}
            </p>

            {alert.aiRecommendation && (
              <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-aeris-textMuted font-mono flex items-center space-x-1.5">
                <span className="text-aeris-amber">→</span>
                <span className="text-aeris-textSecondary">{alert.aiRecommendation}</span>
              </div>
            )}
          </div>
        ))}

        {/* 3. AI Intelligence Card */}
        {aiIntelligence && (
          <div className="aeris-glass-card rounded-card p-4 border border-aeris-blue/20 bg-gradient-to-b from-aeris-surface2/90 to-aeris-surface1/90 shadow-aeris-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-4 h-4 text-aeris-cyan animate-soft-pulse" />
                <span className="text-xs font-medium text-aeris-textPrimary tracking-wide">
                  {aiIntelligence.title}
                </span>
              </div>
              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-pill bg-aeris-cyan/10 text-aeris-cyan border border-aeris-cyan/30">
                {aiIntelligence.confidence}% CONF
              </span>
            </div>

            <p className="text-xs text-aeris-textSecondary font-light leading-relaxed mb-3">
              {aiIntelligence.insight}
            </p>

            <div className="p-2.5 rounded-xl bg-aeris-surface3/80 border border-white/5 space-y-1">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-aeris-textMuted block">
                RECOMMENDED ACTION
              </span>
              <p className="text-xs text-aeris-textPrimary font-normal">
                {aiIntelligence.recommendation}
              </p>
            </div>

            <div className="flex items-center justify-between text-[9.5px] font-mono text-aeris-textMuted mt-2.5 pt-2 border-t border-white/5">
              <span>ENGINE: {aiIntelligence.inferenceEngine.split(' ')[0]}</span>
              <span>LATENCY: {aiIntelligence.latency}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
