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

- [ ] Run `supabase-migration-p0-p1.sql` (admins table + contact fields)
- [ ] Insert your admin email into `public.admins`
- [ ] Run `supabase-migration-platforms.sql` (category + covers)
- [ ] Vercel: `NEXT_PUBLIC_SITE_URL`, `ADMIN_HOST=admin.vkeyshop.co`
- [ ] Test register on `https://vkeyshop.co/register`
- [ ] Test admin at `https://admin.vkeyshop.co/login` (no `/admin` in URL)
