import Link from "next/link";
import { Mic, FileText, Sparkles, Layers } from "lucide-react";

const FEATURES = [
  {
    icon: Mic,
    title: "Record or upload",
    description:
      "Hit record right in your browser during class, or drop in an audio file afterward. No extra hardware, no app to install.",
  },
  {
    icon: FileText,
    title: "Accurate transcripts",
    description:
      "Every lecture is transcribed automatically, so you get a searchable, word-for-word record of everything that was said.",
  },
  {
    icon: Sparkles,
    title: "AI notes, done for you",
    description:
      "Scrib reads the transcript and writes a summary and key points for you — the studying starts before you even open your notebook.",
  },
  {
    icon: Layers,
    title: "Flashcards, generated",
    description:
      "Each lecture becomes a ready-to-study flashcard deck, pulled straight from what your professor actually said.",
  },
];

export default function LandingPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-6 pt-28 pb-20 text-center">
        <p className="text-sm font-medium text-neutral-500">Scrib</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Never take lecture notes by hand again.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-neutral-400">
          Record or upload a lecture and Scrib transcribes it, summarizes it,
          and turns it into flashcards — automatically, so you can just listen.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
          >
            Get started free
          </Link>
          <a
            href="#how-it-works"
            className="rounded-md border border-neutral-700 px-5 py-2.5 text-sm font-medium transition hover:border-neutral-500"
          >
            See how it works
          </a>
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-5xl border-t border-neutral-800 px-6 py-20"
      >
        <div className="grid gap-10 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 ring-1 ring-neutral-800">
                <Icon className="h-5 w-5 text-neutral-300" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl border-t border-neutral-800 px-6 py-20 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Your whole semester, organized by itself.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-neutral-400">
          Every lecture you save lives in one library — transcript, summary,
          and flashcards, all searchable, all in one place.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200"
        >
          Start recording
        </Link>
      </section>

      <footer className="border-t border-neutral-800 px-6 py-8 text-center text-sm text-neutral-500">
        Scrib
      </footer>
    </main>
  );
}
