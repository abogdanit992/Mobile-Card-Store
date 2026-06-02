"use client";

import { CardCodeDisplay } from "@/components/card-code-display";

type CardCodesListProps = {
  codes: string[];
  labels: {
    copyCode: string;
    copied: string;
    tapToCopy: string;
    codeNumber: string;
  };
};

export function CardCodesList({ codes, labels }: CardCodesListProps) {
  if (codes.length === 1) {
    return (
      <CardCodeDisplay
        code={codes[0]}
        labels={{
          copyCode: labels.copyCode,
          copied: labels.copied,
          tapToCopy: labels.tapToCopy,
        }}
      />
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {codes.map((code, index) => (
        <div key={`${index}-${code}`}>
          <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-[var(--accent-soft)]">
            {labels.codeNumber.replace("{n}", String(index + 1)).replace("{total}", String(codes.length))}
          </p>
          <CardCodeDisplay
            code={code}
            labels={{
              copyCode: labels.copyCode,
              copied: labels.copied,
              tapToCopy: labels.tapToCopy,
            }}
          />
        </div>
      ))}
    </div>
  );
}
