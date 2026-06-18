-- Row Level Security: each user can only ever touch their own rows.
-- integrity_log is append-only (insert + select, no update/delete) to preserve
-- the chain-of-custody.

alter table profiles        enable row level security;
alter table incidents       enable row level security;
alter table evidence_files  enable row level security;
alter table tags            enable row level security;
alter table evidence_tags   enable row level security;
alter table witnesses       enable row level security;
alter table police_reports  enable row level security;
alter table contacts        enable row level security;
alter table check_ins       enable row level security;
alter table panic_events    enable row level security;
alter table integrity_log   enable row level security;

-- profiles: a user owns the row whose id = their uid
create policy "profiles_self_select" on profiles for select using (id = auth.uid());
create policy "profiles_self_update" on profiles for update using (id = auth.uid());

-- Generic owner policy applied per-table via a helper DO block
do $$
declare t text;
begin
  foreach t in array array[
    'incidents','evidence_files','tags','evidence_tags','witnesses',
    'police_reports','contacts','check_ins','panic_events'
  ] loop
    execute format($f$
      create policy "%1$s_owner_select" on %1$s for select using (user_id = auth.uid());
      create policy "%1$s_owner_insert" on %1$s for insert with check (user_id = auth.uid());
      create policy "%1$s_owner_update" on %1$s for update using (user_id = auth.uid()) with check (user_id = auth.uid());
      create policy "%1$s_owner_delete" on %1$s for delete using (user_id = auth.uid());
    $f$, t);
  end loop;
end $$;

-- integrity_log: insert + select only (no update/delete -> tamper-evident)
create policy "integrity_owner_select" on integrity_log for select using (user_id = auth.uid());
create policy "integrity_owner_insert" on integrity_log for insert with check (user_id = auth.uid());
