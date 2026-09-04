# Scrib

Record or upload your lectures. Scrib transcribes them and turns them into
summaries, key points, and flashcards — automatically.

## How it works

1. **Record or upload** — record audio right in the browser (`MediaRecorder`)
   or upload an existing file from `/dashboard/new`.
2. **Store** — the audio is uploaded straight to a private Supabase Storage
   bucket, scoped to the signed-in user.
3. **Transcribe** — a background API route downloads the audio and sends it
   to OpenAI's Whisper API for transcription.
4. **Summarize** — the transcript is sent to Claude, which returns a
   structured summary, key points, and a flashcard deck via tool use.
5. **Study** — the lecture's detail page polls for status and renders the
   audio player, transcript, summary, key points, and flashcards once ready.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com) — Postgres (with RLS), Storage, and email
  magic-link auth
- [OpenAI Whisper](https://platform.openai.com/docs/guides/speech-to-text) for
  transcription
- [Claude](https://www.anthropic.com/claude) for summaries, key points, and
  flashcards

## Setup

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL
editor and run [`supabase/schema.sql`](./supabase/schema.sql). It creates the
`lectures` table (with row-level security so users only ever see their own
lectures) and a private `lectures` storage bucket for audio files.

In **Authentication → URL Configuration**, add
`http://localhost:3000/auth/callback` (and your production URL once deployed)
as a redirect URL so magic-link sign-in works.

### 2. Get your API keys

- Supabase: **Project Settings → API** for the project URL, anon key, and
  service role key.
- OpenAI: an API key from [platform.openai.com](https://platform.openai.com)
  with access to `whisper-1`.
- Anthropic: an API key from
  [console.anthropic.com](https://console.anthropic.com).

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with the values from step 2.

### 4. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/app/                     landing page, auth, dashboard, API routes
src/app/api/lectures/        create a lecture, kick off + run AI processing
src/components/              LectureView (tabs/polling), StatusBadge
src/lib/supabase/            browser/server/admin Supabase clients, middleware
src/lib/transcribe.ts        Whisper transcription
src/lib/notes.ts             Claude summary/key points/flashcards generation
supabase/schema.sql          DB table, RLS policies, storage bucket + policies
```
