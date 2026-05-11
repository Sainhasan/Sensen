# Personal Portfolio

Portfolio pribadi dengan Next.js, Bootstrap, Supabase, dan Resend. Project ini punya halaman portfolio dan form kontak yang menyimpan inquiry ke Supabase lalu mengirim notifikasi ke email.

## Yang Perlu Diketahui

- Project ini memakai Next.js App Router.
- Form kontak butuh Supabase untuk database dan Resend untuk kirim email.
- File `.env.local` tidak ikut Git karena berisi secret.
- File `.env.example` hanya template nama environment variable.
- `SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di server/API route. Jangan ubah menjadi `NEXT_PUBLIC_`.

## Cara Pakai dari Repo Ini

1. Clone atau fork repo ini.

```bash
git clone <url-repo-kamu>
cd <nama-folder-project>
```

2. Install dependency.

```bash
npm install
```

3. Buat file environment lokal.

```bash
cp .env.example .env.local
```

Di Windows PowerShell bisa pakai:

```powershell
Copy-Item .env.example .env.local
```

4. Isi `.env.local`.

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

Keterangan:

- `SUPABASE_URL`: URL project Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key dari Supabase, khusus server.
- `RESEND_API_KEY`: API key dari Resend.
- `CONTACT_TO_EMAIL`: email tujuan notifikasi.
- `CONTACT_FROM_EMAIL`: email pengirim yang sudah valid di Resend.

5. Buat tabel Supabase.

Jalankan SQL ini di Supabase SQL Editor:

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

6. Jalankan project.

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Cek Sebelum Deploy

```bash
npm run lint
npm run build
```

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import repo dari dashboard Vercel.
3. Masuk ke `Settings -> Environment Variables`.
4. Tambahkan semua variable dari `.env.local`.
5. Deploy ulang setelah env selesai diisi.

## Catatan untuk yang Mau Copy

Silakan pakai struktur project ini sebagai referensi, tapi ganti konten portfolio, warna, email, dan credential dengan milik sendiri. Jangan upload `.env.local`, `.vercel`, `node_modules`, atau `.next` ke GitHub.
