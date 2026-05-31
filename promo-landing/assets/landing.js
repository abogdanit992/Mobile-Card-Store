(function () {
  const cfg = window.PROMO_CONFIG;
  if (!cfg) return;

  const slug =
    document.body.dataset.slug ||
    location.pathname.replace(/^\/+|\/+$/g, "").split("/")[0] ||
    "vip";

  const route = cfg.ROUTES[slug] || cfg.ROUTES.vip;
  const dest = new URL(route.target, cfg.MAIN_SITE).toString();

  const promoBar = document.getElementById("promo-bar");
  if (promoBar && cfg.PROMO_TAGLINE) {
    const line = cfg.PROMO_TAGLINE + "  ★  " + cfg.PROMO_TAGLINE;
    promoBar.innerHTML =
      '<div class="promo-bar-inner"><span>' +
      line +
      "</span><span>" +
      line +
      "</span></div>";
  }

  const limited = document.getElementById("limited");
  if (limited) limited.textContent = cfg.LIMITED_BADGE || "Limited time";

  document.getElementById("title").textContent = route.title;

  const callout = document.getElementById("promo-callout");
  if (callout && cfg.PROMO_TAGLINE) {
    callout.innerHTML = "<strong>" + cfg.PROMO_TAGLINE + "</strong>";
  }

  document.getElementById("subtitle").textContent = route.subtitle;

  const benefits = document.getElementById("benefits");
  if (benefits && cfg.BENEFITS) {
    benefits.innerHTML = cfg.BENEFITS.map(function (b) {
      return "<li>" + b + "</li>";
    }).join("");
  }

  document.getElementById("badge").textContent = cfg.AGE + " · " + cfg.BRAND;

  const btn = document.getElementById("cta");
  btn.href = dest;
  btn.textContent = cfg.CTA || "Claim Now →";

  const trust = document.getElementById("trust");
  if (trust) trust.textContent = cfg.TRUST_LINE || "";

  const fine = document.getElementById("fine");
  if (fine) fine.textContent = cfg.FINE_PRINT || "";

  const sec = Number(cfg.AUTO_REDIRECT_SEC || 0);
  if (sec > 0) {
    const el = document.getElementById("timer");
    el.hidden = false;
    let left = sec;
    el.textContent = "Redirecting in " + left + "s…";
    const t = setInterval(function () {
      left -= 1;
      if (left <= 0) {
        clearInterval(t);
        location.href = dest;
      } else {
        el.textContent = "Redirecting in " + left + "s…";
      }
    }, 1000);
  }
})();
