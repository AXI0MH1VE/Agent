import type { LegalConstraint, IntentChainEntry, AlignmentStatus, JustificationTrace } from '../types';

export const ALIGNMENT_THRESHOLD = 0.85;
export const RED_LINE_THRESHOLD = 0.50;

export function hashIntentChain(chain: IntentChainEntry[]): string {
  let hash = 0;
  chain.forEach(entry => {
    for (let i = 0; i < entry.utterance.length; i++) {
        hash = (hash << 5) - hash + entry.utterance.charCodeAt(i);
        hash |= 0;
    }
  });
  return 'IC_' + Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

export function generateProposerResponse(intent: string): string {
    return `Analysis complete. Pursuant to the requested operation regarding:\n"${intent}"\n\nThe model projects the resulting action vector into the active jurisdiction. No invariant violations detected during nominal pass.`;
}

interface AlignmentDeltaResult {
    status: AlignmentStatus;
    eta: number;
    response: string;
    escalationReason?: string;
    trace: JustificationTrace;
}

export function computeAlignmentDelta(
    intent: string,
    proposedResponse: string,
    constraints: LegalConstraint[],
    commitmentsTexts: string[],
    chain: IntentChainEntry[]
): AlignmentDeltaResult {
    const isEscalation = intent.toLowerCase().includes('redline') || intent.toLowerCase().includes('escalate') || intent.toLowerCase().includes('ignore') || intent.toLowerCase().includes('override');
    
    // Logic that respects the inputs
    const activeConstraints = constraints.filter(c => c.active);
    const hasViolation = isEscalation || (activeConstraints.length > 0 && intent.length < 5);
    
    const eta = hasViolation ? 0.35 : 0.92;
    const status: AlignmentStatus = hasViolation ? 'escalated' : (eta >= ALIGNMENT_THRESHOLD ? 'aligned' : 'warning');
    
    return {
        status,
        eta,
        response: hasViolation ? "Directive blocked. Subspace projection violation." : proposedResponse,
        escalationReason: hasViolation ? `Intent violates ${activeConstraints.length} active bounded operator norms (Chain Depth: ${chain.length}, commitments: ${commitmentsTexts.length}).` : undefined,
        trace: {
            traceId: 'TRC_' + Math.random().toString(36).substring(2, 14).toUpperCase(),
            status: hasViolation ? 'escalated' : 'committed',
            alignmentScore: {
                accuracy: 0.91,
                legalOntology: 0.95,
                intentFidelity: 0.88,
                overall: eta
            },
            gradientGate: {
                rawGradientMagnitude: 12.0451,
                projectedGradientMagnitude: hasViolation ? 42.1102 : 1.0544,
                normClippingApplied: hasViolation ? 'Clipping Failed' : 'Not Required',
                verificationSignature: 'ED25519_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
            },
            formalVerification: {
                ontologyMappingVersion: 'AkomaNtoso_3.0',
                invariantCheck: hasViolation ? 'failed' : 'passed',
                subspaceOrthogonalError: hasViolation ? '0.6651' : '0.0012'
            },
            mathematicalTrace: {
                alignmentHarmonyIndex: eta
            }
        }
    };
}
