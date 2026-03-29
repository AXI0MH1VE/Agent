// ============================================================
// XPII MODEL X1 — NEXUS PLATFORM
// Main App Orchestrator: State Management, RICA Engine, 
// Session Control, Alignment Oracle Integration
// ============================================================
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import ChatMain from './components/ChatMain';
import InputArea from './components/InputArea';
import JustificationPane from './components/JustificationPane';
import AuditLogModal from './components/AuditLogModal';

import {
  computeAlignmentDelta,
  generateProposerResponse,
  hashIntentChain,
  ALIGNMENT_THRESHOLD,
  RED_LINE_THRESHOLD,
} from './engine/alignmentEngine';

import type {
  Message,
  Session,
  Commitment,
  LegalConstraint,
  IntentChainEntry,
  JustificationTrace,
  AlignmentStatus,
} from './types';

// ─── Default Legal Constraints (S_Law Invariants) ────────────────────────────

const DEFAULT_CONSTRAINTS: LegalConstraint[] = [
  { id: 'c1', label: 'Rule_12b6',  ontologyRef: 'LR.FRCP.12.b.6',      active: true  },
  { id: 'c2', label: 'Rule_403',   ontologyRef: 'LR.FRE.403',           active: true  },
  { id: 'c3', label: 'Rule_26',    ontologyRef: 'LR.FRCP.26',           active: false },
  { id: 'c4', label: 'LR_7-1',     ontologyRef: 'ND.Cal.LR.7-1',        active: true  },
  { id: 'c5', label: 'LR_7-3',     ontologyRef: 'ND.Cal.LR.7-3',        active: false },
  { id: 'c6', label: 'Rule_56',    ontologyRef: 'LR.FRCP.56',           active: false },
  { id: 'c7', label: 'Habeas',     ontologyRef: 'LR.28.USC.2241',       active: false },
  { id: 'c8', label: 'Due_Process', ontologyRef: 'US.Const.Amend.XIV.1', active: false },
];

// ─── Session Factory ──────────────────────────────────────────────────────────

function createSession(name: string, jurisdiction: string): Session {
  return {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    intentChainHash: 'IC_EMPTY',
    messageCount: 0,
    averageEta: 0,
    status: 'active',
    jurisdiction,
  };
}

// ─── System Init Message ──────────────────────────────────────────────────────

