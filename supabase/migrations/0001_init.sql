-- EvidenceVault initial schema
-- Hybrid encryption model: evidence FILE bytes are encrypted client-side and stored
-- in the private `evidence` storage bucket; text metadata lives here under RLS.
-- Every table is row-level-scoped to the authenticated user.

-- ---------- enums ----------
create type incident_category as enum (
  'harassment', 'suspicious', 'threat', 'property_damage',
  'workplace', 'online', 'other'
);

create type evidence_kind as enum (
  'photo', 'video', 'audio', 'document', 'screenshot',
  'police_report', 'medical_report', 'legal_document'
);

create type contact_relationship as enum (
  'family', 'friend', 'attorney', 'therapist', 'investigator', 'emergency', 'other'
);

create type police_report_status as enum (
  'filed', 'investigating', 'closed', 'no_action'
);

create type integrity_action as enum ('created', 'viewed', 'modified', 'exported');

-- ---------- helper: updated_at trigger ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ---------- profiles ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free','premium')),
  storage_used_bytes bigint not null default 0,
  check_in_settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null));
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- incidents ----------
create table incidents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  category incident_category not null default 'other',
  title text not null,
  notes text,
  emotional_impact text,
  follow_up_actions text,
  latitude double precision,
  longitude double precision,
  location_label text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index incidents_user_time_idx on incidents(user_id, occurred_at desc);

-- ---------- evidence_files ----------
create table evidence_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  incident_id uuid references incidents(id) on delete set null,
  kind evidence_kind not null,
  storage_path text not null,
  original_filename text,
  mime_type text,
  size_bytes bigint not null default 0,
  sha256 text not null,
  enc_metadata jsonb not null default '{}'::jsonb,
  caption text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index evidence_user_time_idx on evidence_files(user_id, captured_at desc);
create index evidence_incident_idx on evidence_files(incident_id);

-- ---------- tags ----------
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#3DD6C4',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table evidence_tags (
  evidence_id uuid not null references evidence_files(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  primary key (evidence_id, tag_id)
);

-- ---------- witnesses ----------
create table witnesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  event_date date,
  written_statement text,
  audio_evidence_id uuid references evidence_files(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- police_reports ----------
create table police_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  incident_id uuid references incidents(id) on delete set null,
  report_number text,
  agency text,
  officer_name text,
  officer_badge text,
  filed_at date,
  status police_report_status not null default 'filed',
  follow_up_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- contacts ----------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  relationship contact_relationship not null default 'other',
  phone text,
  email text,
  is_panic_recipient boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- check_ins ----------
create table check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  scheduled_at timestamptz not null,
  window_minutes int not null default 30,
  status text not null default 'pending' check (status in ('pending','confirmed','missed')),
  notified_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- panic_events ----------
create table panic_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  triggered_at timestamptz not null default now(),
  latitude double precision,
  longitude double precision,
  message text,
  recipients jsonb not null default '[]'::jsonb,
  delivered boolean not null default false
);

-- ---------- integrity_log (append-only chain of custody) ----------
create table integrity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entity_type text not null,
  entity_id uuid not null,
  action integrity_action not null,
  sha256_before text,
  sha256_after text,
  device_label text,
  occurred_at timestamptz not null default now()
);
create index integrity_entity_idx on integrity_log(entity_type, entity_id);

-- ---------- updated_at triggers ----------
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_incidents_updated before update on incidents for each row execute function set_updated_at();
create trigger trg_evidence_updated before update on evidence_files for each row execute function set_updated_at();
create trigger trg_witnesses_updated before update on witnesses for each row execute function set_updated_at();
create trigger trg_police_updated before update on police_reports for each row execute function set_updated_at();
create trigger trg_contacts_updated before update on contacts for each row execute function set_updated_at();
