# HabitFlow — To Do List & Habit Tracker

Aplikasi *To-Do List & Habit Tracker* sederhana berbasis **React (Vite) + Tailwind CSS v3 + Supabase** dengan gaya **Material 3 Expressive** (tema Lavender/Purple `#6750A4`) dan dukungan **Light/Dark mode**.

## Fitur (MVP)

- Autentikasi email & password (Supabase Auth + RLS).
- Manajemen tugas: tambah, edit, hapus, tandai selesai, prioritas, tanggal & waktu tenggat, serta **tag warna** (Orange, Lavender, Blue, Mint, Amber, Pink).
- Habit tracker: tambah, edit, hapus, check-in harian, dan **tag warna** untuk membedakan kebiasaan.
- Penghitungan **streak** otomatis (current & best streak).
- Ringkasan progres harian, filter kategori & prioritas, serta empty states.
- **Pusat Notifikasi** interaktif di navbar: badge jumlah belum dibaca, dropdown
  berisi pengingat tenggat tugas (hari ini/besok), habit yang belum dicentang, dan
  pencapaian streak — dengan aksi *Tandai Dibaca* & *Hapus Notifikasi*.
- **Halaman Profil**: ubah avatar (preset), statistik pengguna (Total Habits,
  Completed Tasks, Highest Streak), **heatmap kontribusi habit** ala GitHub
  (12 bulan terakhir, semakin gelap saat makin banyak habit dicentang), ubah
  nama & bio (tabel `profiles`), dan ubah kata sandi.
- **Kalender topbar interaktif** di Dashboard: strip tanggal yang bisa di-scroll
  horizontal tanpa batas, header bulan/tahun yang otomatis mengikuti tanggal di
  tengah layar, tombol **Hari Ini**, serta filter tugas berdasarkan tanggal
  (Hari Ini = tugas hari ini + tugas menunggak; tanggal lain = tugas dengan
  tenggat tanggal tersebut). Di bawah setiap tanggal terdapat **dot indicator**
  berwarna sesuai tag tugas/habit (maksimal 3 dot, sisanya ditandai `+N`).
  Task muncul pada tanggal tenggatnya, sedangkan habit harian muncul di semua
  tanggal.
- **Halaman Pengaturan**: preferensi notifikasi, efek suara penyelesaian, ekspor
  data ke JSON, reset data, dan hapus akun.
- Tampilan responsif (desktop & mobile) + toggle tema, dengan aksen Material 3
  Lavender (`#6750A4`), kartu `rounded-3xl`, checkbox besar dengan efek ripple,
  badge prioritas *soft pill*, dan efek hover halus.

## Tech Stack

- React 19 + Vite
- React Router (`react-router-dom`)
- React Activity Calendar (`react-activity-calendar`)
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
   > terbuat, dan agar kolom `color` pada tabel `tasks` & `habits` ditambahkan.
   > File bersifat idempoten (aman dijalankan berulang).

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
│   │               # Toggle, Avatar, ConfirmDialog, ColorPicker
│   ├── calendar/   # TopbarCalendar (strip tanggal scroll horizontal)
│   ├── layout/     # Header, Navbar, Container, NotificationBell
│   ├── tasks/      # TaskCard, TaskList, TaskForm, PriorityFilter
│   └── habits/     # HabitCard, HabitList, HabitForm, StreakCounter, HabitHeatmap
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
- **Heatmap kontribusi** menggunakan `react-activity-calendar`; jumlah check-in
  per tanggal diagregasi dari `habit_logs` lalu dipetakan ke 5 level intensitas.
- **Filter tanggal Dashboard**: tampilan "Hari Ini" menampilkan tugas hari ini,
  tugas menunggak yang belum selesai, dan tugas tanpa tanggal yang belum
  selesai; tanggal lain hanya menampilkan tugas dengan `due_date` tersebut.
- **Color tags** disimpan sebagai id palet (`orange`, `lavender`, `blue`, `mint`,
  `amber`, `pink`) pada kolom `color` di tabel `tasks` & `habits`. Nilai hex
  dipakai untuk aksen kartu dan dot kalender melalui inline style agar tetap
  aman dari purging Tailwind.
- **Scroll restoration**: setiap perubahan route mereset posisi scroll ke atas
  sehingga halaman baru (misalnya Profil) tidak terbuka dalam keadaan kosong
  karena mewarisi offset scroll dari halaman sebelumnya.
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
