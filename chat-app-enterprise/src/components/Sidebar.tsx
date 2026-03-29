import React from 'react';
import type { Session } from '../types';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  systemStatus: 'nominal' | 'warning' | 'frozen';
  averageEta: number;
  totalTraces: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions, activeSessionId, onSelectSession, onNewSession, systemStatus, averageEta, totalTraces
}) => {
  const frozen = systemStatus === 'frozen';
  const director = { name: "Director", role: "Operator" };

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

      {/* Stats Meter */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between text-[10px] tracking-widest uppercase font-bold text-slate-500 mb-2">
          <span>Global η Average</span>
          <span className={averageEta > 0.8 ? 'text-emerald-400' : 'text-amber-400'}>
            {(averageEta * 100).toFixed(1)}%
          </span>
        </div>
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 w-[var(--side-eta)]" 
              style={{ '--side-eta': `${Math.max(averageEta * 100, 3)}%` } as React.CSSProperties} 
            />
        </div>
        <div className="text-[9px] text-slate-600 mt-2 flex justify-between">
          <span>Traces Generated: {totalTraces}</span>
        </div>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Sessions</span>
          <button
            onClick={onNewSession}
            className="w-6 h-6 rounded bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 text-xs hover:bg-indigo-600/30 transition-all flex items-center justify-center"
            title="New Session"
          >
            +
          </button>
        </div>

        {sessions.map(session => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full p-3 rounded-lg text-left text-xs transition-all ${
              session.id === activeSessionId
                ? 'bg-white/10 text-slate-100 border border-white/10'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium truncate">{session.name}</span>
              {session.status === 'frozen' && (
                <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">FROZEN</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-600">
              <span>{session.messageCount} msg</span>
              <span>&middot;</span>
              <span>&eta; {(session.averageEta * 100).toFixed(0)}%</span>
            </div>
          </button>
        ))}
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
