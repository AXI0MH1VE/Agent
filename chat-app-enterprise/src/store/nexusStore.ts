import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  Session,
  Message,
  Constraint,
  Commitment,
  IntentChainEntry,
  AlignmentStatus,
  Director,
  TabId,
} from '../types';
import { generateJustificationTrace } from '../lib/alignmentEngine';
import { LEGAL_CONSTRAINTS } from '../lib/legalOntology';

interface NexusState {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Message[];
  frozen: boolean;
  frozenReason: string | null;
  director: Director;
  activeTab: TabId;
  selectedTraceId: string | null;

  // Actions
  createSession: (name?: string) => void;
  selectSession: (sessionId: string) => void;
  sendMessage: (content: string) => void;
  toggleConstraint: (constraintId: string) => void;
  pinConstraint: (constraintId: string) => void;
  setActiveTab: (tab: TabId) => void;
  setSelectedTrace: (traceId: string | null) => void;
  unfreeze: () => void;
  getActiveSession: () => Session | null;
  getAlignmentStatus: () => AlignmentStatus;
}

const DIRECTOR: Director = {
  id: 'dir-001',
  name: 'Lex',
  role: 'director',
};

function createInitialSession(): Session {
  return {
    id: uuidv4(),
    name: 'Primary Session',
    createdAt: new Date(),
    intentChain: [],
    constraints: LEGAL_CONSTRAINTS.slice(0, 3).map(c => ({
      id: c.id,
      label: c.label,
      value: c.description,
      source: 'akoma-ntoso',
      active: true,
    })),
    commitments: [],
    frozen: false,
    averageEta: 0,
    totalTraces: 0,
  };
}

function generateProposerResponse(userInput: string, constraints: Constraint[]): string {
  const activeConstraints = constraints.filter(c => c.active);
  const constraintLabels = activeConstraints.map(c => c.label);

  const responses = [
    `Based on the intent chain analysis and active constraints (${constraintLabels.join(', ')}), I have prepared a structured legal response. The analysis considers the compounding user intent and maps it against the Akoma Ntoso ontology standards. The response adheres to the established jurisdictional framework and statutory requirements for motion filing procedures.`,
    `The alignment oracle has validated this response against ${activeConstraints.length} active constraint${activeConstraints.length !== 1 ? 's' : ''}. The legal subspace projection confirms adherence to due process requirements and statutory compliance standards. All precedent references have been verified against the knowledge graph.`,
    `After recursive intent-chain analysis, this draft maintains compliance with the active legal invariants. The pattern state shows high coherence with the director's compounding intent trajectory. The response structure follows Akoma Ntoso document standards and satisfies the jurisdictional requirements for this filing type.`,
    `The gradient gating middleware has confirmed this response's alignment with the constraint manifold. The intent fidelity score indicates strong adherence to the evolving directive chain. All statutory citations have been cross-referenced against the legal ontology service for accuracy and current validity.`,
  ];

  const idx = Math.floor(Math.random() * responses.length);
  return responses[idx];
}

function extractCommitments(content: string): string[] {
  const commitments: string[] = [];
  const patterns = [
    /jurisdiction is ([^.,]+)/gi,
    /the ([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+) applies/g,
    /filing deadline:?\s*([^.,]+)/gi,
    /the applicable rule is ([^.,]+)/gi,
  ];

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        commitments.push(match[1].trim());
      }
    }
  }

  return commitments;
}

