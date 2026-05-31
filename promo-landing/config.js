/** Promo domain: keylounge.net → main shop vkeyshop.co */
window.PROMO_CONFIG = {
  PROMO_DOMAIN: "https://keylounge.net",
  MAIN_SITE: "https://vkeyshop.co",
  BRAND: "Key Lounge",
  AGE: "18+",
  /** Main-site marquee (EN primary for overseas broadcast) */
  PROMO_TAGLINE:
    "Add our support to claim your activation code — limited-time free trial!",
  CTA: "Claim Now →",
  LIMITED_BADGE: "Limited time",
  TRUST_LINE: "Instant delivery · Private & secure · 24/7 support",
  BENEFITS: [
    "VIP activation codes — delivered in minutes",
    "No signup required · Track your order anytime",
    "After-sales support on every purchase",
  ],
  FINE_PRINT:
    "Adults only (18+). By continuing you confirm you are of legal age in your region. Digital product — instant delivery after payment.",
  /** Seconds before auto-redirect (0 = button only, safer for WhatsApp) */
  AUTO_REDIRECT_SEC: 0,
  ROUTES: {
    vip: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=vip",
      title: "Private VIP Access",
      subtitle: "Premium live box apps · Members-only streams · 18+ only",
    },
    card: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=card",
      title: "Get Your VIP Code",
      subtitle: "Pick a plan · Pay securely · Receive your code instantly",
    },
    live: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=live",
      title: "Live & On-Demand VIP",
      subtitle: "Unlock premium streams tonight · Adults only",
    },
    month: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=month",
      title: "Monthly VIP Pass",
      subtitle: "Perfect to try it out · Best for first-time users",
    },
    season: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=season",
      title: "Quarterly VIP Pass",
      subtitle: "Better value · Same instant code delivery",
    },
    year: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=year",
      title: "Annual VIP Pass",
      subtitle: "Lowest daily cost · Long-term access",
    },
    trial: {
      target: "/?utm_source=broadcast&utm_medium=promo&utm_campaign=trial",
      title: "Start Tonight",
      subtitle: "Entry-level VIP codes in stock · Free trial via support",
    },
    download: {
      target: "/download?utm_source=broadcast&utm_medium=promo&utm_campaign=download",
      title: "Get the App First",
      subtitle: "Install the box app, then claim your activation code",
    },
    support: {
      target: "/support?utm_source=broadcast&utm_medium=promo&utm_campaign=support",
      title: "Talk to Support",
      subtitle: "Claim your free trial code · We reply fast",
    },
    order: {
      target: "/orders/lookup?utm_source=broadcast&utm_medium=promo&utm_campaign=order",
      title: "Track Your Order",
      subtitle: "Find your code by email or phone — anytime",
    },
  },
};
