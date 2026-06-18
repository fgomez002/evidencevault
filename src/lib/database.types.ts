/**
 * Hand-authored to match supabase/migrations. Regenerate later with:
 *   supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 */

export type IncidentCategory =
  | 'harassment' | 'suspicious' | 'threat' | 'property_damage'
  | 'workplace' | 'online' | 'other';

export type EvidenceKind =
  | 'photo' | 'video' | 'audio' | 'document' | 'screenshot'
  | 'police_report' | 'medical_report' | 'legal_document';

export type ContactRelationship =
  | 'family' | 'friend' | 'attorney' | 'therapist' | 'investigator' | 'emergency' | 'other';

export type PoliceReportStatus = 'filed' | 'investigating' | 'closed' | 'no_action';
export type IntegrityAction = 'created' | 'viewed' | 'modified' | 'exported';

export interface Incident {
  id: string;
  user_id: string;
  occurred_at: string;
  category: IncidentCategory;
  title: string;
  notes: string | null;
  emotional_impact: string | null;
  follow_up_actions: string | null;
  latitude: number | null;
  longitude: number | null;
  location_label: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EvidenceFile {
  id: string;
  user_id: string;
  incident_id: string | null;
  kind: EvidenceKind;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number;
  sha256: string;
  enc_metadata: Record<string, unknown>;
  caption: string | null;
  captured_at: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  subscription_tier: 'free' | 'premium';
  storage_used_bytes: number;
  check_in_settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Witness {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  event_date: string | null;
  written_statement: string | null;
  audio_evidence_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PoliceReport {
  id: string;
  user_id: string;
  incident_id: string | null;
  report_number: string | null;
  agency: string | null;
  officer_name: string | null;
  officer_badge: string | null;
  filed_at: string | null;
  status: PoliceReportStatus;
  follow_up_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  name: string;
  relationship: ContactRelationship;
  phone: string | null;
  email: string | null;
  is_panic_recipient: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrityLogRow {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: IntegrityAction;
  sha256_before: string | null;
  sha256_after: string | null;
  device_label: string | null;
  occurred_at: string;
}

interface TableShape<T> {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<Profile>;
      incidents: TableShape<Incident>;
      evidence_files: TableShape<EvidenceFile>;
      tags: TableShape<Tag>;
      integrity_log: TableShape<IntegrityLogRow>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      incident_category: IncidentCategory;
      evidence_kind: EvidenceKind;
      contact_relationship: ContactRelationship;
      police_report_status: PoliceReportStatus;
      integrity_action: IntegrityAction;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
