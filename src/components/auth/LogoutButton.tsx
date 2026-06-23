import { signOut } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-xl border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        Logout
      </button>
    </form>
  );
}