export const useNexusStore = create<NexusState>((set, get) => {
  const initialSession = createInitialSession();

  const systemMessage: Message = {
    id: uuidv4(),
    role: 'system',
    content: `XPII Model X1 Nexus Platform initialized. Director "${DIRECTOR.name}" authenticated. Alignment Oracle connected. Legal Ontology Service active (Akoma Ntoso v3.0). Gradient Gate middleware online. Current constraint set: ${initialSession.constraints.filter(c => c.active).map(c => c.label).join(', ')}. All parameter updates are constrained to the legally aligned subspace S_Law. Justification traces will be generated for every output.`,
    timestamp: new Date(),
    alignmentScore: {
      accuracy: 1.0,
      legalOntology: 1.0,
      intentFidelity: 1.0,
      composite: 1.0,
    },
  };

  return {
    sessions: [initialSession],
    activeSessionId: initialSession.id,
    messages: [systemMessage],
    frozen: false,
    frozenReason: null,
    director: DIRECTOR,
    activeTab: 'chat',
    selectedTraceId: null,

    createSession: (name) => {
      const session = createInitialSession();
      if (name) session.name = name;
      set(state => ({
        sessions: [...state.sessions, session],
        activeSessionId: session.id,
        messages: [],
        frozen: false,
        frozenReason: null,
      }));
    },

    selectSession: (sessionId) => {
      set({ activeSessionId: sessionId });
    },

    sendMessage: (content) => {
      const state = get();
      if (state.frozen) return;

      const session = state.sessions.find(s => s.id === state.activeSessionId);
      if (!session) return;

      const directorMessage: Message = {
        id: uuidv4(),
        role: 'director',
        content,
        timestamp: new Date(),
      };

      const intentEntry: IntentChainEntry = {
        messageId: directorMessage.id,
        role: 'director',
        content,
        timestamp: new Date(),
        commitments: [],
      };

      // Generate proposer response
      const responseContent = generateProposerResponse(content, session.constraints);
      const trace = generateJustificationTrace(
        responseContent,
        session.constraints,
        session.id,
        intentEntry.messageId,
        session.commitments.map(c => c.text)
      );

      const newCommitments = extractCommitments(responseContent);
      const commitments: Commitment[] = newCommitments.map(text => ({
        id: uuidv4(),
        text,
        establishedAt: new Date(),
        sourceMessageId: directorMessage.id,
        constraintIds: session.constraints.filter(c => c.active).map(c => c.id),
      }));

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        alignmentScore: trace.alignmentScore,
        traceId: trace.traceId,
        trace,
        isEscalation: trace.status === 'escalated',
      };

      const allMessages = [...state.messages, directorMessage, assistantMessage];
      const updatedSession = {
        ...session,
        intentChain: [
          ...session.intentChain,
          intentEntry,
          {
            messageId: assistantMessage.id,
            role: 'assistant' as const,
            content: responseContent,
            timestamp: new Date(),
            alignmentScore: trace.alignmentScore,
            commitments: newCommitments,
          },
        ],
        commitments: [...session.commitments, ...commitments],
        totalTraces: session.totalTraces + 1,
        averageEta:
          (session.averageEta * session.totalTraces + trace.alignmentScore.composite) /
          (session.totalTraces + 1),
      };

      const shouldFreeze = trace.alignmentScore.composite < 0.3;

      set({
        messages: allMessages,
        sessions: state.sessions.map(s =>
          s.id === session.id ? updatedSession : s
        ),
        frozen: shouldFreeze,
        frozenReason: shouldFreeze
          ? `Red-Line Escalation: Alignment score ${trace.alignmentScore.composite.toFixed(3)} below threshold. Weight update frozen. Routing to human oversight.`
          : null,
      });
    },

    toggleConstraint: (constraintId) => {
      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === state.activeSessionId
            ? {
                ...s,
                constraints: s.constraints.map(c =>
                  c.id === constraintId ? { ...c, active: !c.active } : c
                ),
              }
            : s
        ),
      }));
    },

    pinConstraint: (constraintId) => {
      set(state => ({
        sessions: state.sessions.map(s =>
          s.id === state.activeSessionId
            ? {
                ...s,
                constraints: s.constraints.map(c =>
                  c.id === constraintId
                    ? { ...c, pinnedAt: new Date(), active: true }
                    : c
                ),
              }
            : s
        ),
      }));
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setSelectedTrace: (traceId) => set({ selectedTraceId: traceId }),

    unfreeze: () => set({ frozen: false, frozenReason: null }),

    getActiveSession: () => {
      const state = get();
      return state.sessions.find(s => s.id === state.activeSessionId) || null;
    },

    getAlignmentStatus: () => {
      const state = get();
      if (state.frozen) return 'frozen' as AlignmentStatus;
      const lastMsg = state.messages[state.messages.length - 1];
      if (!lastMsg?.alignmentScore) return 'aligned' as AlignmentStatus;
      const eta = lastMsg.alignmentScore.composite;
      if (eta > 0.7) return 'aligned' as AlignmentStatus;
      if (eta > 0.4) return 'warning' as AlignmentStatus;
      return 'escalated' as AlignmentStatus;
    },
  };
});
