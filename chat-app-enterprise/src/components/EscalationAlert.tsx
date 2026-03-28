import React from 'react';
import { useNexusStore } from '../store/nexusStore';

const EscalationAlert: React.FC = () => {
  const frozen = useNexusStore(s => s.frozen);
  const frozenReason = useNexusStore(s => s.frozenReason);
  const unfreeze = useNexusStore(s => s.unfreeze);
  const messages = useNexusStore(s => s.messages);

  const lastEscalation = [...messages].reverse().find(m => m.isEscalation);

  if (!frozen && !lastEscalation) return null;

  return (
    <div className={`border-b ${frozen ? 'border-red-500/30 bg-red-950/30' : 'border-amber-500/30 bg-amber-950/20'}`}>
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            frozen ? 'bg-red-500/20' : 'bg-amber-500/20'
          }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={frozen ? 'text-red-400' : 'text-amber-400'}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="flex-1 space-y-1">
            <div className={`text-xs font-bold uppercase tracking-wider ${frozen ? 'text-red-400' : 'text-amber-400'}`}>
              {frozen ? 'Circuit Breaker Active — Session Frozen' : 'Alignment Warning'}
            </div>
            <p className="text-xs text-slate-400">
              {frozen ? frozenReason : 'The last response triggered a low alignment score. Review the justification trace.'}
            </p>
            {frozen && (
              <button
                onClick={unfreeze}
                className="mt-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-all"
              >
                Unfreeze Session (Director Override)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscalationAlert;
