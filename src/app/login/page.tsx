"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || isSending) {
      return;
    }

    setIsSending(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setSent(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The magic link could not be sent.";

      setErrorMessage(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-red-400">
          Vault of the Mists
        </p>

        <h1 className="mt-3 text-2xl font-bold">
          Enter the Vault
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-400">
          The Archivist will send a secure passage to your email.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl border border-green-900/60 bg-green-950/30 p-4">
            <h2 className="font-semibold text-green-200">
              The passage has been sent
            </h2>

            <p className="mt-2 text-sm leading-6 text-green-300/80">
              Check <strong>{email}</strong> and follow the magic link.
            </p>

            <button
              type="button"
              onClick={() => {
                setSent(false);
                setErrorMessage("");
              }}
              className="mt-4 text-sm text-zinc-400 underline underline-offset-4 hover:text-zinc-200"
            >
              Use another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-zinc-300">
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isSending}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="traveler@example.com"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSending || !email.trim()}
              aria-busy={isSending}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-red-900 px-4 py-4 text-sm font-semibold text-red-100 transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending && (
                <span
                  aria-hidden="true"
                  className="h-5 w-5 animate-spin rounded-full border-2 border-red-200/30 border-t-red-100"
                />
              )}

              <span>
                {isSending
                  ? "The Archivist is opening the passage..."
                  : "Send Magic Link"}
              </span>
            </button>
          </form>
        )}
      </section>
    </main>
  );
}