# Personal Portfolio

Portfolio pribadi dengan Next.js, Bootstrap, Supabase, dan Resend.

## Setup

Install dependency:

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`, lalu isi:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

SQL tabel Supabase:

```sql
create table contact_inquiries (
  id bigint primary key generated always as identity,
  name text not null,
  contact text not null,
  purpose text not null,
  budget text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table contact_inquiries enable row level security;
```

## Development

```bash
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```

## Deploy

Deploy ke Vercel, lalu isi environment variable yang sama seperti `.env.local` di dashboard Vercel.
