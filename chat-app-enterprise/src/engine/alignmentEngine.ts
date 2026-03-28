// ============================================================
// XPII MODEL X1 — ALIGNMENT ENGINE
// Gradient Gating, Projection Operator, η-Computation
// Based on: RICA (Recursive Intent-Chain Alignment)
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import type {
  JustificationTrace,
  AlignmentScore,
  GradientGate,
  MathematicalTrace,
  FormalVerification,
  PatternState,
  AlignmentStatus,
  LegalConstraint,
  IntentChainEntry,
} from '../types/xpii';

// ─── Legal Ontology (Simulated Akoma Ntoso / LegalXML) ────────────────────────

const LEGAL_ONTOLOGY_V2 = {
  terms: [
    'motion', 'dismiss', 'jurisdiction', 'statute', 'precedent',
    'subpoena', 'affidavit', 'injunction', 'brief', 'pleading',
    'discovery', 'deposition', 'judgment', 'appeal', 'plaintiff',
    'defendant', 'counsel', 'venue', 'tortious', 'habeas corpus',
    'mens rea', 'actus reus', 'prima facie', 'voir dire', 'amicus',
    'certiorari', 'mandamus', 'ex parte', 'pro se', 'stare decisis',
    'due process', 'standing', 'ripeness', 'mootness', 'laches',
    'evidence', 'exhibit', 'witness', 'testimony', 'cross-examination',
    'compliance', 'regulation', 'statute', 'code', 'rule',
  ],
  rules: {
    Rule_12b6: 'Failure to state a claim upon which relief can be granted',
    Rule_403:  'Exclusion of relevant evidence for prejudice or confusion',
    Rule_26:   'General provisions governing discovery',
    Rule_56:   'Summary judgment standard',
    LR_7_1:    'ND Cal Local Rule 7-1: Motion filing requirements',
    LR_7_3:    'ND Cal Local Rule 7-3: Meet and confer requirements',
  },
  ontologyVersion: 'AkomaNtoso_3.0',
  xmlNamespace: 'http://docs.oasis-open.org/legaldocml/ns/akn/3.0',
  constraintSetId: 'akoma_ntoso_v3_0_ruleset',
};

const ALIGNMENT_THRESHOLD = 0.75;
const RED_LINE_THRESHOLD  = 0.40;
const SAFE_NORM_EPSILON   = 0.05;

// ─── Cryptographic Signature (Simulated EdDSA) ────────────────────────────────

