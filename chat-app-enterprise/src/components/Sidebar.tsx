// ============================================================
// NEXUS SIDEBAR — Session Management + Director Console Nav
// ============================================================
import React, { useState } from 'react';
import type { Session } from '../types/xpii';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  systemStatus: 'nominal' | 'warning' | 'frozen';
  averageEta: number;
  totalTraces: number;
}

const statusConfig = {
  nominal: { color: 'bg-emerald-500', label: 'NOMINAL', textColor: 'text-emerald-400' },
  warning: { color: 'bg-amber-500',   label: 'WARNING',  textColor: 'text-amber-400'  },
  frozen:  { color: 'bg-red-500',     label: 'FROZEN',   textColor: 'text-red-400'    },
};

const sessionStatusIcon = (status: Session['status']) => {
  if (status === 'active')   return { dot: 'bg-emerald-400', label: 'Active'  };
  if (status === 'frozen')   return { dot: 'bg-red-400',     label: 'Frozen'  };
  return                            { dot: 'bg-slate-500',   label: 'Archived'};
};

const Sidebar: React.FC<SidebarProps> = ({
  sessions, activeSessionId, onSelectSession, onNewSession,
  systemStatus, averageEta, totalTraces,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const sc = statusConfig[systemStatus];

  return (
    <aside
      className={`flex flex-col h-full bg-[#0d0d11] border-r border-white/8 transition-all duration-300 z-10 ${collapsed ? 'w-16' : 'w-72'}`}
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/8 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-400">XPII Model X1</div>
            <div className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">Nexus Director Console</div>
          </div>
        )}
        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-400 hover:bg-white/5 transition-all"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {collapsed
              ? <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
              : <><polyline points="15,18 9,12 15,6"/></>
            }
          </svg>
        </button>
      </div>

      {/* System Status */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-3 rounded-xl bg-white/3 border border-white/8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500">System Status</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${sc.color} animate-pulse`}/>
              <span className={`text-[9px] font-bold tracking-wider ${sc.textColor}`}>{sc.label}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Avg η Index</span>
              <span className={`text-[10px] font-mono font-bold ${averageEta >= 0.75 ? 'text-emerald-400' : averageEta >= 0.4 ? 'text-amber-400' : 'text-red-400'}`}>
                {(averageEta * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500">Audit Traces</span>
              <span className="text-[10px] font-mono font-bold text-slate-300">{totalTraces}</span>
            </div>
          </div>
        </div>
      )}

      {/* New Session Button */}
      <div className="p-3 shrink-0">
        <button
          id="new-session-btn"
          onClick={onNewSession}
          className={`w-full py-2.5 rounded-xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/25 hover:border-indigo-500/50 transition-all flex items-center gap-2 group ${collapsed ? 'justify-center px-2' : 'px-3'}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {!collapsed && <span className="text-xs font-semibold">New Session</span>}
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
        {!collapsed && (
          <div className="px-2 mb-2">
            <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-600">Sessions</span>
          </div>
        )}
        {sessions.map((session) => {
          const si = sessionStatusIcon(session.status);
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              id={`session-${session.id}`}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left rounded-xl transition-all duration-200 group
                ${isActive
                  ? 'bg-indigo-600/15 border border-indigo-500/30 text-slate-100'
                  : 'border border-transparent text-slate-400 hover:bg-white/4 hover:text-slate-300'}
                ${collapsed ? 'p-2 flex justify-center' : 'p-3'}
              `}
            >
              {collapsed ? (
                <div className={`w-2 h-2 rounded-full ${si.dot}`}/>
              ) : (
                <div className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${si.dot}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{session.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{session.messageCount} msgs</span>
                      <span>·</span>
                      <span className={`${session.averageEta >= 0.75 ? 'text-emerald-500' : 'text-amber-500'}`}>
                        η {(session.averageEta * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/8 shrink-0">
        {!collapsed && (
          <div className="text-[9px] text-slate-600 font-mono tracking-wider text-center">
            XPII X1 v1.0.0-Nexus<br/>
            <span className="text-indigo-700">AkomaNtoso_3.0 · LegalXML</span>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="w-2 h-2 rounded-full bg-indigo-600/60"/>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
