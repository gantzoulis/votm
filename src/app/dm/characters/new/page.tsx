import Link from "next/link";
import { redirect } from "next/navigation";
import { getCampaignAccess } from "@/lib/auth/access";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { createCharacter } from "./actions";

export default async function NewCharacterPage() {
  const access = await getCampaignAccess();

  if (!access) {
    redirect("/login");
  }

  if (!access.isDm) {
    redirect("/vault");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="mx-auto min-h-screen w-full max-w-2xl px-4 py-5 sm:px-6">
        <header className="sticky top-0 z-10 -mx-4 border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
          <Link
            href="/dm/characters"
            className="text-sm text-red-300"
          >
            ← Back to Characters
          </Link>

          <p className="mt-5 text-xs uppercase tracking-[0.28em] text-red-400">
            Dungeon Master
          </p>

          <h1 className="mt-2 text-2xl font-bold">
            Create Character
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Create a character profile that a player can later claim.
          </p>
        </header>

        <form action={createCharacter} className="mt-6 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm text-zinc-300"
            >
              Character Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Quinrel"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="race" className="text-sm text-zinc-300">
              Race / Species
            </label>

            <input
              id="race"
              name="race"
              type="text"
              placeholder="Elf"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="className" className="text-sm text-zinc-300">
                Class
              </label>

              <select
                id="className"
                name="className"
                required
                defaultValue=""
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              >
                <option value="" disabled>
                  Select class
                </option>
                <option value="Artificer">Artificer</option>
                <option value="Barbarian">Barbarian</option>
                <option value="Bard">Bard</option>
                <option value="Cleric">Cleric</option>
                <option value="Druid">Druid</option>
                <option value="Fighter">Fighter</option>
                <option value="Monk">Monk</option>
                <option value="Paladin">Paladin</option>
                <option value="Ranger">Ranger</option>
                <option value="Rogue">Rogue</option>
                <option value="Sorcerer">Sorcerer</option>
                <option value="Warlock">Warlock</option>
                <option value="Wizard">Wizard</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="subclassName" className="text-sm text-zinc-300">
                Subclass
              </label>

              <input
                id="subclassName"
                name="subclassName"
                type="text"
                placeholder="Phantom"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="classLevel" className="text-sm text-zinc-300">
                Level
              </label>

              <input
                id="classLevel"
                name="classLevel"
                type="number"
                min="1"
                max="20"
                required
                defaultValue="1"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="portraitUrl"
              className="text-sm text-zinc-300"
            >
              Portrait URL
            </label>

            <input
              id="portraitUrl"
              name="portraitUrl"
              type="url"
              placeholder="https://..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-red-700"
            />

            <p className="text-xs leading-5 text-zinc-500">
              Optional for now. We can replace this with direct image upload later.
            </p>
          </div>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Initial Status
            </p>

            <p className="mt-2 text-sm text-zinc-300">
              This character will be created as unclaimed and will appear in
              player onboarding.
            </p>
          </section>
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Experience
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="currentXp" className="text-sm text-zinc-300">
                  Current XP
                </label>

                <input
                  id="currentXp"
                  name="currentXp"
                  type="number"
                  min="0"
                  defaultValue="0"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-700"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="nextLevelXp" className="text-sm text-zinc-300">
                  Next Level XP
                </label>

                <input
                  id="nextLevelXp"
                  name="nextLevelXp"
                  type="number"
                  min="1"
                  placeholder="6500"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-red-700"
                />
              </div>
            </div>
          </section>

          <SubmitButton
            label="Create Character"
            pendingLabel="Binding the soul..."
            className="w-full"
          />
        </form>
      </section>
    </main>
  );
}