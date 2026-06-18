-- Private storage bucket for encrypted evidence blobs.
-- Files are stored under a path prefixed by the owner's uid: `<uid>/<evidence_id>.enc`
-- RLS on storage.objects restricts every operation to that prefix.

insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do nothing;

create policy "evidence_owner_select" on storage.objects
  for select using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence_owner_update" on storage.objects
  for update using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "evidence_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'evidence'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
