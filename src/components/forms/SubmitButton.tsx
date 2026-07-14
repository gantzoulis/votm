"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
};

const variantClasses = {
  primary:
    "bg-red-900 text-red-100 hover:bg-red-800",
  secondary:
    "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700",
  success:
    "bg-green-900 text-green-100 hover:bg-green-800",
  danger:
    "bg-red-950 text-red-200 hover:bg-red-900",
};

export function SubmitButton({
  label,
  pendingLabel = "Working...",
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {pending && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}

      {pending ? pendingLabel : label}
    </button>
  );
}