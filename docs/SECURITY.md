# Security hardening (vkeyshop.co)

## Deploy checklist (run today)

### 1. Supabase SQL (required)

Run in **SQL Editor**:

```
supabase-migration-security-hardening.sql
```

This locks `orders`, `cards`, and `products` so anonymous clients cannot read card codes or mutate orders.

### 2. Vercel env

| Variable | Notes |
|----------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server only — never `NEXT_PUBLIC_` |
| `CRON_SECRET` | Long random string; **Bearer header only** (see below) |
| `IMAGE_PROXY_ALLOWED_HOSTS` | Optional comma list, e.g. `your-cdn.com` |

### 3. Cron job (Tron watch)

Use **Authorization header**, not URL query:

```
GET https://vkeyshop.co/api/payments/cron/tron-watch
Authorization: Bearer YOUR_CRON_SECRET
```

Update cron-job.org / external cron if you previously used `?secret=`.

### 4. Admin account

- Supabase → **Authentication → Users** → strong password
- Enable **MFA** on admin email (Supabase dashboard)
- Confirm your email is in `public.admins`

---

## What changed (P0–P2)

| Area | Fix |
|------|-----|
| **RLS** | No public read/update on `orders` / `cards`; products read active only |
| **Card page** | Option B: must re-enter checkout email or phone |
| **Order lookup** | Server-side only (service role) + IP rate limit |
| **Admin export** | Requires logged-in admin |
| **Admin actions** | All server actions call `requireAdminForAction()` |
| **Cron** | `?secret=` removed — Bearer only |
| **Image proxy** | Host allowlist (`vipfkk.com`, `supabase.co`, …) |
| **Audit log** | `admin_audit_log` table for sensitive admin ops |

---

## Card delivery flow (after fix)

1. User pays → redirected to `/cards?orderId=…`
2. User enters **same email or phone** used at checkout
3. Server verifies match → shows code

From **Track Order**, links include email/phone in URL so users don't type twice.

---

## Cloudflare (recommended)

- **WAF** → rate limit `/api/payments/*` and `/orders/lookup`
- **Bot Fight Mode** on `vkeyshop.co`
- Keep admin on `admin.vkeyshop.co` only

---

## Backups

Supabase → **Project Settings → Database → Backups** (enable on Pro, or manual pg_dump on schedule).

---

## Verify RLS is active

In browser devtools, if someone tries:

```js
// Should FAIL after migration (permission denied or empty)
fetch(SUPABASE_URL + '/rest/v1/cards?select=code', {
  headers: { apikey: ANON_KEY, Authorization: 'Bearer ' + ANON_KEY }
})
```

---

## Reporting issues

If checkout or card delivery breaks after migration, confirm SQL ran and redeploy latest Vercel build.
