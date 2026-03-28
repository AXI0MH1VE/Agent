import React, { useState } from 'react';

const InputArea: React.FC = () => {
  const [value, setValue] = useState('');

  return (
    <footer className="p-8 bg-background/80 backdrop-blur-xl border-t border-white/5 z-30">
      <div className="max-w-4xl mx-auto relative group">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Provide operational directives..."
          className="input-directive w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-16 focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-100 placeholder-slate-500 resize-none shadow-2xl"
        />
        <button
          aria-label="Transmit directive to subsystem"
          title="Transmit directive"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!value.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
      <div className="mt-4 text-center">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">
          OPERATOR DIRECTIVE PROTOCOL ALPHA ACTIVE | EMPIRICAL VERIFICATION MANDATED
        </span>
      </div>
    </footer>
  );
};

export default InputArea;
