// ============================================================
// NEXUS CHAT MAIN — Director's Console Chat Interface
// Intent Chain Display, Message Rendering, Escalation Alerts
// ============================================================
import React, { useRef, useEffect } from 'react';
import type { Message, AlignmentStatus } from '../types';

interface ChatMainProps {
  messages: Message[];
  sessionName: string;
  jurisdiction: string;
  systemStatus: 'nominal' | 'warning' | 'frozen';
  onOpenAuditLog: () => void;
}

// ─── Alignment Status Badge ───────────────────────────────────────────────────

const AlignmentBadge: React.FC<{ status: AlignmentStatus; eta?: number }> = ({ status, eta }) => {
  const configs = {
    aligned:   { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', label: 'ALIGNED'   },
    warning:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-400',   label: 'WARNING'   },
    escalated: { bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     label: 'RED-LINE'  },
    frozen:    { bg: 'bg-slate-500/10',   border: 'border-slate-500/30',   text: 'text-slate-400',   label: 'FROZEN'    },
  };
  const c = configs[status as keyof typeof configs] || configs.aligned;
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${c.bg} border ${c.border}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${
        status === 'aligned' ? 'bg-emerald-400' :
        status === 'warning' ? 'bg-amber-400' :
        'bg-red-400'
      } animate-pulse`}/>
      <span className={`text-[9px] font-bold tracking-widest ${c.text}`}>{c.label}</span>
      {eta !== undefined && (
        <span className={`text-[9px] font-mono ${c.text}`}>η={( eta * 100).toFixed(1)}%</span>
      )}
    </div>
  );
};

// ─── Message Bubble ───────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isDirector  = message.role === 'director';
  const isSystem    = message.role === 'system';
  const isEscalation = message.role === 'escalation';

  // Escalation message
  if (isEscalation) {
    return (
      <div className="max-w-4xl mx-auto fade-in" id={`msg-${message.id}`}>
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2 shadow-escalation-msg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="12 2 22 20 2 20"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-red-400 uppercase">Red-Line Escalation</span>
            <span className="text-[9px] text-red-500/60 font-mono ml-auto">{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
          <p className="text-xs text-red-300/90 leading-relaxed pl-8">{message.content}</p>
          <div className="pl-8 text-[9px] font-mono text-red-500/60">
            CIRCUIT BREAKER: ENGAGED · WEIGHTS: FROZEN · ESCALATING TO HUMAN OVERSIGHT
          </div>
        </div>
      </div>
    );
  }

  // System message
  if (isSystem) {
    return (
      <div className="max-w-4xl mx-auto fade-in" id={`msg-${message.id}`}>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-bold text-indigo-400 shrink-0">
            SYS
          </div>
          <div className="flex-1 pt-1 space-y-2">
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {message.content}
            </div>
            <div className="text-[9px] text-slate-600 font-mono">{new Date(message.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    );
  }

  // Nexus response
  if (!isDirector) {
    return (
      <div className="max-w-4xl mx-auto fade-in" id={`msg-${message.id}`}>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-lg shadow-indigo-600/20">
            N1
          </div>
          <div className="flex-1 pt-0.5 space-y-3">
            {message.alignmentStatus && (
              <AlignmentBadge status={message.alignmentStatus} eta={message.eta} />
            )}
            <div
              className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-inter"
              dangerouslySetInnerHTML={{
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-100 font-semibold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>'),
              }}
            />
            {message.trace && (
              <div className="flex items-center gap-3 pt-1">
                <div className="h-px flex-1 bg-white/5"/>
                <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600">
                  <span>TRACE</span>
                  <span className="text-indigo-700">{message.trace.traceId.substring(0, 8)}</span>
                  <span>·</span>
                  <span>{message.trace.formalVerification.ontologyMappingVersion}</span>
                  <span>·</span>
                  <span className={
                    message.trace.formalVerification.invariantCheck === 'passed' ? 'text-emerald-600' :
                    message.trace.formalVerification.invariantCheck === 'warning' ? 'text-amber-600' : 'text-red-600'
                  }>{message.trace.formalVerification.invariantCheck.toUpperCase()}</span>
                </div>
                <div className="h-px flex-1 bg-white/5"/>
              </div>
            )}
            <div className="text-[9px] text-slate-600 font-mono">{new Date(message.timestamp).toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
    );
  }

  // Director message
  return (
    <div className="max-w-4xl mx-auto fade-in" id={`msg-${message.id}`}>
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-xl bg-slate-700/60 border border-white/10 flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
          DIR
        </div>
        <div className="flex-1 pt-0.5 flex flex-col items-end space-y-1.5">
          <div className="bg-indigo-600/12 border border-indigo-500/25 rounded-2xl rounded-tr-sm p-3.5 max-w-xl text-sm text-slate-200 leading-relaxed">
            {message.content}
          </div>
          <div className="text-[9px] text-slate-600 font-mono pr-1">{new Date(message.timestamp).toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-8 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
          <line x1="12" y1="22.08" x2="12" y2="12"/>
        </svg>
      </div>
      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
      </div>
    </div>
    <div className="space-y-2">
      <h2 className="text-lg font-bold text-slate-200">Nexus Director Console</h2>
      <p className="text-sm text-slate-500 max-w-md leading-relaxed">
        Submit an operational directive to begin. Every output will be projected onto S_Law and validated by the Alignment Oracle.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-2 w-full max-w-md text-left">
      {[
        { label: 'Draft a Rule 12(b)(6) motion', icon: '⚖️' },
        { label: 'Analyze recent case law precedents', icon: '📋' },
        { label: 'Review evidence under Rule 403', icon: '🔍' },
        { label: 'Assess jurisdictional standing', icon: '🗺️' },
      ].map((s, i) => (
        <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/8 text-[10px] text-slate-500 hover:text-slate-400 hover:border-white/12 transition-all cursor-pointer">
          <span className="mr-1.5">{s.icon}</span>{s.label}
        </div>
      ))}
    </div>
  </div>
);

// ─── Main ChatMain ────────────────────────────────────────────────────────────

const ChatMain: React.FC<ChatMainProps> = ({
  messages, sessionName, jurisdiction, systemStatus, onOpenAuditLog,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const statusColors = {
    nominal: 'text-emerald-400',
    warning: 'text-amber-400',
    frozen:  'text-red-400',
  };

  const isFrozen = systemStatus === 'frozen';

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
      {/* Frozen Overlay */}
      {isFrozen && (
        <div className="absolute inset-0 z-50 bg-red-950/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div className="text-center space-y-1">
            <div className="text-sm font-bold text-red-400 tracking-widest uppercase">Session Frozen</div>
            <div className="text-xs text-red-400/70">Weight updates suspended · Awaiting Director resolution</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-5 border-b border-white/6 flex items-center justify-between bg-[#0a0a0c]/80 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="space-y-0.5">
            <h1 className="text-base font-bold text-slate-100">{sessionName}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
              {jurisdiction} · RICA Active · Gradient Gating Enabled
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-wider">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              systemStatus === 'nominal' ? 'bg-emerald-400' :
              systemStatus === 'warning' ? 'bg-amber-400' : 'bg-red-400'
            }`}/>
            <span className={statusColors[systemStatus]}>{systemStatus.toUpperCase()}</span>
          </div>
          <button
            id="audit-log-btn"
            onClick={onOpenAuditLog}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-slate-400 hover:text-slate-300 hover:border-white/20 transition-all flex items-center gap-1.5"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Audit Log
          </button>
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-[9px] font-bold text-slate-400">
            LX
          </div>
        </div>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scroll-smooth"
        id="message-container"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map(msg => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>

      {/* SOC2 Footer Strip */}
      <div className="px-6 py-2 border-t border-white/4 bg-[#09090c]/60 shrink-0">
        <div className="text-center text-[8px] font-mono text-slate-700 tracking-widest uppercase">
          XPII Model X1 · Alignment-Only Delta Active · All interactions logged · JSON-LD traces generated · SOC 2 Type II compliant
        </div>
      </div>
    </main>
  );
};

export default ChatMain;
