import React from 'react';
import { useNexusStore } from '../store/nexusStore';
import { JustificationTrace } from '../types';

const TraceViewer: React.FC<{ trace: JustificationTrace }> = ({ trace }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Trace ID</span>
        <code className="text-indigo-400 font-mono text-[10px]">{trace.traceId.slice(0, 16)}...</code>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Status</div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
            trace.status === 'committed' ? 'bg-emerald-500/20 text-emerald-400' :
            trace.status === 'escalated' ? 'bg-red-500/20 text-red-400' :
            'bg-amber-500/20 text-amber-400'
          }`}>
            {trace.status.toUpperCase()}
          </span>
        </div>
        <div className="space-y-1">
          <div className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Timestamp</div>
          <div className="text-slate-300 font-mono">
            {new Date(trace.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Pattern State</div>
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <div>
            <span className="text-slate-500">Motive: </span>
            <code className="text-amber-400 text-[10px]">{trace.patternState.motive}</code>
          </div>
          <div>
            <span className="text-slate-500">Constraints: </span>
            {trace.patternState.constraints.length > 0 ? (
              trace.patternState.constraints.map((c, i) => (
                <span key={i} className="inline-block bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded mr-1 text-[10px]">
                  {c}
                </span>
              ))
            ) : (
              <span className="text-slate-600">none active</span>
            )}
          </div>
          <div>
            <span className="text-slate-500">Commitments: </span>
            {trace.patternState.commitments.length > 0 ? (
              trace.patternState.commitments.map((c, i) => (
                <span key={i} className="inline-block bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded mr-1 text-[10px]">
                  {c}
                </span>
              ))
            ) : (
              <span className="text-slate-600">none established</span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Gradient Gate</div>
        <div className="bg-white/5 rounded-lg p-3 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">||g|| raw:</span>
            <span className="text-slate-300">{trace.gradientGate.rawGradientMagnitude}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">||Δθ|| projected:</span>
            <span className="text-slate-300">{trace.gradientGate.projectedGradientMagnitude}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">η harmony:</span>
            <span className={
              trace.gradientGate.harmonyIndex > 0.7 ? 'text-emerald-400' :
              trace.gradientGate.harmonyIndex > 0.4 ? 'text-amber-400' :
              'text-red-400'
            }>
              {trace.gradientGate.harmonyIndex}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Invariant check:</span>
            <span className={trace.gradientGate.invariantCheck === 'passed' ? 'text-emerald-400' : 'text-red-400'}>
              {trace.gradientGate.invariantCheck.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Norm clipping:</span>
            <span className="text-slate-300">
              {trace.gradientGate.safeNormClipping.applied ? 'APPLIED' : 'NONE'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">ε radius:</span>
            <span className="text-slate-300">{trace.gradientGate.safeNormClipping.radiusEpsilon}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Formal Verification</div>
        <div className="bg-white/5 rounded-lg p-3 space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-slate-500">Ontology:</span>
            <span className="text-indigo-300">{trace.ontologyMapping}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Subspace error:</span>
            <span className="text-emerald-400">{trace.gradientGate.subspaceOrthogonalError}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-500 uppercase tracking-wider font-bold text-[10px]">Signature</div>
        <div className="bg-white/5 rounded-lg p-3 font-mono text-[10px] break-all text-slate-400">
          {trace.signature}
        </div>
      </div>
    </div>
  );
};

const JustificationTraceViewer: React.FC = () => {
  const messages = useNexusStore(s => s.messages);
  const selectedTraceId = useNexusStore(s => s.selectedTraceId);

  const traces = messages
    .filter(m => m.trace)
    .map(m => m.trace!);

  const selectedTrace = selectedTraceId
    ? traces.find(t => t.traceId === selectedTraceId)
    : traces[traces.length - 1];

  return (
    <div className="flex flex-col h-full">
      {traces.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
          No traces generated yet. Send a message to begin.
        </div>
      ) : (
        <>
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
              Trace History ({traces.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {traces.map((t, i) => (
                <button
                  key={t.traceId}
                  onClick={() => useNexusStore.getState().setSelectedTrace(t.traceId)}
                  className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                    (selectedTraceId === t.traceId || (!selectedTraceId && i === traces.length - 1))
                      ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                      : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-400'
                  }`}
                >
                  #{i + 1} {t.status === 'committed' ? '●' : '▲'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedTrace && <TraceViewer trace={selectedTrace} />}
          </div>
        </>
      )}
    </div>
  );
};

export default JustificationTraceViewer;
