import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../store/nexusStore';
import { Message } from '../types';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isDirector = message.role === 'director';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex gap-4 fade-in max-w-4xl mx-auto">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-indigo-400 shrink-0">
          SYS
        </div>
        <div className="space-y-2 pt-1 flex-1">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-slate-400 font-mono leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  if (isDirector) {
    return (
      <div className="flex flex-row-reverse gap-4 fade-in max-w-4xl mx-auto">
        <div className="w-8 h-8 rounded-lg bg-slate-700/50 border border-slate-600/30 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
          DIR
        </div>
        <div className="space-y-2 pt-1 text-right flex-1">
          <div className="inline-block text-left p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-slate-200 text-sm">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  // Assistant
  const score = message.alignmentScore;
  const eta = score?.composite ?? 0;
  const traceColor =
    eta > 0.7 ? 'border-emerald-500/20' :
    eta > 0.4 ? 'border-amber-500/20' :
    'border-red-500/20';

  return (
    <div className={`flex gap-4 fade-in max-w-4xl mx-auto ${message.isEscalation ? 'border-l-2 border-red-500/50 pl-2' : ''}`}>
      <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
        O
      </div>
      <div className="space-y-2 pt-1 flex-1">
        <div className={`p-4 rounded-2xl bg-white/5 border ${traceColor} text-slate-200 text-sm leading-relaxed`}>
          {message.content}
        </div>

        {score && (
          <div className="flex items-center gap-3 text-[10px] text-slate-600">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${
                eta > 0.7 ? 'bg-emerald-500' : eta > 0.4 ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              η {(eta * 100).toFixed(0)}%
            </span>
            <span>Acc {(score.accuracy * 100).toFixed(0)}%</span>
            <span>Legal {(score.legalOntology * 100).toFixed(0)}%</span>
            <span>Fid {(score.intentFidelity * 100).toFixed(0)}%</span>
            {message.traceId && (
              <button
                onClick={() => useNexusStore.getState().setActiveTab('trace')}
                className="text-indigo-500 hover:text-indigo-400 transition-colors"
              >
                View Trace →
              </button>
            )}
          </div>
        )}

        {message.isEscalation && (
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
            ▲ Alignment threshold violated — Escalation triggered
          </div>
        )}
      </div>
    </div>
  );
};

const ChatMain: React.FC = () => {
  const messages = useNexusStore(s => s.messages);
  const frozen = useNexusStore(s => s.frozen);
  const activeSession = useNexusStore(s => s.getActiveSession)();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0a0a0e]">
      {/* Header */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0d0d10]/80 backdrop-blur-xl z-20 shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-slate-100">Director's Console</h1>
          <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">
            {activeSession?.name || 'No Session'} · Intent Chain: {activeSession?.intentChain.length || 0} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${
            frozen
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {frozen ? 'SESSION FROZEN' : 'ALIGNMENT ACTIVE'}
          </span>
          <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            AKOMA NTOSO v3.0
          </span>
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            <div className="text-center space-y-3">
              <div className="text-4xl">◇</div>
              <p>XPII Model X1 Nexus ready.</p>
              <p className="text-xs">Provide a directive to begin the intent chain.</p>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
      </div>
    </main>
  );
};

export default ChatMain;