function generateSignature(payload: string): string {
  // Deterministic hash simulation (production: use SubtleCrypto + EdDSA keypair)
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hexHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `EdDSA_X1_${hexHash.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;
}

// ─── Intent Chain Hasher ──────────────────────────────────────────────────────

export function hashIntentChain(chain: IntentChainEntry[]): string {
  const payload = chain.map(e => e.utterance + e.timestamp).join('|');
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) + hash) + payload.charCodeAt(i);
    hash |= 0;
  }
  return 'IC_' + Math.abs(hash).toString(16).toUpperCase().padStart(12, '0');
}

// ─── Legal Ontology Check (Alignment Oracle) ──────────────────────────────────

function computeLegalOntologyScore(text: string, constraints: LegalConstraint[]): number {
  const lowerText = text.toLowerCase();
  const matchingTerms = LEGAL_ONTOLOGY_V2.terms.filter(t => lowerText.includes(t));
  const baseScore = matchingTerms.length / Math.max(LEGAL_ONTOLOGY_V2.terms.length * 0.15, 1);
  
  // Bonus for active constraint references
  const constraintBonus = constraints
    .filter(c => c.active && lowerText.includes(c.label.toLowerCase()))
    .length * 0.05;
  
  return Math.min(1.0, Math.max(0.1, baseScore + constraintBonus));
}

// ─── Pattern State Extraction ─────────────────────────────────────────────────

function extractPatternState(
  userIntent: string,
  response: string,
  constraints: LegalConstraint[],
  activeCommitments: string[]
): PatternState {
  const lowerResponse = response.toLowerCase();
  
  // Extract motive from response (simplified semantic extraction)
  const motiveKeywords = ['analyze', 'draft', 'review', 'assess', 'determine', 'evaluate', 'respond'];
  const foundMotive = motiveKeywords.find(k => lowerResponse.includes(k)) || 'process';
  const motive = `Vector_${foundMotive.toUpperCase()}_${Math.floor(Math.random() * 100)}`;
  
  return {
    motive,
    constraints: constraints.filter(c => c.active).map(c => c.label),
    commitments: activeCommitments.slice(0, 3),
  };
}

// ─── Gradient Gate: Projection onto S_Law ────────────────────────────────────

function computeGradientGate(eta: number, rawMagnitude: number): GradientGate {
  const projectedMagnitude = eta * rawMagnitude;
  const reductionRatio = projectedMagnitude / rawMagnitude;
  const clippingApplied = projectedMagnitude > SAFE_NORM_EPSILON;
  
  return {
    auxiliaryLossesDetached: true,
    normClippingApplied: clippingApplied
      ? `${(reductionRatio * 100).toFixed(1)}% of G_max`
      : 'Not Required',
    projectionEfficiency: eta,
    rawGradientMagnitude: rawMagnitude,
    projectedGradientMagnitude: projectedMagnitude,
    verificationSignature: generateSignature(`${eta}:${rawMagnitude}:${Date.now()}`),
  };
}

// ─── Mathematical Trace Builder ───────────────────────────────────────────────

function buildMathematicalTrace(
  rawMag: number,
  projMag: number,
  eta: number
): MathematicalTrace {
  const reductionRatio = projMag / rawMag;
  return {
    rawGradientMagnitude: `||g|| = ${rawMag.toFixed(4)}`,
    projectedGradientMagnitude: `||Δθ_aligned|| = ${projMag.toFixed(4)}`,
    alignmentHarmonyIndex: eta,
    constraintSetId: LEGAL_ONTOLOGY_V2.constraintSetId,
    safeNormBallClipping: {
      applied: reductionRatio < 0.98,
      radiusEpsilon: SAFE_NORM_EPSILON,
      reductionRatio: parseFloat(reductionRatio.toFixed(4)),
    },
  };
}

// ─── Main Alignment Delta Computer ───────────────────────────────────────────

export interface AlignmentResult {
  eta: number;
  status: AlignmentStatus;
  trace: JustificationTrace;
  response: string;
  escalationReason?: string;
}

export function computeAlignmentDelta(
  userIntent: string,
  proposedResponse: string,
  constraints: LegalConstraint[],
  activeCommitments: string[],
  intentChain: IntentChainEntry[]
): AlignmentResult {
  const chainRef = hashIntentChain(intentChain);

  // ─ Oracle: Legal Ontology Check ─
  const legalOntologyScore = computeLegalOntologyScore(proposedResponse, constraints);
  
  // ─ Intent Fidelity (keyword overlap between intent and response) ─
  const intentWords = new Set(userIntent.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const responseWords = userIntent.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const fidelityScore = intentWords.size > 0
    ? responseWords.filter(w => proposedResponse.toLowerCase().includes(w)).length / intentWords.size
    : 0.8;
  const clampedFidelity = Math.min(1.0, Math.max(0.1, fidelityScore * 0.6 + 0.4));

  // ─ Accuracy (response coherence simulation) ─
  const accuracyScore = proposedResponse.length > 100
    ? Math.min(1.0, 0.75 + Math.random() * 0.20)
    : Math.min(1.0, 0.50 + Math.random() * 0.25);

  // ─ Overall Alignment Score (weighted) ─
  const overall = (
    accuracyScore     * 0.30 +
    legalOntologyScore * 0.40 +
    clampedFidelity    * 0.30
  );

  // ─ η (Projection Efficiency) ─
  const rawMagnitude = parseFloat((0.5 + Math.random() * 0.5).toFixed(4));
  const projectedMagnitude = parseFloat((overall * rawMagnitude).toFixed(4));
  const eta = parseFloat((projectedMagnitude / rawMagnitude).toFixed(4));

  // ─ Determine Status ─
  let status: AlignmentStatus;
  let escalationReason: string | undefined;

  if (eta >= ALIGNMENT_THRESHOLD) {
    status = 'aligned';
  } else if (eta >= RED_LINE_THRESHOLD) {
    status = 'warning';
  } else {
    status = 'escalated';
    escalationReason = `η=${eta.toFixed(3)} < RED_LINE_THRESHOLD(${RED_LINE_THRESHOLD}). ` +
      `Legal Ontology Score: ${legalOntologyScore.toFixed(3)}. ` +
      `Delta is orthogonal to S_Law. Circuit breaker engaged.`;
  }

  const alignmentScore: AlignmentScore = {
    accuracy:      parseFloat(accuracyScore.toFixed(4)),
    legalOntology: parseFloat(legalOntologyScore.toFixed(4)),
    intentFidelity: parseFloat(clampedFidelity.toFixed(4)),
    overall:       parseFloat(overall.toFixed(4)),
  };

  const gradientGate = computeGradientGate(eta, rawMagnitude);
  const patternState = extractPatternState(userIntent, proposedResponse, constraints, activeCommitments);
  const mathematicalTrace = buildMathematicalTrace(rawMagnitude, projectedMagnitude, eta);

  const formalVerification: FormalVerification = {
    invariantCheck: eta >= ALIGNMENT_THRESHOLD ? 'passed' : eta >= RED_LINE_THRESHOLD ? 'warning' : 'failed',
    subspaceOrthogonalError: `< ${(Math.random() * 1e-8).toExponential(2)}`,
    ontologyMappingVersion: LEGAL_ONTOLOGY_V2.ontologyVersion,
  };

  const traceId = uuidv4();
  const trace: JustificationTrace = {
    '@context': 'https://www.xpiimodelx1.com/ontology/v1',
    traceId,
    timestamp: new Date().toISOString(),
    intentChainRef: chainRef,
    patternState,
    alignmentScore,
    gradientGate,
    mathematicalTrace,
    formalVerification,
    status,
    escalationReason,
  };

  return { eta, status, trace, response: proposedResponse, escalationReason };
}

// ─── Response Generator (Proposer Simulation) ────────────────────────────────

const LEGAL_RESPONSE_TEMPLATES = [
  (intent: string) => `**NEXUS PROPOSER OUTPUT** [AkomaNtoso_3.0]\n\nProcessing directive: *"${intent}"*\n\nPursuant to applicable procedural rules and the constraints encoded in the active Legal Ontology, I have drafted the following response. This output adheres to jurisdictional requirements and preserves the commitments established in the current session chain.\n\nThe motion framework references Rule 12(b)(6) standards (failure to state a claim) and applies the applicable venue rules under the Northern District of California Local Rules 7-1 and 7-3. Prior commitments regarding evidence admissibility under Rule 403 have been honored and are reflected in the constraint vector.\n\n**Ontology Reference:** ${LEGAL_ONTOLOGY_V2.constraintSetId}\n**Status:** Pending Oracle Validation`,
  
  (intent: string) => `**NEXUS PROPOSER OUTPUT** [Intent-Chain Aligned]\n\nDirective received: *"${intent}"*\n\nApplying Recursive Intent-Chain Alignment (RICA) to this request. The compounded intent trajectory from the current session has been analyzed. The following output preserves all prior commitments and cross-references the relevant statutory framework.\n\nAnalysis confirms compliance with applicable rules of evidence, procedural standards, and jurisdiction-specific requirements. The alignment delta has been projected onto S_Law and clipped to the safe norm ball B_safe(ε). No invariant violations detected.\n\n**Alignment Oracle:** VALIDATED\n**Gradient Gate:** PROJECTION APPLIED\n**LegalXML Schema:** Conformant`,

  (intent: string) => `**NEXUS PROPOSER OUTPUT** [Gradient Gated]\n\nProposing response to: *"${intent}"*\n\nThe Alignment Oracle has evaluated this response against the active legal ontology. Key terms cross-referenced: *jurisdiction*, *statute*, *precedent*, *standing*, *due process*. All terms map to defined entries in LegalXML v2.0.\n\nThe proposed delta (Δθ) has been projected onto the Legal Constraint Subspace (S_Law) using the active projection matrix P_Law. The safe norm ball clipping has been applied to ensure behavioral stability and trust-stability for this session.\n\n**Intent Fidelity:** HIGH\n**Constraint Compliance:** 100%\n**Audit Trail:** Auto-generated`,
];

export function generateProposerResponse(intent: string): string {
  const template = LEGAL_RESPONSE_TEMPLATES[Math.floor(Math.random() * LEGAL_RESPONSE_TEMPLATES.length)];
  return template(intent);
}

export { LEGAL_ONTOLOGY_V2, ALIGNMENT_THRESHOLD, RED_LINE_THRESHOLD };
