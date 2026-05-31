# Promotion landing pages — keylounge.net

**Promo domain:** https://keylounge.net  
**Main shop:** https://vkeyshop.co  

Deploy this folder to **keylounge.net** (not `vkeyshop.co`).

## Do I need to register a new domain?

**Yes — for mass broadcast you should register a separate domain**, e.g. `vkeylive.com`, `vkeygo.net`.

You cannot “generate” a new root domain from your main site. Options:

| Option | Good for broadcast? | Notes |
|--------|---------------------|-------|
| **New domain** (recommended) | Yes | Register on Cloudflare/Namecheap → point to this static site |
| **Subdomain** e.g. `go.vkeyshop.co` | Risky | Still tied to main brand; some filters treat it as same site |
| **Main domain paths** e.g. `vkeyshop.co/vip` | No | Do not paste in cold mass messages |

## Quick deploy (no zip)

```bash
# once
npx wrangler login

# after editing config.js / CSS
npm run promo:deploy
```

## URL map (paste in WhatsApp / Telegram / X / Messenger)

Base: `https://keylounge.net`

| Broadcast path | Lands on |
|----------------|----------|
| `/vip/` | Main shop home |
| `/card/` | Main shop home (card focus) |
| `/live/` | Main shop home |
| `/month/` | Main shop home |
| `/season/` | Main shop home |
| `/year/` | Main shop home |
| `/trial/` | Main shop home |
| `/download/` | Download page |
| `/support/` | Support |
| `/order/` | Order lookup |

Each path adds UTM tags for analytics on the main site.

## Compliance

- 18+ only. Opt-in lists only. Include opt-out where possible.
- Do not use public shorteners (bit.ly) for adult broadcast — use your own domain.

See `../docs/PROMO_EN_COPY.md` for English message templates.
