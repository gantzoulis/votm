import { modules } from "@/data/votm";

export default function NewItemPage() {
  const visibleModules = modules.filter(
    (module) => module.status !== "hidden"
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">
        <header>
          <p className="text-xs uppercase tracking-[0.28em] text-red-400">
            Dungeon Master
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Add New Item
          </h1>

          <p className="mt-2 text-sm text-zinc-400">
            Add a relic, cursed object, or forgotten treasure to the Vault.
          </p>
        </header>

        <form className="mt-6 space-y-5">
          {/* NAME */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              True Item Name
            </label>

            <input
              type="text"
              placeholder="Lantern of the Watchers"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          {/* DISPLAY NAME */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Unidentified Display Name
            </label>

            <input
              type="text"
              placeholder="Tarnished Iron Lantern"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
                Unidentified Image URL
            </label>

            <input
                type="url"
                placeholder="https://..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
            </div>

            <div className="space-y-2">
            <label className="text-sm text-zinc-300">
                Identified Image URL
            </label>

            <input
                type="url"
                placeholder="https://..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
        </div>

          {/* MODULE */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Found In Chapter
            </label>

            <select title="Found In Chapter"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-red-700"
              defaultValue=""
            >
              <option value="" disabled>
                Select chapter
              </option>

              {visibleModules.map((campaignModule) => (
                <option
                  key={campaignModule.id}
                  value={campaignModule.id}
                >
                  {campaignModule.title}
                </option>
              ))}
            </select>
          </div>

          {/* DESCRIPTION */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Public Description
            </label>

            <textarea
              rows={5}
              placeholder="Describe what the players see..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          {/* SECRET */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-300">
              Secret DM Notes
            </label>

            <textarea
              rows={5}
              placeholder="Hidden curse, mechanics, whispers..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          {/* CHARGES */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-zinc-300">
                Current Charges
              </label>

              <input title="current charges"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">
                Max Charges
              </label>

              <input title="max charges"
                type="number"
                min="0"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>
          </div>

          {/* CHECKBOXES */}
          <div className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" />
              Item is identified
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" />
              Item is cursed
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" />
              Requires attunement
            </label>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full rounded-2xl bg-red-800 px-4 py-4 text-sm font-semibold transition hover:bg-red-700"
          >
            Add Item to the Vault
          </button>
        </form>
      </section>
    </main>
  );
}