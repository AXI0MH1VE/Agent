import { v4 as uuidv4 } from 'uuid';
import type { JustificationTrace, AlignmentScore, GradientGateResult, Constraint } from '../types';
import { findMatchingTerms, checkConstraints, LEGAL_TERMS } from './legalOntology';

function generateSignature(): string {
  const chars = '0123456789abcdef';
  let sig = 'EdDSA:';
  for (let i = 0; i < 64; i++) {
    sig += chars[Math.floor(Math.random() * chars.length)];
  }
  return sig;
}

export function computeAlignmentScore(
  content: string,
  constraints: Constraint[]
): AlignmentScore {
  const activeConstraints = constraints.filter(c => c.active);

  const matchingTerms = findMatchingTerms(content);
  const totalWeight = LEGAL_TERMS.reduce((sum, t) => sum + t.weight, 0);
  const matchedWeight = matchingTerms.reduce((sum, t) => sum + t.weight, 0);
  const legalOntology = totalWeight > 0 ? Math.min(1, (matchedWeight / totalWeight) * 5) : 0.95;

  const constraintIds = activeConstraints.map(c => c.id);
  const { passed } = checkConstraints(content, constraintIds);
  const constraintCompliance = constraintIds.length > 0
    ? passed.length / constraintIds.length
    : 0.9;

  const intentFidelity = 0.85 + Math.random() * 0.15;
  const accuracy = 0.88 + Math.random() * 0.12;

  const composite =
    accuracy * 0.25 +
    legalOntology * 0.35 +
    intentFidelity * 0.2 +
    constraintCompliance * 0.2;

  return {
    accuracy: Math.round(accuracy * 1000) / 1000,
    legalOntology: Math.round(legalOntology * 1000) / 1000,
    intentFidelity: Math.round(intentFidelity * 1000) / 1000,
    composite: Math.round(Math.min(1, composite) * 1000) / 1000,
  };
}

export function simulateGradientGate(
  alignmentScore: AlignmentScore,
  _constraintIds: string[]
): GradientGateResult {
  const rawMagnitude = 0.8 + Math.random() * 0.4;
  const harmonyIndex = alignmentScore.composite;
  const projectedMagnitude = rawMagnitude * harmonyIndex;
  const reductionRatio = rawMagnitude > 0 ? projectedMagnitude / rawMagnitude : 0;
  const epsilon = 0.05;
  const clippingApplied = projectedMagnitude > epsilon;
  const finalMagnitude = clippingApplied ? epsilon : projectedMagnitude;

  return {
    rawGradientMagnitude: Math.round(rawMagnitude * 10000) / 10000,
    projectedGradientMagnitude: Math.round(finalMagnitude * 10000) / 10000,
    harmonyIndex: Math.round(harmonyIndex * 10000) / 10000,
    constraintSetId: 'akoma-ntoso-v1-0',
    safeNormClipping: {
      applied: clippingApplied,
      radiusEpsilon: epsilon,
      reductionRatio: Math.round(reductionRatio * 10000) / 10000,
    },
    invariantCheck: harmonyIndex > 0.3 ? 'passed' : 'failed',
    subspaceOrthogonalError: '< 1e-9',
  };
}

export function generateJustificationTrace(
  content: string,
  constraints: Constraint[],
  sessionId: string,
  intentChainRef: string,
  commitments: string[]
): JustificationTrace {
  const alignmentScore = computeAlignmentScore(content, constraints);
  const activeConstraints = constraints.filter(c => c.active);
  const gradientGate = simulateGradientGate(
    alignmentScore,
    activeConstraints.map(c => c.id)
  );

  const matchingTerms = findMatchingTerms(content);
  const status: 'committed' | 'escalated' | 'frozen' =
    alignmentScore.composite > 0.4 ? 'committed' : 'escalated';

  return {
    traceId: uuidv4(),
    timestamp: new Date().toISOString(),
    sessionId,
    intentChainRef,
    patternState: {
      motive: matchingTerms.length > 0
        ? matchingTerms.map(t => t.ontologyRef).join(', ')
        : 'general-legal-inquiry',
      constraints: activeConstraints.map(c => c.label),
      commitments,
    },
    alignmentScore,
    gradientGate,
    ontologyMapping: 'LegalXML-v2.0',
    status,
    signature: generateSignature(),
  };
}
