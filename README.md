# The Admissions Atlas

A full-stack scholarship, internship, and college admissions planning tool. Track opportunities, manage deadlines, calculate financial aid, and get AI-powered recommendations — all in one dashboard.

## Tech Stack

- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4
- **Backend:** Express server (port 3000) with Vite middleware in dev mode
- **Database/Auth:** Supabase (anon key + service key)
- **AI:** Google Gemini API for search, resume analysis, and college recommendations
- **Icons:** Lucide React
- **Animation:** Framer Motion (M3 theme)

## Features

- **Scholarships & Internships** — Browse, search, filter, bookmark, and mark as won with editable amounts. AI-powered search discovers new opportunities via Gemini.
- **College Deadlines** — Track ED/RD deadlines, tuition, acceptance rates, and financial aid estimates. AI college recommender suggests matches and discovers new schools.
- **Cost Calculator** — Net price projection with borrowing scenarios and repayment estimates.
- **Resume Scanner** — Upload a PDF or TXT resume for AI-powered profile extraction and match scoring against scholarships/internships.
- **Admin Panel** — User management, role promotion, data reset.
- **Bookmarks & Won List** — Save favorites and track secured awards with persistence across sessions.
- **Notifications & Alerts** — Toast notifications for bookmark/won toggles, deadline reminders within 7 days, and AI search results.
- **Deadline Alerts** — Automatic checks every 30 minutes for opportunities closing within 7 days.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (Express + Vite)
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key (client-side) |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key (server-side) |
| `GEMINI_API_KEY` | No | Google Gemini API key — enables AI search, resume analysis, and college recommendations |
| `ADMIN_SECRET_CODE` | No | Secret code to promote a user to admin (default: `ADMIN2026`) |

## Project Structure

```
├── server.ts                     # Express server with all API routes
├── src/
│   ├── App.tsx                   # Root — lazy-loads the M3 theme
│   ├── main.tsx                  # React entry point
│   ├── types.ts                  # Shared TypeScript interfaces
│   ├── supabaseClient.ts         # Supabase client singleton
│   ├── data/colleges.ts          # Static college data (14 schools)
│   ├── components/               # Shared components (AdminPanel, ToastContainer)
│   └── themes/
│       ├── m3/                   # Material Design 3 theme
│       │   ├── App.tsx
│       │   └── components/       # Per-tab panels + AuthModal + ResumeScannerModal
│       └── holo/                 # Android Holo theme (files preserved)
│           ├── App.tsx
│           └── components/
└── vercel-deploy/                # Standalone Vercel deployment package
    ├── api/index.ts              # Serverless Express function
    ├── vercel.json
    ├── migration.sql             # Supabase table schemas
    └── public/                   # Built frontend assets
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/scholarships` | List all scholarships |
| POST | `/api/scholarships/update` | AI search and merge scholarships |
| GET | `/api/internships` | List all internships |
| POST | `/api/internships/update` | AI search and merge internships |
| POST | `/api/analyze-resume` | Extract profile and score matches from resume text |
| POST | `/api/colleges/recommend` | AI college recommendations with suggestions |
| POST | `/api/auth/profile` | Get user role from Supabase |
| POST | `/api/auth/upgrade-admin` | Promote user to admin |
| POST | `/api/user/save-data` | Save user preferences/bookmarks/won to Supabase |
| GET | `/api/user/load-data` | Load user preferences/bookmarks/won |
| GET | `/api/admin/users` | List all users (admin) |
| POST | `/api/admin/users/role` | Change user role (admin) |
| POST | `/api/admin/promote-by-email` | Promote user by email (admin) |
| POST | `/api/reset` | Reset data to defaults (admin) |

## Deploying to Vercel

```bash
cd vercel-deploy
npm run build:frontend   # Builds Vite app, copies into public/
vercel deploy --prod
```

Set environment variables in the Vercel Dashboard under Project → Settings → Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `GEMINI_API_KEY` (optional)
- `ADMIN_SECRET_CODE` (optional)

Run `vercel-deploy/migration.sql` in your Supabase SQL Editor to create the required tables before deploying.
