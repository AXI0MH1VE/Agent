import React from 'react';
import { useNexusStore } from '../store/nexusStore';
import type { AlignmentStatus } from '../types';

const statusConfig: Record<AlignmentStatus, { color: string; bg: string; label: string; pulse: boolean }> = {
  aligned: { color: 'text-emerald-400', bg: 'bg-emerald-500', label: 'ALIGNED', pulse: false },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500', label: 'WARNING', pulse: true },
  escalated: { color: 'text-red-400', bg: 'bg-red-500', label: 'ESCALATED', pulse: true },
  frozen: { color: 'text-red-500', bg: 'bg-red-600', label: 'FROZEN', pulse: true },
};

const AlignmentMeter: React.FC = () => {
  const messages = useNexusStore(s => s.messages);
  const frozen = useNexusStore(s => s.frozen);
  const getAlignmentStatus = useNexusStore(s => s.getAlignmentStatus);

  const status = getAlignmentStatus();
  const config = statusConfig[status];

  const lastScore = messages
    .filter(m => m.alignmentScore)
    .slice(-1)[0]?.alignmentScore;

  const eta = lastScore?.composite ?? 0;
  const etaPercent = Math.round(eta * 100);

  const barColor =
    eta > 0.7 ? 'bg-emerald-500' :
    eta > 0.4 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className="p-4 border-b border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
          Alignment Harmony
        </span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.bg} ${config.pulse ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-bold tracking-widest ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">η (Harmony Index)</span>
          <span className={`text-sm font-mono font-bold ${config.color}`}>
            {etaPercent}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
            style={{ width: `${etaPercent}%` }}
          />
        </div>
      </div>

      {lastScore && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-slate-500">Accuracy</div>
            <div className="text-xs font-mono text-slate-300">
              {(lastScore.accuracy * 100).toFixed(0)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-slate-500">Legal</div>
            <div className="text-xs font-mono text-slate-300">
              {(lastScore.legalOntology * 100).toFixed(0)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] uppercase tracking-wider text-slate-500">Fidelity</div>
            <div className="text-xs font-mono text-slate-300">
              {(lastScore.intentFidelity * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlignmentMeter;