function createSystemInitMessage(sessionId: string): Message {
  return {
    id: uuidv4(),
    role: 'system',
    sessionId,
    timestamp: new Date().toISOString(),
    content: `NEXUS MODEL X1 ONLINE — Alignment Oracle Initialized

The RICA (Recursive Intent-Chain Alignment) engine is active. All
operational deltas are projected onto the Legal Constraint Subspace
S_Law and bounded within the Safe Norm Ball B_safe(ε=0.05).

Active ontology: AkomaNtoso_3.0 / LegalXML-v2.0
Gradient gating: ENABLED
Auxiliary losses: DETACHED
Signing authority: EdDSA_X1

You are operating as Director. Your intent chain will compound
across this session. Constraints are enforced by the Alignment Oracle.
Justification traces are generated and signed for each output.

Transmit your first directive to begin.`,
  };
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function App() {
  // ─ Sessions ─
  const [sessions, setSessions] = useState<Session[]>(() => {
    const s = createSession('Session Alpha', 'ND Cal — FRCP');
    return [s];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0].id);

  // ─ Messages (keyed by sessionId) ─
  const [messagesBySession, setMessagesBySession] = useState<Record<string, Message[]>>(() => {
    const sid = sessions[0].id;
    return { [sid]: [createSystemInitMessage(sid)] };
  });

  // ─ Intent Chains (keyed by sessionId) ─
  const [intentChainsBySession, setIntentChainsBySession] = useState<Record<string, IntentChainEntry[]>>({
    [sessions[0].id]: [],
  });

  // ─ Commitments (keyed by sessionId) ─
  const [commitmentsBySession, setCommitmentsBySession] = useState<Record<string, Commitment[]>>({
    [sessions[0].id]: [],
  });

  // ─ Constraints (shared across sessions, Director-level) ─
  const [constraints, setConstraints] = useState<LegalConstraint[]>(DEFAULT_CONSTRAINTS);

  // ─ Latest Trace (for Justification Pane) ─
  const [latestTrace, setLatestTrace] = useState<JustificationTrace | null>(null);

  // ─ System State ─
  const [systemStatus, setSystemStatus] = useState<'nominal' | 'warning' | 'frozen'>('nominal');
  const [processingIntent, setProcessingIntent] = useState(false);

  // ─ Audit Modal ─
  const [showAuditLog, setShowAuditLog] = useState(false);

  // ─ Derived Values ─
  const activeMessages = messagesBySession[activeSessionId] || [];
  const activeIntentChain = intentChainsBySession[activeSessionId] || [];
  const activeCommitments = commitmentsBySession[activeSessionId] || [];
  const activeSession = sessions.find(s => s.id === activeSessionId)!;

  const totalTraces = Object.values(messagesBySession)
    .flat()
    .filter(m => m.trace).length;

  const allEtas = Object.values(messagesBySession)
    .flat()
    .filter(m => m.eta !== undefined)
    .map(m => m.eta!);
  const averageEta = allEtas.length > 0
    ? allEtas.reduce((a, b) => a + b, 0) / allEtas.length
    : 0;

  // ─ New Session ─
  const handleNewSession = useCallback(() => {
    const names = ['Session Beta', 'Session Gamma', 'Session Delta', 'Protocol Review', 'Evidence Analysis', 'Motion Drafting'];
    const jurisdictions = ['ND Cal — FRCP', '9th Circuit', 'SD NY — FRCP', 'SDCA — FRCP'];
    const name = names[Math.floor(Math.random() * names.length)] + ' ' + Date.now().toString().slice(-4);
    const jur  = jurisdictions[Math.floor(Math.random() * jurisdictions.length)];
    const newSession = createSession(name, jur);
    setSessions(prev => [newSession, ...prev]);
    setMessagesBySession(prev => ({
      ...prev,
      [newSession.id]: [createSystemInitMessage(newSession.id)],
    }));
    setIntentChainsBySession(prev => ({ ...prev, [newSession.id]: [] }));
    setCommitmentsBySession(prev => ({ ...prev, [newSession.id]: [] }));
    setActiveSessionId(newSession.id);
    setLatestTrace(null);
    setSystemStatus('nominal');
  }, []);

  // ─ Select Session ─
  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    // Restore the latest trace for that session
    const msgs = messagesBySession[id] || [];
    const lastTraced = [...msgs].reverse().find(m => m.trace);
    setLatestTrace(lastTraced?.trace || null);
    // Restore system status
    const session = sessions.find(s => s.id === id);
    if (session?.status === 'frozen') {
      setSystemStatus('frozen');
    } else {
      setSystemStatus('nominal');
    }
  }, [messagesBySession, sessions]);

  // ─ Toggle Constraint ─
  const handleToggleConstraint = useCallback((id: string) => {
    setConstraints(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  }, []);

  // ─ Clear Commitments ─
  const handleClearCommitments = useCallback(() => {
    setCommitmentsBySession(prev => ({ ...prev, [activeSessionId]: [] }));
  }, [activeSessionId]);

  // ─ Submit Intent (Core RICA Loop) ─
  const handleSubmitIntent = useCallback(async (intent: string) => {
    if (processingIntent || systemStatus === 'frozen') return;
    setProcessingIntent(true);

    const sessionId = activeSessionId;
    const now = new Date().toISOString();

    // 1. Add Director message to chain
    const directorMsg: Message = {
      id: uuidv4(),
      role: 'director',
      content: intent,
      timestamp: now,
      sessionId,
    };

    setMessagesBySession(prev => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), directorMsg],
    }));

    // 2. Update Intent Chain (Compound h_t)
    const newEntry: IntentChainEntry = {
      utterance:   intent,
      timestamp:   now,
      vectorRef:   'VEC_' + Math.abs(intent.split('').reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0)).toString(16).toUpperCase(),
      commitments: activeCommitments.map(c => c.text),
    };
    const updatedChain = [...activeIntentChain, newEntry];
    setIntentChainsBySession(prev => ({ ...prev, [sessionId]: updatedChain }));

    // 3. Simulate processing delay (Oracle call + Proposer)
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));

    // 4. Generate candidate response (Proposer Service)
    const proposedResponse = generateProposerResponse(intent);

    // 5. Run Alignment Oracle + Gradient Gate
    const currentCommitmentTexts = activeCommitments.map(c => c.text);
    const alignmentResult = computeAlignmentDelta(
      intent,
      proposedResponse,
      constraints,
      currentCommitmentTexts,
      updatedChain
    );

    setLatestTrace(alignmentResult.trace);

    let nexusStatus: AlignmentStatus = alignmentResult.status;
    let newSystemStatus: 'nominal' | 'warning' | 'frozen' = 'nominal';

    // 6a. Red-Line Escalation
    if (alignmentResult.status === 'escalated') {
      newSystemStatus = 'frozen';
      setSystemStatus('frozen');

      const escalationMsg: Message = {
        id: uuidv4(),
        role: 'escalation',
        sessionId,
        timestamp: new Date().toISOString(),
        content: `RED-LINE ESCALATION: ${alignmentResult.escalationReason || 'Alignment failure detected.'}\n\nThe Alignment Delta (Δθ) is orthogonal to the Legal Constraint Subspace S_Law. η=${(alignmentResult.eta * 100).toFixed(1)}% < RED_LINE_THRESHOLD(${(RED_LINE_THRESHOLD * 100).toFixed(0)}%).\n\nCircuit breaker engaged. Weight updates frozen. Session handoff to human/Director required before continuing.`,
        trace: alignmentResult.trace,
        alignmentStatus: 'escalated',
        eta: alignmentResult.eta,
      };

      setMessagesBySession(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), escalationMsg],
      }));

      // Mark session as frozen
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, status: 'frozen' } : s
      ));

    } else {
      // 6b. Aligned / Warning — commit response
      if (alignmentResult.eta >= ALIGNMENT_THRESHOLD) {
        newSystemStatus = 'nominal';
      } else {
        newSystemStatus = 'warning';
      }
      setSystemStatus(newSystemStatus);

      const nexusMsg: Message = {
        id: uuidv4(),
        role: 'nexus',
        content: alignmentResult.response,
        timestamp: new Date().toISOString(),
        sessionId,
        trace: alignmentResult.trace,
        alignmentStatus: nexusStatus,
        eta: alignmentResult.eta,
      };

      setMessagesBySession(prev => ({
        ...prev,
        [sessionId]: [...(prev[sessionId] || []), nexusMsg],
      }));

      // 7. Extract & Lock Commitments from response
      const commitmentPatterns = [
        /jurisdiction is ([^.]+)/i,
        /under (Rule \w+)/i,
        /applies (?:the )?([\w\s]+ standard)/i,
        /pursuant to ([^.]+)/i,
      ];
      const newCommitments: Commitment[] = [];
      commitmentPatterns.forEach(pattern => {
        const match = alignmentResult.response.match(pattern);
        if (match && match[1]) {
          newCommitments.push({
            id:        uuidv4(),
            text:      `Committed: ${match[1].trim()}`,
            timestamp: new Date().toISOString(),
            sessionId,
          });
        }
      });
      if (newCommitments.length > 0) {
        setCommitmentsBySession(prev => ({
          ...prev,
          [sessionId]: [...(prev[sessionId] || []), ...newCommitments],
        }));
      }

      // 8. Update session metadata
      const sessionMessages = [...(messagesBySession[sessionId] || []), nexusMsg].filter(m => m.trace);
      const sessionEtas = sessionMessages.map(m => m.eta || 0);
      const sessionAvgEta = sessionEtas.length > 0
        ? sessionEtas.reduce((a, b) => a + b, 0) / sessionEtas.length
        : alignmentResult.eta;

      setSessions(prev => prev.map(s =>
        s.id === sessionId
          ? {
              ...s,
              messageCount:     (s.messageCount + 2),
              averageEta:       sessionAvgEta,
              intentChainHash:  hashIntentChain(updatedChain),
              status:           'active',
            }
          : s
      ));
    }

    setProcessingIntent(false);
  }, [
    processingIntent, systemStatus, activeSessionId,
    activeIntentChain, activeCommitments, constraints, messagesBySession,
  ]);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        systemStatus={systemStatus}
        averageEta={averageEta}
        totalTraces={totalTraces}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatMain
          messages={activeMessages}
          sessionName={activeSession?.name || 'Session'}
          jurisdiction={activeSession?.jurisdiction || 'ND Cal'}
          systemStatus={systemStatus}
          onOpenAuditLog={() => setShowAuditLog(true)}
        />
        <InputArea
          onSubmit={handleSubmitIntent}
          disabled={processingIntent}
          frozen={systemStatus === 'frozen'}
          activeConstraints={constraints}
          intentChainLength={activeIntentChain.length}
        />
      </div>

      <JustificationPane
        latestTrace={latestTrace}
        constraints={constraints}
        commitments={activeCommitments}
        onToggleConstraint={handleToggleConstraint}
        onClearCommitments={handleClearCommitments}
      />

      {showAuditLog && (
        <AuditLogModal
          messages={activeMessages}
          sessionName={activeSession?.name || 'Session'}
          onClose={() => setShowAuditLog(false)}
        />
      )}
    </Layout>
  );
}

export default App;
