"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to Scrib
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          We&apos;ll email you a magic link — no password needed.
        </p>

        {status === "sent" ? (
          <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
            Check <span className="font-medium">{email}</span> for a sign-in
            link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="mt-1.5 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-60"
            >
              {status === "sending" ? "Sending link…" : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
