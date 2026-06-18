import { palette } from './colors';

export const INCIDENT_CATEGORIES = [
  { value: 'harassment', label: 'Harassment', color: palette.categoryHarassment, icon: '🚩' },
  { value: 'suspicious', label: 'Suspicious activity', color: palette.categorySuspicious, icon: '👁️' },
  { value: 'threat', label: 'Threat', color: palette.categoryThreat, icon: '⚠️' },
  { value: 'property_damage', label: 'Property damage', color: palette.categoryProperty, icon: '🔨' },
  { value: 'workplace', label: 'Workplace issue', color: palette.categoryWorkplace, icon: '🏢' },
  { value: 'online', label: 'Online harassment', color: palette.categoryOnline, icon: '💻' },
  { value: 'other', label: 'Other', color: palette.categoryOther, icon: '📌' },
] as const;

export type IncidentCategory = (typeof INCIDENT_CATEGORIES)[number]['value'];

export function categoryMeta(value: string) {
  return INCIDENT_CATEGORIES.find((c) => c.value === value) ?? INCIDENT_CATEGORIES[6];
}

export const EVIDENCE_KINDS = [
  { value: 'photo', label: 'Photo', icon: '📷' },
  { value: 'video', label: 'Video', icon: '🎥' },
  { value: 'audio', label: 'Audio', icon: '🎙️' },
  { value: 'document', label: 'Document', icon: '📄' },
  { value: 'screenshot', label: 'Screenshot', icon: '🖼️' },
  { value: 'police_report', label: 'Police report', icon: '🚔' },
  { value: 'medical_report', label: 'Medical report', icon: '🏥' },
  { value: 'legal_document', label: 'Legal document', icon: '⚖️' },
] as const;

export type EvidenceKind = (typeof EVIDENCE_KINDS)[number]['value'];

export function evidenceKindMeta(value: string) {
  return EVIDENCE_KINDS.find((k) => k.value === value) ?? EVIDENCE_KINDS[3];
}

export const CONTACT_RELATIONSHIPS = [
  { value: 'family', label: 'Family', icon: '👪', color: palette.categoryWorkplace },
  { value: 'friend', label: 'Friend', icon: '🤝', color: palette.accent },
  { value: 'attorney', label: 'Attorney', icon: '⚖️', color: palette.categoryProperty },
  { value: 'therapist', label: 'Therapist', icon: '🧠', color: palette.categoryOnline },
  { value: 'investigator', label: 'Investigator', icon: '🕵️', color: palette.categorySuspicious },
  { value: 'emergency', label: 'Emergency', icon: '🚨', color: palette.danger },
  { value: 'other', label: 'Other', icon: '👤', color: palette.categoryOther },
] as const;

export type ContactRelationshipValue = (typeof CONTACT_RELATIONSHIPS)[number]['value'];

export function relationshipMeta(value: string) {
  return CONTACT_RELATIONSHIPS.find((r) => r.value === value) ?? CONTACT_RELATIONSHIPS[6];
}

export const REPORT_STATUSES = [
  { value: 'filed', label: 'Filed', color: palette.indigo },
  { value: 'investigating', label: 'Investigating', color: palette.warning },
  { value: 'closed', label: 'Closed', color: palette.success },
  { value: 'no_action', label: 'No action', color: palette.textFaint },
] as const;

export type ReportStatusValue = (typeof REPORT_STATUSES)[number]['value'];

export function reportStatusMeta(value: string) {
  return REPORT_STATUSES.find((s) => s.value === value) ?? REPORT_STATUSES[0];
}
