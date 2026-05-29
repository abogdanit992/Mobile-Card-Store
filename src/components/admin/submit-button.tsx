"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
};

export function SubmitButton({ children, pendingText, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${className ?? ""} ${
        pending ? "cursor-wait opacity-60" : ""
      }`.trim()}
    >
      {pending ? pendingText ?? "…" : children}
    </button>
  );
}
