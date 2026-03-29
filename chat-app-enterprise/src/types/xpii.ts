export type AlignmentStatus = 'aligned' | 'warning' | 'escalated' | 'frozen';

export interface AlignmentScore {
  accuracy: number;
  legalOntology: number;
  intentFidelity: number;
  overall: number;
}

export interface GradientGateResult {
  rawGradientMagnitude: number;
  projectedGradientMagnitude: number;
  normClippingApplied: string;
  verificationSignature: string;
}

export interface FormalVerification {
  ontologyMappingVersion: string;
  invariantCheck: 'passed' | 'warning' | 'failed';
  subspaceOrthogonalError: string;
}

export interface MathematicalTrace {
  alignmentHarmonyIndex: number;
}

export interface JustificationTrace {
  traceId: string;
  status: 'committed' | 'escalated' | 'frozen';
  alignmentScore: AlignmentScore;
  gradientGate: GradientGateResult;
  formalVerification: FormalVerification;
  mathematicalTrace: MathematicalTrace;
}

export interface Message {
  id: string;
  role: 'director' | 'system' | 'nexus' | 'escalation';
  content: string;
  timestamp: string;
  sessionId: string;
  alignmentStatus?: AlignmentStatus;
  trace?: JustificationTrace;
  eta?: number;
}

export interface Session {
  id: string;
  name: string;
  createdAt: string;
  intentChainHash: string;
  messageCount: number;
  averageEta: number;
  status: 'active' | 'frozen';
  jurisdiction: string;
}

export interface Commitment {
  id: string;
  text: string;
  timestamp: string;
  sessionId: string;
}

export interface LegalConstraint {
  id: string;
  label: string;
  ontologyRef: string;
  active: boolean;
}

export interface IntentChainEntry {
  utterance: string;
  timestamp: string;
  vectorRef: string;
  commitments: string[];
}
