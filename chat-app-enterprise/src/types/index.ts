export type MessageRole = 'director' | 'system' | 'assistant';

export type AlignmentStatus = 'aligned' | 'warning' | 'escalated' | 'frozen';

export interface AlignmentScore {
  accuracy: number;
  legalOntology: number;
  intentFidelity: number;
  composite: number;
}

export interface GradientGateResult {
  rawGradientMagnitude: number;
  projectedGradientMagnitude: number;
  harmonyIndex: number;
  constraintSetId: string;
  safeNormClipping: {
    applied: boolean;
    radiusEpsilon: number;
    reductionRatio: number;
  };
  invariantCheck: 'passed' | 'failed';
  subspaceOrthogonalError: string;
}

export interface JustificationTrace {
  traceId: string;
  timestamp: string;
  sessionId: string;
  intentChainRef: string;
  patternState: {
    motive: string;
    constraints: string[];
    commitments: string[];
  };
  alignmentScore: AlignmentScore;
  gradientGate: GradientGateResult;
  ontologyMapping: string;
  status: 'committed' | 'escalated' | 'frozen';
  signature: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  alignmentScore?: AlignmentScore;
  traceId?: string;
  trace?: JustificationTrace;
  isEscalation?: boolean;
}

export interface Constraint {
  id: string;
  label: string;
  value: string;
  source: string;
  active: boolean;
  pinnedAt?: Date;
}

export interface Commitment {
  id: string;
  text: string;
  establishedAt: Date;
  sourceMessageId: string;
  constraintIds: string[];
}

export interface IntentChainEntry {
  messageId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  alignmentScore?: AlignmentScore;
  commitments: string[];
}

export interface Session {
  id: string;
  name: string;
  createdAt: Date;
  intentChain: IntentChainEntry[];
  constraints: Constraint[];
  commitments: Commitment[];
  frozen: boolean;
  frozenReason?: string;
  averageEta: number;
  totalTraces: number;
}

export interface Director {
  id: string;
  name: string;
  role: 'director' | 'auditor' | 'admin';
}

export type TabId = 'chat' | 'trace' | 'metrics';

export interface LegalTerm {
  term: string;
  category: string;
  weight: number;
  ontologyRef: string;
}

export interface LegalConstraint {
  id: string;
  label: string;
  description: string;
  terms: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}
