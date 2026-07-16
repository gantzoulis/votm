"use client";

import { useState } from "react";

type ConfirmActionProps = {
  title: string;
  description: string;
  triggerLabel: string;
  confirmLabel?: string;
  cancelLabel?: string;
  triggerClassName?: string;
  children: React.ReactNode;
};

export function ConfirmAction({
  title,
  description,
  triggerLabel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  triggerClassName = "",
  children,
}: ConfirmActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {triggerLabel}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <h2
              id="confirm-dialog-title"
              className="text-xl font-semibold text-zinc-100"
            >
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {description}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                {cancelLabel}
              </button>

              
                <div>
                  {children}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}