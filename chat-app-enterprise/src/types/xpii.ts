// ============================================================
// XPII MODEL X1 — TYPE DEFINITIONS
// Recursive Intent-Chain Alignment (RICA) Framework
// ============================================================

export type MessageRole = 'director' | 'nexus' | 'system' | 'escalation';

export type AlignmentStatus = 'aligned' | 'warning' | 'escalated' | 'frozen';

export interface LegalConstraint {
  id: string;
  label: string;
  ontologyRef: string;
  active: boolean;
}

export interface Commitment {
  id: string;
  text: string;
  timestamp: string;
  sessionId: string;
  constraintId?: string;
}

export interface GradientGate {
  auxiliaryLossesDetached: boolean;
  normClippingApplied: string;
  projectionEfficiency: number; // η (eta) — 0.0 to 1.0
  rawGradientMagnitude: number;
  projectedGradientMagnitude: number;
  verificationSignature: string;
}

export interface AlignmentScore {
  accuracy: number;
  legalOntology: number;
  intentFidelity: number;
  overall: number;
}

export interface PatternState {
  motive: string;
  constraints: string[];
  commitments: string[];
}

export interface MathematicalTrace {
  rawGradientMagnitude: string;
  projectedGradientMagnitude: string;
  alignmentHarmonyIndex: number;
  constraintSetId: string;
  safeNormBallClipping: {
    applied: boolean;
    radiusEpsilon: number;
    reductionRatio: number;
  };
}

export interface FormalVerification {
  invariantCheck: 'passed' | 'failed' | 'warning';
  subspaceOrthogonalError: string;
  ontologyMappingVersion: string;
}

export interface JustificationTrace {
  '@context': string;
  traceId: string;
  timestamp: string;
  intentChainRef: string;
  patternState: PatternState;
  alignmentScore: AlignmentScore;
  gradientGate: GradientGate;
  mathematicalTrace: MathematicalTrace;
  formalVerification: FormalVerification;
  status: AlignmentStatus;
  escalationReason?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  sessionId: string;
  trace?: JustificationTrace;
  alignmentStatus?: AlignmentStatus;
  eta?: number;
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  intentChainHash: string;
  messageCount: number;
  averageEta: number;
  status: 'active' | 'frozen' | 'archived';
  jurisdiction?: string;
}

export interface IntentChainEntry {
  utterance: string;
  timestamp: string;
  vectorRef: string;
  commitments: string[];
}

export interface NexusState {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Message[];
  intentChain: IntentChainEntry[];
  commitments: Commitment[];
  activeConstraints: LegalConstraint[];
  systemStatus: 'nominal' | 'warning' | 'frozen';
  averageEta: number;
  totalTraces: number;
}
