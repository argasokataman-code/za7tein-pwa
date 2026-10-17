-- 2026-10-17 — additive columns for M10 ops panel + SA console 1:1 mapping.
-- Non-destructive: ADD COLUMN IF NOT EXISTS only; no drops, no data rewrites.
-- Applied to project dwzxtnfesmpobnepilhl via Management API /database/query.

-- punishments: ops editor publishes free-form SP (front-end `OpsPenalty`).
-- `kind`/`level` (int) stay as the structured issue_sp path; these carry the
-- free-text form/level the ops operator actually types, plus revoke status.
alter table public.punishments
  add column if not exists subject_name text,
  add column if not exists form text,
  add column if not exists level_label text,
  add column if not exists status text not null default 'issued';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'punishments_status_check'
      and conrelid = 'public.punishments'::regclass
  ) then
    alter table public.punishments
      add constraint punishments_status_check
      check (status in ('issued', 'revoked')) not valid;
  end if;
end $$;

-- audit_logs: front-end `AuditEntry.kind` filter bucket (onboarding/dispute/...).
alter table public.audit_logs
  add column if not exists kind text;

-- platform_params: "kurir hampir sampai" threshold (R-TRACK), owned by ops.
alter table public.platform_params
  add column if not exists almost_arrived_minutes integer not null default 5;
