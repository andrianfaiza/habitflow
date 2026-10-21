# HabitFlow — To Do List & Habit Tracker

Aplikasi *To-Do List & Habit Tracker* sederhana berbasis **React (Vite) + Tailwind CSS v3 + Supabase** dengan gaya **Material 3 Expressive** (tema Lavender/Purple `#6750A4`) dan dukungan **Light/Dark mode**.

## Fitur (MVP)

- Autentikasi email & password (Supabase Auth + RLS).
- Manajemen tugas: tambah, edit, hapus, tandai selesai, prioritas, tanggal & waktu tenggat.
- Habit tracker: tambah, edit, hapus, check-in harian.
- Penghitungan **streak** otomatis (current & best streak).
- Ringkasan progres harian, filter kategori & prioritas, serta empty states.
- **Pusat Notifikasi** interaktif di navbar: badge jumlah belum dibaca, dropdown
  berisi pengingat tenggat tugas (hari ini/besok), habit yang belum dicentang, dan
  pencapaian streak — dengan aksi *Tandai Dibaca* & *Hapus Notifikasi*.
- **Halaman Profil**: ubah avatar (preset), statistik pengguna (Total Habits,
  Completed Tasks, Highest Streak), ubah nama & bio (tabel `profiles`), dan ubah
  kata sandi.
- **Halaman Pengaturan**: preferensi notifikasi, efek suara penyelesaian, ekspor
  data ke JSON, reset data, dan hapus akun.
- Tampilan responsif (desktop & mobile) + toggle tema, dengan aksen Material 3
  Lavender (`#6750A4`), kartu `rounded-3xl`, checkbox besar dengan efek ripple,
  badge prioritas *soft pill*, dan efek hover halus.

## Tech Stack

- React 19 + Vite
- React Router (`react-router-dom`)
- Tailwind CSS v3
- `@supabase/supabase-js`
- `lucide-react`

## Menjalankan Proyek

1. **Install dependency**

   ```bash
   npm install
   ```

2. **Konfigurasi environment**
   Salin `.env.example` menjadi `.env`, lalu isi kredensial Supabase:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   ```

3. **Siapkan database**
   Buka **Supabase Dashboard → SQL Editor**, lalu jalankan isi file
   [`supabase/schema.sql`](./supabase/schema.sql). File ini membuat tabel
   `tasks`, `habits`, `habit_logs`, dan `profiles`, beserta indeks, trigger
   `updated_at`, trigger `handle_new_user` (membuat profil otomatis saat
   sign-up), fungsi RPC `delete_current_user` (hapus akun), dan kebijakan
   **Row Level Security (RLS)**.

   > Jika kamu sudah pernah menjalankan versi schema sebelumnya, **jalankan
   > ulang** file ini agar tabel `profiles` beserta kebijakan barunya ikut
   > terbuat. File bersifat idempoten (aman dijalankan berulang).

4. **Jalankan aplikasi**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:5173`.

## Skrip

| Perintah | Keterangan |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan |
| `npm run build` | Build produksi |
| `npm run preview` | Pratinjau hasil build |
| `npm run lint` | Menjalankan ESLint |

## Struktur Folder

```
src/
├── components/
│   ├── common/     # Button, Input, Modal, Badge, Loader, EmptyState, FilterChips,
│   │               # Toggle, Avatar, ConfirmDialog
│   ├── layout/     # Header, Navbar, Container, NotificationBell
│   ├── tasks/      # TaskCard, TaskList, TaskForm, PriorityFilter
│   └── habits/     # HabitCard, HabitList, HabitForm, StreakCounter
├── context/        # AuthProvider, ThemeProvider, ProfileProvider, DataProvider
├── hooks/          # useAuth, useTheme, useTasks, useHabits, useData, useProfile, useNotifications
├── lib/            # supabaseClient.js
├── pages/
│   ├── Auth/       # Login, Register, AuthScreen
│   ├── Dashboard/  # Home
│   └── Profile/    # UserProfile, Settings
├── services/       # taskService, habitService, profileService
├── utils/          # dateUtils, streakUtils, soundUtils, constants
├── App.jsx
├── main.jsx
└── index.css
```

## Catatan Arsitektur

- **Routing:** halaman Dasbor, Profil, dan Pengaturan masing-masing memiliki URL
  sendiri (`/`, `/profile`, `/settings`) menggunakan `react-router-dom`
  (`BrowserRouter` + `Routes`). Navigasi memakai `NavLink` sehingga tab aktif
  ditentukan otomatis dari URL.
- **Optimistic updates:** mencentang tugas/habit langsung memperbarui UI; bila
  gagal, state di-*rollback*.
- **Tanggal log habit** selalu memakai string lokal `YYYY-MM-DD` (lihat
  `utils/dateUtils.js`) agar tidak terjadi selisih hari akibat perbedaan zona waktu.
- **Streak** dihitung dari riwayat `habit_logs` (lihat `utils/streakUtils.js`).
- **DataProvider** membagikan state tugas & habit ke seluruh aplikasi
  (Dashboard, notifikasi, profil) sehingga hanya ada satu kali fetch.
- **Notifikasi** diturunkan secara dinamis dari data nyata (`tasks` & `habits`);
  status *dibaca/dihapus* disimpan di `localStorage`.
- **Preferensi** (notifikasi & suara) disimpan di `profiles.preferences` (JSONB),
  sedangkan **nama, bio, dan avatar** disimpan di tabel `profiles`.
- **Hapus akun** memanggil RPC `delete_current_user` (SECURITY DEFINER) yang
  hanya menghapus user yang sedang login.
- **Efek suara** menggunakan Web Audio API (`utils/soundUtils.js`) tanpa file
  audio atau library tambahan.

## Deploy

Deploy frontend ke **Vercel** atau **Netlify**, dengan backend & database di
**Supabase Cloud**. Pastikan environment variable yang sama diatur di dashboard
hosting.
