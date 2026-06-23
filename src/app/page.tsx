import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-10">
        <p className="text-xs uppercase tracking-[0.32em] text-red-400">
          Vault of the Mists
        </p>

        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
          Dinner with the Devil
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-400">
          A private Ravenloft treasury for cursed relics, party loot,
          secret notes, charges, reveals, and the things the Mists refuse
          to forget.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {user ? (
            <Link
              href="/vault"
              className="rounded-2xl border border-red-900/60 bg-red-950/40 px-5 py-4 text-center text-sm font-semibold text-red-200"
            >
              Enter the Vault
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-2xl border border-red-900/60 bg-red-950/40 px-5 py-4 text-center text-sm font-semibold text-red-200"
            >
              Login with Magic Link
            </Link>
          )}

          <Link
            href="/vault"
            className="rounded-2xl border border-zinc-800 bg-zinc-900/70 px-5 py-4 text-center text-sm font-semibold text-zinc-300"
          >
            Continue to Vault
          </Link>
        </div>

        {!user && (
          <p className="mt-4 text-xs text-zinc-500">
            You need access to the campaign before the Vault will open.
          </p>
        )}
      </section>
    </main>
  );
}