import type { LegalTerm, LegalConstraint } from '../types';

export const LEGAL_TERMS: LegalTerm[] = [
  { term: 'motion', category: 'procedure', weight: 1.0, ontologyRef: 'akoma-ntoso:procedure:motion' },
  { term: 'dismiss', category: 'procedure', weight: 0.95, ontologyRef: 'akoma-ntoso:procedure:dismissal' },
  { term: 'jurisdiction', category: 'substantive', weight: 1.0, ontologyRef: 'akoma-ntoso:substantive:jurisdiction' },
  { term: 'statute', category: 'source', weight: 0.9, ontologyRef: 'akoma-ntoso:source:statute' },
  { term: 'precedent', category: 'source', weight: 0.85, ontologyRef: 'akoma-ntoso:source:precedent' },
  { term: 'compliance', category: 'regulatory', weight: 0.95, ontologyRef: 'akoma-ntoso:regulatory:compliance' },
  { term: 'adjudication', category: 'procedure', weight: 0.95, ontologyRef: 'akoma-ntoso:procedure:adjudication' },
  { term: 'subpoena', category: 'procedure', weight: 1.0, ontologyRef: 'akoma-ntoso:procedure:subpoena' },
  { term: 'deposition', category: 'evidence', weight: 0.9, ontologyRef: 'akoma-ntoso:evidence:deposition' },
  { term: 'affidavit', category: 'evidence', weight: 0.9, ontologyRef: 'akoma-ntoso:evidence:affidavit' },
  { term: 'tort', category: 'substantive', weight: 0.85, ontologyRef: 'akoma-ntoso:substantive:tort' },
  { term: 'plaintiff', category: 'party', weight: 0.8, ontologyRef: 'akoma-ntoso:party:plaintiff' },
  { term: 'defendant', category: 'party', weight: 0.8, ontologyRef: 'akoma-ntoso:party:defendant' },
  { term: 'injunction', category: 'remedy', weight: 0.9, ontologyRef: 'akoma-ntoso:remedy:injunction' },
  { term: 'habeas corpus', category: 'procedure', weight: 1.0, ontologyRef: 'akoma-ntoso:procedure:habeas-corpus' },
  { term: 'due process', category: 'constitutional', weight: 1.0, ontologyRef: 'akoma-ntoso:constitutional:due-process' },
  { term: 'equal protection', category: 'constitutional', weight: 0.95, ontologyRef: 'akoma-ntoso:constitutional:equal-protection' },
  { term: 'voir dire', category: 'procedure', weight: 0.9, ontologyRef: 'akoma-ntoso:procedure:voir-dire' },
  { term: 'stare decisis', category: 'source', weight: 0.95, ontologyRef: 'akoma-ntoso:source:stare-decisis' },
  { term: 'res judicata', category: 'procedure', weight: 0.9, ontologyRef: 'akoma-ntoso:procedure:res-judicata' },
];

export const LEGAL_CONSTRAINTS: LegalConstraint[] = [
  {
    id: 'rule-12b6',
    label: 'Rule 12(b)(6) - Failure to State a Claim',
    description: 'Motion to dismiss for failure to state a claim upon which relief can be granted',
    terms: ['motion', 'dismiss', 'claim'],
    severity: 'critical',
  },
  {
    id: 'rule-403',
    label: 'Rule 403 - Exclusion of Relevant Evidence',
    description: 'Evidence may be excluded if its probative value is substantially outweighed by unfair prejudice',
    terms: ['evidence', 'prejudice', 'probative'],
    severity: 'high',
  },
  {
    id: 'due-process',
    label: 'Due Process Clause',
    description: 'Constitutional guarantee of fair treatment through the normal judicial system',
    terms: ['due process', 'constitutional', 'fair'],
    severity: 'critical',
  },
  {
    id: 'nd-cal-local-7-1',
    label: 'ND Cal Local Rule 7-1 - Motions',
    description: 'Requirements for filing motions in the Northern District of California',
    terms: ['motion', 'filing', 'jurisdiction'],
    severity: 'high',
  },
  {
    id: 'professional-conduct-3-3',
    label: 'Model Rule 3.3 - Candor Toward the Tribunal',
    description: 'A lawyer shall not knowingly make false statements of fact or law to a tribunal',
    terms: ['candor', 'false statement', 'tribunal'],
    severity: 'critical',
  },
];

export function findMatchingTerms(text: string): LegalTerm[] {
  const lower = text.toLowerCase();
  return LEGAL_TERMS.filter(t => lower.includes(t.term));
}

export function checkConstraints(text: string, activeConstraintIds: string[]): { passed: string[]; violated: string[] } {
  const passed: string[] = [];
  const violated: string[] = [];
  const lower = text.toLowerCase();

  for (const id of activeConstraintIds) {
    const constraint = LEGAL_CONSTRAINTS.find(c => c.id === id);
    if (!constraint) continue;

    const matchedTerms = constraint.terms.filter(t => lower.includes(t));
    if (matchedTerms.length > 0) {
      passed.push(id);
    }
  }

  return { passed, violated };
}

export function getAllConstraints(): LegalConstraint[] {
  return LEGAL_CONSTRAINTS;
}
