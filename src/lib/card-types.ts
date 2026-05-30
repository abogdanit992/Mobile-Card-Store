export const CARD_TYPES = [
  { value: "monthly", label: "月卡 Monthly" },
  { value: "quarterly", label: "季卡 Quarterly" },
  { value: "annual", label: "年卡 Annual" },
  { value: "trial", label: "体验卡 Trial" },
] as const;

export type CardTypeValue = (typeof CARD_TYPES)[number]["value"];

export function cardTypeLabel(value: string | null | undefined): string {
  return CARD_TYPES.find((t) => t.value === value)?.label ?? "—";
}
