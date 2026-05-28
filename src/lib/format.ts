export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Sultry dark-theme card cover gradients (no explicit imagery). */
export function productGradientClass(seed: string) {
  const palettes = [
    "from-rose-700 via-fuchsia-800 to-[#1a0510]",
    "from-red-600 via-pink-700 to-purple-950",
    "from-fuchsia-700 via-purple-800 to-black",
    "from-orange-600 via-rose-700 to-[#150810]",
    "from-violet-700 via-fuchsia-900 to-black",
    "from-pink-600 via-rose-800 to-[#0d0612]",
  ];
  const index =
    seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    palettes.length;
  return palettes[index];
}

export function productBadge(seed: string) {
  const badges = ["HOT", "VIP", "NEW", "18+"];
  const index =
    seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    badges.length;
  return badges[index];
}
