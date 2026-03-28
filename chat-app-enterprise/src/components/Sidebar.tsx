import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 glassmorphism flex flex-col h-full border-r border-white/10 z-10 transition-all duration-300">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-widest uppercase text-slate-400">Operator</h2>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <button className="w-full py-2 px-4 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-600/30 transition-all mb-4">
          + New Standardization
        </button>
        
        <div className="space-y-1">
          {['Session Alpha', 'Protocol Refinement', 'Security Audit', 'ISO Compliance'].map((item, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg text-sm cursor-pointer transition-all ${i === 0 ? 'bg-white/5 text-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'}`}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-white/10 text-xs text-slate-500 text-center italic">
        Axiom Hive v1.0.0-Ent
      </div>
    </aside>
  );
};

export default Sidebar;
