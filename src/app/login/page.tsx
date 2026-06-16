"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleLogin() {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (!error) {
      setSent(true);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-xl font-bold text-white">
          Vault of the Mists
        </h1>

        {sent ? (
          <p className="mt-4 text-zinc-300">
            Check your email for the magic link.
          </p>
        ) : (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="mt-4 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
            />

            <button
              onClick={handleLogin}
              className="mt-4 w-full rounded-xl bg-red-900 px-4 py-3 text-white"
            >
              Send Magic Link
            </button>
          </>
        )}
      </div>
    </main>
  );
}