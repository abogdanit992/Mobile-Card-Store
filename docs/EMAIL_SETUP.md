# Email setup (vkeyshop.co)

DNS for `vkeyshop.co` is on **Cloudflare** (not Hostija). Use Cloudflare for domain email routing; use Supabase (or Resend/SMTP) for **registration verification** emails.

## 1. Registration sender (Supabase Auth)

**Goal:** Users receive “confirm your email” from something like `noreply@vkeyshop.co`.

### Option A – Supabase built-in (quick test)

Supabase Dashboard → **Authentication** → **Email** → use default sender (limited; not ideal for production).

### Option B – Custom SMTP (recommended)

1. Create a sending subdomain or use a provider (Resend, SendGrid, Amazon SES, etc.).
2. Add DNS records the provider gives you (SPF, DKIM) in **Cloudflare** for `vkeyshop.co`.
3. Supabase Dashboard → **Project Settings** → **Authentication** → **SMTP Settings**:
   - Host / port / user / password from provider
   - Sender: `noreply@vkeyshop.co` (or `auth@vkeyshop.co`)
4. **Authentication** → **URL configuration**:
   - Site URL: `https://vkeyshop.co`
   - Redirect URLs:
     - `https://vkeyshop.co/auth/callback`
     - `https://admin.vkeyshop.co/auth/callback`
5. Vercel env: `NEXT_PUBLIC_SITE_URL=https://vkeyshop.co`

## 2. Support inbox (domain forwarding)

**Goal:** `support@vkeyshop.co` (or `kefu@`) forwards to your personal Gmail/QQ mailbox.

### Cloudflare Email Routing (free)

1. Cloudflare → domain `vkeyshop.co` → **Email** → **Email Routing** → Enable.
2. **Destination addresses:** verify your real inbox (e.g. `you@gmail.com`).
3. **Routing rules:**
   - `support@vkeyshop.co` → your inbox
   - Optional: `kefu@vkeyshop.co`, `hello@vkeyshop.co` → same inbox
4. Cloudflare adds MX records automatically; do not use Hostija mail after NS points to Cloudflare.

### Sending vs receiving

| Purpose              | Tool                          |
|----------------------|-------------------------------|
| Register / verify    | Supabase SMTP or Resend       |
| Customer support     | Cloudflare Email Routing      |

## 3. After deploy checklist

Run the Supabase SQL files **in this order** (SQL Editor):

1. `supabase-schema.sql`
2. `supabase-rls-and-seed.sql`
3. `supabase-order-flow-policies.sql`
4. `supabase-seed-cards.sql`
5. `supabase-admin-products-policies.sql`
6. `supabase-admin-remaining-policies.sql`
7. `supabase-migration-p0-p1.sql` (admins + contact fields)
8. `supabase-migration-platforms.sql` (legacy category_sort + covers)
9. `supabase-migration-cms-payments.sql` ← **NEW** (categories, platform_downloads, payment_channels, payments, site_settings, bilingual product fields)

Then:

- [ ] Insert your admin email into `public.admins`
- [ ] Vercel env:
  - `NEXT_PUBLIC_SITE_URL=https://vkeyshop.co`
  - `ADMIN_HOST=admin.vkeyshop.co`
  - `SUPABASE_SERVICE_ROLE_KEY=...` ← **NEW, required for payments + webhooks** (Supabase → Project Settings → API → service_role key). Server-only; never expose.
- [ ] Test register on `https://vkeyshop.co/register`
- [ ] Test admin at `https://admin.vkeyshop.co/login` (no `/admin` in URL)

## 4. Payment channels

Configure in admin → **支付通道 Payments** (`admin.vkeyshop.co/payments`). A channel only
appears at checkout when **Enabled** is on. Keys live in the DB `config` (server-only).

| Provider  | Config fields                          | Webhook URL to register with provider                 |
|-----------|----------------------------------------|-------------------------------------------------------|
| Cryptomus | `merchant_id`, `payment_api_key`       | `https://vkeyshop.co/api/payments/webhook/cryptomus`  |
| Stripe    | `secret_key`, `webhook_secret`         | `https://vkeyshop.co/api/payments/webhook/stripe`     |
| PayPal    | `client_id`, `client_secret`, `mode`   | (captured on return; webhook optional)                |

Flow: checkout → `/api/payments/create` → provider redirect → pay →
webhook marks order paid + allocates a card → buyer lands on `/cards?orderId=`.

## 4b. Guest checkout, card email & customer profiles

- **No account needed to buy.** At checkout the buyer enters an **email OR a phone
  number** (at least one). After paying they land on `/cards?orderId=` to copy the
  code, and can later look it up at `/orders/lookup` by email or phone.
- **Card email:** if the buyer gave an email, the code is emailed automatically on
  payment confirmation — requires `RESEND_API_KEY` + `EMAIL_FROM` (see env above).
  If unset, the card is still viewable on the site (delivery just isn't emailed).
  Verify your sending domain in Resend and add its DNS records in Cloudflare.
- **Customer profiles:** every paid order upserts a row in `public.customers`
  (email/phone, order_count, total_spent, last_order_at). View + export CSV in
  admin → **客户档案 Customers** (`admin.vkeyshop.co/customers`) for mass campaigns.

## 5. Languages

Admin → **站点设置 Settings** (`admin.vkeyshop.co/settings`):
- Default language = English; storefront shows a EN/中文 switch.
- To hide Chinese at launch: uncheck 中文 under "Enabled languages".
- Product / category / platform names have EN + 中文 fields in their admin forms.
