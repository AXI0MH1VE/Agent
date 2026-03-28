// ============================================================
// NEXUS INPUT AREA — Director Directive Interface
// Constraint Pins, Intent Chain Context, Transmission Gate
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import type { LegalConstraint } from '../types/xpii';

interface InputAreaProps {
  onSubmit: (intent: string) => void;
  disabled: boolean;
  frozen: boolean;
  activeConstraints: LegalConstraint[];
  intentChainLength: number;
}

const InputArea: React.FC<InputAreaProps> = ({
  onSubmit, disabled, frozen, activeConstraints, intentChainLength,
}) => {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || frozen) return;
    onSubmit(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const activeCount = activeConstraints.filter(c => c.active).length;
  const canSubmit = value.trim().length > 0 && !disabled && !frozen;

  return (
    <footer className="px-6 py-4 bg-[#09090c]/90 backdrop-blur-xl border-t border-white/6 shrink-0 z-30">
      {/* Context Row */}
      <div className="max-w-4xl mx-auto mb-2.5 flex items-center gap-3">
        {/* Intent Chain Counter */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/4 border border-white/8">
          <div className="w-4 h-4 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <span className="text-[9px] font-mono text-slate-500">Chain:</span>
          <span className="text-[9px] font-mono font-bold text-indigo-400">{intentChainLength}</span>
        </div>

        {/* Active Constraints */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/4 border border-white/8">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"/>
          <span className="text-[9px] font-mono text-slate-500">Constraints:</span>
          <span className="text-[9px] font-mono font-bold text-indigo-400">{activeCount}</span>
        </div>

        {/* Active Constraint Pills */}
        <div className="flex items-center gap-1 flex-1 overflow-hidden">
          {activeConstraints.filter(c => c.active).slice(0, 3).map(c => (
            <span key={c.id} className="text-[8px] px-1.5 py-0.5 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-medium whitespace-nowrap">
              {c.label}
            </span>
          ))}
          {activeCount > 3 && (
            <span className="text-[8px] text-slate-600">+{activeCount - 3} more</span>
          )}
        </div>
      </div>

      {/* Input Box */}
      <div className="max-w-4xl mx-auto relative">
        <div
          className={`relative rounded-2xl border transition-all duration-200 ${
            frozen
              ? 'border-red-500/30 bg-red-950/20'
              : focused
              ? 'border-indigo-500/50 bg-white/5 shadow-[0_0_0_4px_rgba(99,102,241,0.06)]'
              : 'border-white/10 bg-white/4 hover:border-white/15'
          }`}
        >
          <textarea
            ref={textareaRef}
            id="director-input"
            rows={1}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={frozen || disabled}
            placeholder={
              frozen
                ? '⚠ Session frozen — awaiting Director resolution…'
                : 'Input operational directive… (↵ to transmit, Shift+↵ for newline)'
            }
            className="w-full bg-transparent px-4 pt-3.5 pb-3.5 pr-14 focus:outline-none text-slate-100 placeholder-slate-600 text-sm resize-none leading-relaxed max-h-40 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Transmit Button */}
          <button
            id="transmit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Transmit directive to Nexus"
            title="Transmit directive (Enter)"
            className={`absolute right-3 bottom-3 w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95
              ${canSubmit
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 text-white'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
              }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-2.5 text-center">
        <span className="text-[8px] text-slate-700 uppercase tracking-[0.2em] font-bold">
          {frozen
            ? '⚠ CIRCUIT BREAKER ACTIVE · HUMAN OVERSIGHT REQUIRED'
            : 'OPERATOR DIRECTIVE PROTOCOL · EMPIRICAL VERIFICATION MANDATED · ALL DELTAS ALIGNMENT-ONLY'
          }
        </span>
      </div>
    </footer>
  );
};

export default InputArea;
