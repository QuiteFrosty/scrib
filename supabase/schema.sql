-- Scrib database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists "pgcrypto";

create type lecture_status as enum (
  'uploaded',
  'transcribing',
  'summarizing',
  'ready',
  'error'
);

create table if not exists public.lectures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  course text,
  audio_path text not null,
  duration_seconds integer,
  status lecture_status not null default 'uploaded',
  error_message text,
  transcript text,
  summary text,
  key_points jsonb,
  flashcards jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lectures_user_id_created_at_idx
  on public.lectures (user_id, created_at desc);

alter table public.lectures enable row level security;

create policy "Users can view their own lectures"
  on public.lectures for select
  using (auth.uid() = user_id);

create policy "Users can insert their own lectures"
  on public.lectures for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own lectures"
  on public.lectures for update
  using (auth.uid() = user_id);

create policy "Users can delete their own lectures"
  on public.lectures for delete
  using (auth.uid() = user_id);

-- Lecture audio itself is NOT stored in Supabase — it lives in a Cloudflare R2
-- bucket (see README.md for setup). `lectures.audio_path` just stores the R2
-- object key ("<user_id>/<uuid>.<ext>"), and access is scoped per-user by
-- presigned URLs generated server-side (src/lib/r2.ts), not by Postgres RLS.
