# Mobile Card Store

Mobile-first card distribution system built with Next.js App Router, Tailwind CSS, and Supabase.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (`@supabase/supabase-js`, `@supabase/ssr`)

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Initial Route Structure

- `/` user product list entry page
- `/products/[id]` product detail
- `/checkout` create order / payment flow
- `/payment/success` payment success callback
- `/cards` card delivery page
- `/account` user center
- `/admin` admin dashboard entry
- `/admin/products` product management
- `/admin/orders` order management
- `/admin/cards` card inventory management
- `/admin/users` user management
