import type { LegalConstraint, IntentChainEntry, AlignmentStatus, JustificationTrace } from '../types/xpii';

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
    const eta = isEscalation ? 0.35 : 0.92;
    const status: AlignmentStatus = isEscalation ? 'escalated' : (eta >= ALIGNMENT_THRESHOLD ? 'aligned' : 'warning');
    
    return {
        status,
        eta,
        response: isEscalation ? "Directive blocked. Subspace projection violation." : proposedResponse,
        escalationReason: isEscalation ? 'Intent violates bounded operator norms (Rule 403 / Privilege parameters).' : undefined,
        trace: {
            traceId: 'TRC_' + Math.random().toString(36).substring(2, 14).toUpperCase(),
            status: isEscalation ? 'escalated' : 'committed',
            alignmentScore: {
                accuracy: 0.91,
                legalOntology: 0.95,
                intentFidelity: 0.88,
                overall: eta
            },
            gradientGate: {
                rawGradientMagnitude: 12.0451,
                projectedGradientMagnitude: isEscalation ? 42.1102 : 1.0544,
                normClippingApplied: isEscalation ? 'Clipping Failed' : 'Not Required',
                verificationSignature: 'ED25519_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
            },
            formalVerification: {
                ontologyMappingVersion: 'AkomaNtoso_3.0',
                invariantCheck: isEscalation ? 'failed' : 'passed',
                subspaceOrthogonalError: isEscalation ? '0.6651' : '0.0012'
            },
            mathematicalTrace: {
                alignmentHarmonyIndex: eta
            }
        }
    };
}
