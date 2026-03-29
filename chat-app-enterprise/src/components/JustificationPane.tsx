// ============================================================
// NEXUS JUSTIFICATION PANE — Live Audit Trace & Oracle Panel
// JSON-LD Display, η Gauge, Gradient Gate Visualization
// ============================================================
import React, { useState } from 'react';
import type { JustificationTrace, LegalConstraint, Commitment } from '../types';

interface JustificationPaneProps {
  latestTrace: JustificationTrace | null;
  constraints: LegalConstraint[];
  commitments: Commitment[];
  onToggleConstraint: (id: string) => void;
  onClearCommitments: () => void;
}

// ─── η Gauge Component ────────────────────────────────────────────────────────

const EtaGauge: React.FC<{ eta: number }> = ({ eta }) => {
  const pct = Math.round(eta * 100);
  const color = eta >= 0.75 ? '#10b981' : eta >= 0.4 ? '#f59e0b' : '#ef4444';
  const label = eta >= 0.75 ? 'ALIGNED' : eta >= 0.4 ? 'WARNING' : 'RED-LINE';
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * eta;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${strokeDash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 6px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-mono font-bold" style={{ color }}>{pct}%</span>
          <span className="text-[8px] font-bold tracking-widest text-slate-500 uppercase">η</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }}/>
        <span className="text-[9px] font-bold tracking-[0.15em]" style={{ color }}>{label}</span>
      </div>
    </div>
  );
};

// ─── Score Bar ────────────────────────────────────────────────────────────────

const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const color = value >= 0.75 ? '#10b981' : value >= 0.5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] text-slate-500 font-medium">{label}</span>
        <span className="text-[10px] font-mono font-bold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value * 100}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}60` }}
        />
      </div>
    </div>
  );
};

// ─── Trace JSON Display ───────────────────────────────────────────────────────

const TraceViewer: React.FC<{ trace: JustificationTrace }> = ({ trace }) => {
  const [expanded, setExpanded] = useState(false);
  const json = JSON.stringify(trace, null, 2);
  const preview = JSON.stringify({
    traceId: trace.traceId.substring(0, 12) + '…',
    status: trace.status,
    'η': trace.mathematicalTrace.alignmentHarmonyIndex,
    ontology: trace.formalVerification.ontologyMappingVersion,
    sig: trace.gradientGate.verificationSignature.substring(0, 20) + '…',
  }, null, 2);

  return (
    <div className="rounded-xl bg-black/30 border border-white/8 overflow-hidden">
      <div className="flex items-center justify-between p-2.5 border-b border-white/6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"/>
          <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">JSON-LD TRACE</span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          id="trace-expand-btn"
          className="text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <pre className="text-[9px] font-mono text-slate-400 p-2.5 overflow-auto max-h-72 leading-relaxed">
        {expanded ? json : preview}
      </pre>
    </div>
  );
};

// ─── Constraint Toggle ────────────────────────────────────────────────────────

