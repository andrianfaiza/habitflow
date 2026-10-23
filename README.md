# HabitFlow — To Do List & Habit Tracker

A simple *To-Do List & Habit Tracker* built with **React (Vite) + Tailwind CSS v3 + Supabase**, styled with **Material 3 Expressive** (Lavender/Purple theme `#6750A4`) and **Light/Dark mode** support.

## Features (MVP)

- Email & password authentication (Supabase Auth + RLS).
- Task management: add, edit, delete, mark as done, priority, due date & time, plus **color tags** (Orange, Lavender, Blue, Mint, Amber, Pink).
- Habit tracker: add, edit, delete, daily check-in, and **color tags** to tell habits apart.
- Automatic **streak** calculation (current & best streak).
- Daily progress summary, category & priority filters, and empty states.
- Interactive **Notification Center** in the navbar: unread count badge, dropdown
  containing task deadline reminders (today/tomorrow), habits that have not been
  checked in, and streak achievements — with *Mark as Read* & *Delete Notification*
  actions.
- **Profile page**: change avatar (presets), user statistics (Total Habits,
  Completed Tasks, Highest Streak), a GitHub-style **habit contribution heatmap**
  (last 12 months, darker as more habits are checked in), change name & bio
  (`profiles` table), and change password.
- Interactive **topbar calendar** on the Dashboard: a date strip that scrolls
  horizontally without bounds, a month/year header that follows the date in the
  middle of the screen, a **Today** button, and a date-based task filter
  (Today = today's tasks + overdue tasks; other dates = tasks with that due
  date). Under each date there is a **colored dot indicator** matching the
  task/habit tag (maximum 3 dots, the rest are marked `+N`). Tasks appear on
  their due date, while daily habits appear on every date.
- **Settings page**: notification preferences, completion sound effect, JSON data
  export, data reset, and account deletion.
- Responsive layout (desktop & mobile) + theme toggle, with Material 3
  Lavender accents (`#6750A4`), `rounded-3xl` cards, large checkboxes with a
  ripple effect, *soft pill* priority badges, and subtle hover effects.

## Tech Stack

- React 19 + Vite
- React Router (`react-router-dom`)
- React Activity Calendar (`react-activity-calendar`)
- Tailwind CSS v3
- `@supabase/supabase-js`
- `lucide-react`

## Running the Project

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure the environment**
   Copy `.env.example` to `.env`, then fill in your Supabase credentials:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_SUPABASE_URL=https://<project>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>
   ```

3. **Prepare the database**
   Open **Supabase Dashboard → SQL Editor**, then run the contents of
   [`supabase/schema.sql`](./supabase/schema.sql). This file creates the
   `tasks`, `habits`, `habit_logs`, and `profiles` tables, along with indexes,
   the `updated_at` trigger, the `handle_new_user` trigger (creates a profile
   automatically on sign-up), the `delete_current_user` RPC function (account
   deletion), and **Row Level Security (RLS)** policies.

   > If you have already run a previous version of the schema, **run this file
   > again** so the `profiles` table and its new policies are created, and so
   > the `color` column is added to the `tasks` & `habits` tables.
   > The file is idempotent (safe to run repeatedly).

4. **Run the application**

   ```bash
   npm run dev
   ```

   Open `http://localhost:5173`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Folder Structure

```
src/
├── components/
│   ├── common/     # Button, Input, Modal, Badge, Loader, EmptyState, FilterChips,
│   │               # Toggle, Avatar, ConfirmDialog, ColorPicker
│   ├── calendar/   # TopbarCalendar (horizontally scrollable date strip)
│   ├── layout/     # Header, Navbar, Container, NotificationBell
│   ├── tasks/      # TaskCard, TaskList, TaskGroupSection, TaskForm, PriorityFilter
│   └── habits/     # HabitCard, HabitList, HabitForm, StreakCounter, HabitHeatmap
├── context/        # AuthProvider, ThemeProvider, ProfileProvider, DataProvider
├── hooks/          # useAuth, useTheme, useTasks, useHabits, useData, useProfile, useNotifications
├── i18n/           # Translation dictionaries and the t() helper
├── lib/            # supabaseClient.js
├── pages/
│   ├── Auth/       # Login, Register, AuthScreen
│   ├── Dashboard/  # Home
│   └── Profile/    # UserProfile, Settings
├── services/       # taskService, habitService, profileService
├── utils/          # dateUtils, streakUtils, soundUtils, constants, taskGroups
├── App.jsx
├── main.jsx
└── index.css
```

## Architecture Notes

- **Routing:** the Dashboard, Profile, and Settings pages each have their own
  URL (`/`, `/profile`, `/settings`) using `react-router-dom`
  (`BrowserRouter` + `Routes`). Navigation uses `NavLink` so the active tab is
  determined automatically from the URL.
- **Optimistic updates:** checking off a task/habit updates the UI immediately;
  if it fails, the state is *rolled back*.
- **Habit log dates** always use a local `YYYY-MM-DD` string (see
  `utils/dateUtils.js`) so the day never shifts because of time zone
  differences.
- **Streaks** are calculated from the `habit_logs` history (see
  `utils/streakUtils.js`).
- The **contribution heatmap** uses `react-activity-calendar`; the number of
  check-ins per date is aggregated from `habit_logs` and then mapped to 5
  intensity levels.
- **Smart task view:** the "Today" view splits the task list into three groups
  relative to today (see `utils/taskGroups.js`): **Overdue** (past due and
  still open), **Today** (due today, plus undated open tasks), and **Upcoming**
  (due later). Overdue and Upcoming only render when they have items, and the
  group titles come from the i18n dictionary (`i18n/locales/en.js`).
- **Check-in feedback:** a task that was just checked stays in the list with a
  strikethrough and a dimmed card. The completed ids are tracked in memory
  (`sessionCompleted` in `Home.jsx`), so they disappear again when the user
  switches the selected day, when the calendar day rolls over, or on reload.
- **Dashboard date filter:** any date other than "Today" only shows tasks with
  that `due_date`.
- **Color tags** are stored as palette ids (`orange`, `lavender`, `blue`,
  `mint`, `amber`, `pink`) in the `color` column of the `tasks` & `habits`
  tables. The hex value is used for card accents and calendar dots via inline
  styles so it stays safe from Tailwind purging.
- **Scroll restoration:** every route change resets the scroll position to the
  top so a new page (for example Profile) does not open blank because it
  inherited the scroll offset from the previous page.
- **DataProvider** shares the task & habit state across the whole application
  (Dashboard, notifications, profile) so the data is only fetched once.
- **Notifications** are derived dynamically from real data (`tasks` &
  `habits`); the read/deleted status is stored in `localStorage`.
- **Preferences** (notifications & sound) are stored in `profiles.preferences`
  (JSONB), while the **name, bio, and avatar** are stored in the `profiles`
  table.
- **Account deletion** calls the `delete_current_user` RPC (SECURITY DEFINER),
  which only deletes the currently signed-in user.
- **Sound effects** use the Web Audio API (`utils/soundUtils.js`) with no audio
  files or extra libraries.

## Deploy

Deploy the frontend to **Vercel** or **Netlify**, with the backend & database
on **Supabase Cloud**. Make sure the same environment variables are set in the
hosting dashboard.
