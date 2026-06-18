-- Security hardening for the helper functions (clears Supabase advisor warnings).

-- Pin search_path on the updated_at helper (only uses now() from pg_catalog).
alter function public.set_updated_at() set search_path = '';

-- handle_new_user is a signup trigger, not an API entry point. Keep it
-- SECURITY DEFINER (so it can insert the profile row past RLS) but ensure it
-- can't be invoked as an RPC by anon/authenticated.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
