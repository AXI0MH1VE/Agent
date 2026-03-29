// ============================================================
// NEXUS AUDIT LOG MODAL — Immutable Session Audit Trail
// All JustificationTraces for the session, searchable + exportable
// ============================================================
import React, { useState } from 'react';
import type { Message } from '../types';

interface AuditLogModalProps {
  messages: Message[];
  sessionName: string;
  onClose: () => void;
}

const AuditLogModal: React.FC<AuditLogModalProps> = ({ messages, sessionName, onClose }) => {
  const [search, setSearch] = useState('');

  const tracedMessages = messages.filter(m => m.trace);
  const filtered = tracedMessages.filter(m =>
    !search ||
    m.trace?.traceId.includes(search) ||
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.trace?.status.includes(search.toLowerCase())
  );

  const handleExport = () => {
    const exportData = {
      sessionName,
      exportedAt: new Date().toISOString(),
      totalTraces: tracedMessages.length,
      traces: tracedMessages.map(m => ({
        messageId: m.id,
        timestamp: m.timestamp,
        status: m.alignmentStatus,
        eta: m.eta,
        trace: m.trace,
      })),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-audit-${sessionName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors: Record<string, string> = {
    aligned:   'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    warning:   'text-amber-400   border-amber-500/30   bg-amber-500/10',
    escalated: 'text-red-400     border-red-500/30     bg-red-500/10',
    frozen:    'text-slate-400   border-slate-500/30   bg-slate-500/10',
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      id="audit-log-modal"
      role="dialog"
      aria-label="Audit Log"
    >
      <div className="w-full max-w-3xl max-h-[80vh] flex flex-col rounded-2xl bg-[#0d0d11] border border-white/12 shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 40px rgba(99,102,241,0.08)' }}>

        {/* Modal Header */}
        <div className="p-5 border-b border-white/8 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-100">Immutable Audit Log</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">{sessionName} · {tracedMessages.length} signed traces</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="export-audit-btn"
              onClick={handleExport}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-[10px] font-semibold text-indigo-400 hover:bg-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export JSON-LD
            </button>
            <button
              id="close-audit-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              aria-label="Close audit log"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/6 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="audit-search-input"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search trace ID, status, or content…"
              className="w-full bg-white/4 border border-white/8 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 transition-all"
            />
          </div>
        </div>

        {/* Trace List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-[10px] text-slate-600 py-12">
              {search ? 'No matching traces found.' : 'No audit traces recorded yet.'}
            </div>
          )}
          {filtered.map((msg, idx) => {
            const trace = msg.trace!;
            const sc = statusColors[msg.alignmentStatus || 'aligned'] ?? statusColors.aligned;
            return (
              <div key={msg.id} className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
                {/* Trace Header */}
                <div className="px-4 py-2.5 border-b border-white/6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono text-slate-600">#{tracedMessages.length - idx}</span>
                    <span className="text-[9px] font-mono text-indigo-500/80">{trace.traceId.substring(0, 16)}…</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${sc}`}>
                      {(msg.alignmentStatus || 'aligned').toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono text-slate-600">
                      η={((msg.eta || 0) * 100).toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Trace Body */}
                <div className="p-4 grid grid-cols-2 gap-4">
                  {/* Scores */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold tracking-wider uppercase text-slate-600 mb-2">Alignment Scores</div>
                    {Object.entries({
                      Accuracy:       trace.alignmentScore.accuracy,
                      'Legal Ontology': trace.alignmentScore.legalOntology,
                      'Intent Fidelity': trace.alignmentScore.intentFidelity,
                      Overall:        trace.alignmentScore.overall,
                    }).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[9px]">
                        <span className="text-slate-600">{k}</span>
                        <span className={`font-mono font-bold ${v >= 0.75 ? 'text-emerald-400' : v >= 0.5 ? 'text-amber-400' : 'text-red-400'}`}>
                          {(v * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Gate + Verification */}
                  <div className="space-y-2">
                    <div className="text-[9px] font-bold tracking-wider uppercase text-slate-600 mb-2">Gate & Verification</div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-600">Invariant</span>
                      <span className={`font-bold ${trace.formalVerification.invariantCheck === 'passed' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trace.formalVerification.invariantCheck.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-600">Aux Losses</span>
                      <span className="font-bold text-emerald-400">DETACHED</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-600">Ontology</span>
                      <span className="font-mono text-indigo-400">{trace.formalVerification.ontologyMappingVersion}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-slate-600">Orth. Error</span>
                      <span className="font-mono text-slate-400">{trace.formalVerification.subspaceOrthogonalError}</span>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="px-4 py-2 bg-black/20 border-t border-white/4">
                  <span className="text-[8px] font-mono text-indigo-600 break-all">
                    SIG: {trace.gradientGate.verificationSignature}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuditLogModal;
