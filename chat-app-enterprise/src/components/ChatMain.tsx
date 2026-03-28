import React from 'react';

const ChatMain: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
      <header className="p-6 border-b border-white/5 flex items-center justify-between glassmorphism z-20">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">AI Operational Standard Interface</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-medium">Session Alpha: Monitoring Active Subsystems</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">SOC 2 COMPLIANT</span>
          <div className="w-10 h-10 rounded-full border border-white/10 group cursor-pointer hover:border-indigo-500/50 transition-all flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 transition-all">LX</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-12 space-y-8 scroll-smooth" id="message-container">
        {/* Welcome Message */}
        <div className="flex gap-4 fade-in max-w-4xl mx-auto">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-indigo-500/20">SYS</div>
          <div className="space-y-4 pt-1">
            <h3 className="text-lg font-bold text-slate-200">Axiom Hive Enterprise Subsystem Online.</h3>
            <div className="text-slate-300 leading-relaxed text-sm space-y-4">
              <p>Welcome, Operator. This environment is now operational under the <strong>Actionable AI Protocol</strong>. All interactions are logged for SOC 2 Type II compliance tracking.</p>
              <p>The current session is focused on: <em>E-Commerce Sales Ratio Optimization</em>.</p>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-indigo-300">
                STATUS: [NOMINAL] <br />
                LATENCY: [12ms] <br />
                OPERATOR: [LEX]
              </div>
            </div>
          </div>
        </div>

        {/* User Directive Example */}
        <div className="flex flex-row-reverse gap-4 fade-in max-w-4xl mx-auto opacity-80">
          <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">OP</div>
          <div className="space-y-2 pt-1 text-right">
            <div className="p-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 inline-block text-slate-200 text-sm italic">
              Analyze recent association rules for product pairing optimization.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatMain;
