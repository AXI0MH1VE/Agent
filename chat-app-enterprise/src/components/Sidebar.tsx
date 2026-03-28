import React from 'react';
import { useNexusStore } from '../store/nexusStore';
import AlignmentMeter from './AlignmentMeter';

const Sidebar: React.FC = () => {
  const sessions = useNexusStore(s => s.sessions);
  const activeSessionId = useNexusStore(s => s.activeSessionId);
  const selectSession = useNexusStore(s => s.selectSession);
  const createSession = useNexusStore(s => s.createSession);
  const activeSession = useNexusStore(s => s.getActiveSession)();
  const frozen = useNexusStore(s => s.frozen);
  const director = useNexusStore(s => s.director);

  return (
    <aside className="w-72 flex flex-col h-full border-r border-white/10 bg-[#0d0d10] shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase text-indigo-400">
              XPII Model X1
            </h2>
            <p className="text-[10px] text-slate-600 mt-0.5">Nexus Platform</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${frozen ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500">
              {frozen ? 'FROZEN' : 'ONLINE'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
            {director.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-medium text-slate-300">{director.name}</div>
            <div className="text-[9px] uppercase tracking-wider text-slate-600">{director.role}</div>
          </div>
        </div>
      </div>

      {/* Alignment Meter */}
      <AlignmentMeter />

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Sessions</span>
          <button
            onClick={() => createSession()}
            className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs hover:bg-indigo-600/30 transition-all flex items-center justify-center"
            title="New Session"
          >
            +
          </button>
        </div>

        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => selectSession(session.id)}
            className={`w-full p-3 rounded-lg text-left text-xs transition-all ${
              session.id === activeSessionId
                ? 'bg-white/10 text-slate-100 border border-white/10'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{session.name}</span>
              {session.frozen && (
                <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">FROZEN</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-600">
              <span>{session.intentChain.length} entries</span>
              <span>&middot;</span>
              <span>&eta; {(session.averageEta * 100).toFixed(0)}%</span>
            </div>
          </button>
        ))}

        {/* Active Constraints */}
        {activeSession && (
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Active Constraints</span>
            {activeSession.constraints.map(c => (
              <div
                key={c.id}
                className={`p-2 rounded-lg text-[10px] border transition-all ${
                  c.active
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                    : 'bg-white/5 border-white/5 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{c.label}</span>
                  {c.pinnedAt && <span className="text-[8px] text-amber-400">PIN</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Commitment Log */}
        {activeSession && activeSession.commitments.length > 0 && (
          <div className="mt-4 space-y-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Commitment Log</span>
            {activeSession.commitments.map(c => (
              <div
                key={c.id}
                className="p-2 rounded-lg text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
              >
                <div className="font-medium">&bull; {c.text}</div>
                <div className="text-[9px] text-slate-600 mt-0.5">
                  {new Date(c.establishedAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 text-center">
        <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">
          XPII X1 Nexus v1.0.0 | Alignment-Only Delta
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