const ConstraintBadge: React.FC<{
  constraint: LegalConstraint;
  onToggle: () => void;
}> = ({ constraint, onToggle }) => (
  <button
    id={`oracle-cnt-${constraint.id}`}
    onClick={onToggle}
    className={`flex items-center gap-2 w-full p-2 rounded-lg border text-left transition-all duration-200 ${
      constraint.active
        ? 'bg-indigo-600/12 border-indigo-500/40 text-indigo-300'
        : 'bg-white/3 border-white/8 text-slate-500 hover:text-slate-400'
    }`}
  >
    <div className={`w-3 h-3 rounded border flex items-center justify-center shrink-0 transition-all ${
      constraint.active ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'
    }`}>
      {constraint.active && (
        <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
          <polyline points="2,5 4,7 8,3"/>
        </svg>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[10px] font-semibold truncate">{constraint.label}</div>
      <div className="text-[9px] text-slate-600 truncate font-mono">{constraint.ontologyRef}</div>
    </div>
  </button>
);

// ─── Main Pane ────────────────────────────────────────────────────────────────

const JustificationPane: React.FC<JustificationPaneProps> = ({
  latestTrace, constraints, commitments, onToggleConstraint, onClearCommitments,
}) => {
  const [activeTab, setActiveTab] = useState<'oracle' | 'constraints' | 'commitments'>('oracle');

  return (
    <aside
      className="w-80 flex flex-col h-full bg-[#0c0c10] border-l border-white/8 shrink-0"
      style={{ boxShadow: '-4px 0 24px rgba(0,0,0,0.4)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/8 shrink-0">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400">Alignment Oracle</div>
        <div className="text-[9px] text-slate-500 tracking-widest uppercase mt-0.5">Justification & Audit Pane</div>
      </div>

      {/* η Gauge */}
      {latestTrace && <EtaGauge eta={latestTrace.mathematicalTrace.alignmentHarmonyIndex} />}
      {!latestTrace && (
        <div className="flex flex-col items-center gap-2 py-8 text-slate-600">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-[10px] font-medium">Awaiting first directive</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/8 shrink-0">
        {(['oracle', 'constraints', 'commitments'] as const).map(tab => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[9px] font-bold tracking-wider uppercase transition-all ${
              activeTab === tab
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-600 hover:text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* Oracle Tab */}
        {activeTab === 'oracle' && latestTrace && (
          <>
            {/* Scores */}
            <div className="rounded-xl bg-white/3 border border-white/8 p-3 space-y-2.5">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500 block">Alignment Scores</span>
              <ScoreBar label="Accuracy" value={latestTrace.alignmentScore.accuracy} />
              <ScoreBar label="Legal Ontology" value={latestTrace.alignmentScore.legalOntology} />
              <ScoreBar label="Intent Fidelity" value={latestTrace.alignmentScore.intentFidelity} />
              <div className="pt-1 border-t border-white/6">
                <ScoreBar label="Overall Δ" value={latestTrace.alignmentScore.overall} />
              </div>
            </div>

            {/* Gradient Gate */}
            <div className="rounded-xl bg-white/3 border border-white/8 p-3 space-y-2">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500 block">Gradient Gate</span>
              <div className="space-y-1.5 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">||g||</span>
                  <span className="text-slate-400">{latestTrace.gradientGate.rawGradientMagnitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">||Δθ||</span>
                  <span className="text-emerald-400">{latestTrace.gradientGate.projectedGradientMagnitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Clip Applied</span>
                  <span className={latestTrace.gradientGate.normClippingApplied !== 'Not Required' ? 'text-amber-400' : 'text-slate-500'}>
                    {latestTrace.gradientGate.normClippingApplied}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Aux Losses</span>
                  <span className="text-emerald-400">DETACHED</span>
                </div>
              </div>
            </div>

            {/* Formal Verification */}
            <div className="rounded-xl bg-white/3 border border-white/8 p-3 space-y-2">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500 block">Formal Verification</span>
              <div className="space-y-1.5 font-mono text-[9px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Invariant Check</span>
                  <span className={
                    latestTrace.formalVerification.invariantCheck === 'passed' ? 'text-emerald-400' :
                    latestTrace.formalVerification.invariantCheck === 'warning' ? 'text-amber-400' : 'text-red-400'
                  }>
                    {latestTrace.formalVerification.invariantCheck.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Orthog. Error</span>
                  <span className="text-slate-400">{latestTrace.formalVerification.subspaceOrthogonalError}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Ontology</span>
                  <span className="text-indigo-400">{latestTrace.formalVerification.ontologyMappingVersion}</span>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="rounded-xl bg-black/30 border border-white/8 p-2.5">
              <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 block mb-1.5">EdDSA Signature</span>
              <div className="font-mono text-[8px] text-indigo-400 break-all leading-relaxed">
                {latestTrace.gradientGate.verificationSignature}
              </div>
            </div>

            {/* JSON Trace */}
            <TraceViewer trace={latestTrace} />
          </>
        )}

        {activeTab === 'oracle' && !latestTrace && (
          <div className="text-center text-slate-600 text-[10px] py-8">
            No trace generated yet.<br/>Submit a directive to see Oracle output.
          </div>
        )}

        {/* Constraints Tab */}
        {activeTab === 'constraints' && (
          <div className="space-y-2">
            <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500 px-1">
              Active Legal Constraints
            </div>
            {constraints.map(c => (
              <ConstraintBadge key={c.id} constraint={c} onToggle={() => onToggleConstraint(c.id)} />
            ))}
            <div className="pt-2 text-[9px] text-slate-600 text-center">
              Toggle to pin/unpin constraints to S_Law projection
            </div>
          </div>
        )}

        {/* Commitments Tab */}
        {activeTab === 'commitments' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[9px] font-bold tracking-[0.18em] uppercase text-slate-500">
                Session Commitments
              </span>
              {commitments.length > 0 && (
                <button
                  id="clear-commitments-btn"
                  onClick={onClearCommitments}
                  className="text-[9px] text-red-400/70 hover:text-red-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            {commitments.length === 0 && (
              <div className="text-center text-slate-600 text-[10px] py-8">
                No commitments recorded yet.<br/>They form as you interact.
              </div>
            )}
            {commitments.map((com, i) => (
              <div key={com.id} className="p-2.5 rounded-xl bg-white/3 border border-white/8 space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-[8px] font-bold text-indigo-500 mt-0.5 shrink-0">#{i + 1}</span>
                  <span className="text-[10px] text-slate-300 leading-relaxed">{com.text}</span>
                </div>
                <div className="text-[8px] text-slate-600 font-mono pl-4">
                  {new Date(com.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/8 shrink-0">
        <div className="text-[8px] font-mono text-slate-700 text-center tracking-wider">
          S_LAW PROJECTION ACTIVE · ΔΘALIGNED ONLY<br/>
          <span className="text-indigo-800">JSON-LD · EdDSA · AkomaNtoso_3.0</span>
        </div>
      </div>
    </aside>
  );
};

export default JustificationPane;
