"use client";

import { useCallback, useState } from "react";

type CardCodeDisplayProps = {
  code: string;
  labels: {
    copyCode: string;
    copied: string;
    tapToCopy: string;
  };
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older mobile browsers / non-HTTPS contexts
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CardCodeDisplay({ code, labels }: CardCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyText(code);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleCopy}
        className="group w-full break-all rounded-lg border border-[var(--border)] bg-black/60 p-4 text-center font-mono text-lg font-bold tracking-widest text-[var(--gold)] transition hover:border-[var(--accent-soft)] active:scale-[0.99]"
        aria-label={labels.copyCode}
      >
        {code}
      </button>

      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--accent)]/60 bg-[var(--accent)]/15 text-sm font-bold text-[var(--accent-soft)] transition hover:bg-[var(--accent)]/25 active:scale-[0.99]"
      >
        <span aria-hidden>{copied ? "✓" : "📋"}</span>
        {copied ? labels.copied : labels.copyCode}
      </button>

      <p className="mt-2 text-center text-[10px] text-[var(--muted)]">
        {labels.tapToCopy}
      </p>
    </div>
  );
}
