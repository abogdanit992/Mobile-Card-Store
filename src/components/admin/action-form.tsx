"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionResult, AdminAction } from "@/lib/admin/action-result";

type Props = {
  action: AdminAction;
  children?: React.ReactNode;
  submitLabel: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  buttonClassName: string;
  confirm?: string;
  resetOnSuccess?: boolean;
};

export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  className,
  buttonClassName,
  confirm,
  resetOnSuccess,
}: Props) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    action,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) {
      formRef.current?.reset();
    }
  }, [state, resetOnSuccess]);

  return (
    <form ref={formRef} action={formAction} className={className}>
      {children}
      <button
        type="submit"
        disabled={isPending}
        aria-busy={isPending}
        onClick={(e) => {
          if (confirm && !window.confirm(confirm)) {
            e.preventDefault();
          }
        }}
        className={`${buttonClassName} ${
          isPending ? "cursor-wait opacity-60" : ""
        }`.trim()}
      >
        {isPending ? pendingLabel ?? "…" : submitLabel}
      </button>
      {state ? (
        <p
          role="status"
          aria-live="polite"
          className={`mt-1 text-xs font-medium ${
            state.ok ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
