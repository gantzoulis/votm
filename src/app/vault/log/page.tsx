import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCampaignAccess } from "@/lib/auth/access";
import type { ItemEvent } from "@/types/votm";

export default async function CampaignLogPage() {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.isDm) {
    redirect("/vault");
  }

  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("item_events")
    .select(`
      *,
      actor:profiles (
        display_name
      ),
      item:items (
        id,
        name,
        display_name,
        is_identified
      )
    `)
    .eq("campaign_id", access.campaignId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Campaign log error:", error);
  }

  const campaignEvents = (events ?? []) as ItemEvent[];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-3xl px-4 py-5 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link href="/vault" className="text-sm text-red-300">
            ← Back to Vault
          </Link>

          <p className="mt-4 text-xs uppercase tracking-[0.28em] text-red-400">
            Dungeon Master
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Campaign Log
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Audit history for Vault of the Mists.
          </p>
        </header>

        <div className="mt-5 space-y-3">
          {campaignEvents.length === 0 ? (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <h2 className="text-lg font-semibold">
                No events yet
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                The Mists are quiet.
              </p>
            </section>
          ) : (
            campaignEvents.map((event) => {
              const itemTitle = event.item
                ? event.item.is_identified
                  ? event.item.name
                  : event.item.display_name
                : null;

              return (
                <article
                  key={event.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-zinc-200">
                        {event.summary}
                      </p>

                      <p className="mt-2 text-xs text-zinc-500">
                        {new Date(event.created_at).toLocaleString()} ·{" "}
                        {event.actor?.display_name ?? "Unknown actor"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                      {event.event_type}
                    </span>
                  </div>

                  {event.item_id && itemTitle && (
                    <Link
                      href={`/vault/items/${event.item_id}`}
                      className="mt-3 inline-flex text-sm text-red-300"
                    >
                      View item: {itemTitle}
                    </Link>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}