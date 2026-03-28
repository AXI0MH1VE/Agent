import React, { useState, useRef, useEffect } from 'react';
import { useNexusStore } from '../store/nexusStore';
import { LEGAL_CONSTRAINTS } from '../lib/legalOntology';

const InputArea: React.FC = () => {
  const [value, setValue] = useState('');
  const [showConstraints, setShowConstraints] = useState(false);
  const frozen = useNexusStore(s => s.frozen);
  const sendMessage = useNexusStore(s => s.sendMessage);
  const toggleConstraint = useNexusStore(s => s.toggleConstraint);
  const activeSession = useNexusStore(s => s.getActiveSession)();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!value.trim() || frozen) return;
    sendMessage(value.trim());
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  };

  const activeConstraintIds = activeSession?.constraints.filter(c => c.active).map(c => c.id) || [];

  return (
    <footer className="border-t border-white/5 bg-[#0d0d10]/80 backdrop-blur-xl z-30 shrink-0">
      {/* Constraint Selector */}
      {showConstraints && (
        <div className="px-8 pt-4 pb-2 border-b border-white/5">
          <div className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">
            Constraint Manifold (S_Law)
          </div>
          <div className="flex flex-wrap gap-2">
            {LEGAL_CONSTRAINTS.map(c => {
              const isActive = activeConstraintIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => toggleConstraint(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                    isActive
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:text-slate-400'
                  }`}
                >
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                    isActive ? 'bg-indigo-400' : 'bg-slate-600'
                  }`} />
                  {c.label}
                  {c.severity === 'critical' && (
                    <span className="ml-1.5 text-red-400 text-[8px]">CRIT</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="flex items-end gap-2">
            {/* Constraint Toggle */}
            <button
              onClick={() => setShowConstraints(!showConstraints)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                showConstraints
                  ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:text-slate-400'
              }`}
              title="Toggle Constraints"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="21" x2="4" y2="14" />
                <line x1="4" y1="10" x2="4" y2="3" />
                <line x1="12" y1="21" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="3" />
                <line x1="20" y1="21" x2="20" y2="16" />
                <line x1="20" y1="12" x2="20" y2="3" />
                <line x1="1" y1="14" x2="7" y2="14" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            </button>

            {/* Textarea */}
            <div className="flex-1 relative group">
              <textarea
                ref={textareaRef}
                rows={1}
                value={value}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={frozen ? 'Session frozen — unfreeze to continue' : 'Input directive (e.g., Draft a motion under Rule 12b6)'}
                disabled={frozen}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 pr-14 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/10 transition-all text-slate-100 placeholder-slate-600 resize-none disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                style={{ minHeight: '44px', maxHeight: '160px' }}
              />
              <button
                onClick={handleSubmit}
                disabled={!value.trim() || frozen}
                aria-label="Submit directive"
                className="absolute right-2 bottom-2 w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status bar */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] text-slate-600">
              <span className="uppercase tracking-widest font-bold">
                Alignment-Only Delta Active
              </span>
              <span>·</span>
              <span>Δθ = P_Law · g</span>
              <span>·</span>
              <span>{activeConstraintIds.length} constraint{activeConstraintIds.length !== 1 ? 's' : ''} pinned</span>
            </div>
            <div className="text-[9px] text-slate-700 font-mono">
              Shift+Enter for newline
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default InputArea;
