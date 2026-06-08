# The Admissions Atlas — Presentation Notes

## Tech Stack (1-liner)
Vite + React 19 + TypeScript + Tailwind CSS v4 frontend, Express backend (port 3000), Supabase for auth + database, Google Gemini API for AI features, Lucide icons, Framer Motion. Deployed on Vercel via a serverless Express function.

---

## 1-Minute Pitch Script

"The Admissions Atlas is a full-stack dashboard that helps high school and college students track scholarships, internships, college deadlines, and financial aid — all in one place.

We built it because the college admissions process is fragmented. You have spreadsheets for deadlines, bookmarks for scholarships, separate calculators for costs — nothing talks to each other.

The Atlas solves this with four core features:

**One** — An AI-powered scholarship and internship search. Type what you're looking for, and it pulls in real opportunities from across the web via the Gemini API, scores them for scam detection, and adds them directly to your list.

**Two** — A college deadline tracker with a built-in AI recommender. Tell it your interests — say "electrical engineering in Texas" — and it highlights matching schools from our database AND suggests new ones like UT Austin or Rice, complete with acceptance rates, tuition, and financial aid estimates.

**Three** — A cost calculator that takes the sticker price, subtracts average aid, and lets you model loan scenarios so you know what you'll actually pay.

**Four** — A resume scanner. Upload a PDF, and the AI extracts your GPA, major, skills, and extracurriculars, then scores every scholarship and internship against your profile — so you know exactly where you have the best shot.

Everything is persisted to Supabase, so your bookmarks, won awards, and preferences follow you across sessions. Admins get a panel for user management and data moderation.

Built with React and Express, styled with Material Design 3, and deployed serverlessly on Vercel."

---

## Key Demo Flows

### A. AI Scholarship Search
1. Click the sparkle icon → AI Search dialog opens
2. Type a query like "engineering for women" → click Search
3. Server calls Gemini → returns new scholarship entries merged with `isNew: true`
4. Cards appear at top with cyan "NEW" badge
5. Click NEW badge → badge dismisses (item stays)

### B. College Recommender (Deadlines tab)
1. Type "electrical engineering in Texas" in the College Recommender box
2. Click Find → server returns matches (existing schools highlighted with ring) + suggestions (new schools like UT Austin)
3. Suggested cards show "AI SUGGESTED" badge + italic reason text
4. Click to dismiss → badge/reason/highlight removed, card stays as regular entry
5. Custom colleges can also be added manually via "Add College" form

### C. Resume Scanner
1. Click "Upload Resume" in top bar
2. Drop a PDF → browser extracts text with pdfjs-dist (up to 5 pages)
3. POST to `/api/analyze-resume` → Gemini extracts profile (GPA, grade level, majors, skills)
4. Server scores all scholarships/internships against profile (/7 each)
5. Modal shows: profile card + matched scholarships + matched internships, sorted by score

### D. Cost Calculator
1. Navigate to Costs tab
2. Select a college → sticker price + average aid package auto-fill
3. Adjust loan amounts, interest rates → projections update live
4. Shows net cost, monthly payment, total repayment

### E. Bookmarks & Won List
1. Bookmark icon on any scholarship/internship card → added to favorites
2. Trophy icon → mark as won with editable dollar amount
3. Data syncs to Supabase user_metadata via `/api/user/save-data`
4. Overview dashboard shows bookmark count + total won value

### F. Admin Panel (hidden from regular users)
1. Sign in → upgrade via secret code → Admin tab appears
2. User table with promote/demote buttons
3. Promote by email
4. Reset database to seed defaults

---

## Key Architecture Details

### Frontend State Flow
- `src/App.tsx` always renders M3App (Holo files preserved but inactive)
- M3App manages all global state: scholarships[], internships[], bookmarks[], wonScholarships[], notifications[], toasts[]
- State persisted to localStorage + Supabase user_metadata
- Each tab gets its own panel component receiving props + callbacks

### Notification System
- `addNotification(title, message, type)` → creates NotificationItem with ISO timestamp + pushes to both sidebar list and toast stack
- Toast auto-dismisses after 4 seconds with slide-in-right animation
- Deadline checker runs on mount + every 30 minutes, checks all items for deadlines within 7 days
- Uses `useRef<Set<string>>` to prevent duplicate deadline alerts

### College Recommender Flow
1. POST `/api/colleges/recommend` with `{ interests: "..." }`
2. If GEMINI_API_KEY set: Gemini returns `{ matches: string[], suggestions: College[] }`
3. If no key: keyword fallback matches against name/specialization/location/tier
4. Frontend merges suggestions into displayed list with `id: "col-ai-suggest-{timestamp}-{index}"`
5. Dismissed suggestions get `dismissed: true` flag (card stays visible)

### Security Hardening
- Rate limiting: general (500/15min), AI (10/15min), auth (30/15min), sensitive (5/hour)
- Input sanitization strips control chars + enforces length limits
- Prompt injection guardrails: user input wrapped in `<USER_INPUT>` tags
- Body size limited to 100KB
- Admin endpoints check `requireAdmin()` against Supabase user_metadata.role

---

## Q&A Prep

### Q: How is this different from just using a spreadsheet?
A: It's integrated — bookmarks, won awards, cost calculations, and AI recommendations all talk to each other. Bookmark a scholarship, and the deadline tracker alerts you when it's due. Mark something as won, and the calculator updates your total. A spreadsheet can't do that.

### Q: How do you handle fake or scam scholarships?
A: The AI search flags scam indicators during discovery. Each result includes a `scamFlag` field and reason. Scam-flagged items show a visible warning badge. We also have a verified badge for trusted sources.

### Q: What if I don't have a Gemini API key?
A: Everything still works. The AI features gracefully fall back to keyword matching and our pre-seeded database of 7 scholarships, 7 internships, and 14 colleges. You lose the AI-powered discovery but the core tracking features are fully functional.

### Q: How is data persisted?
A: When signed in, all data stores to Supabase user_metadata via the service key. When not signed in, it falls back to localStorage. Bookmarks, won awards, preferences, custom colleges, and dismissed-new-IDs all sync automatically.

### Q: What stacks did you use?
A: Vite + React 19 + TypeScript + Tailwind v4 frontend, Express backend, Supabase for auth and data, Google Gemini for AI features. Deployed as a Vercel serverless function.

### Q: Can multiple users share data?
A: Not currently — each user has their own Supabase auth session with isolated user_metadata. We could add team/shared boards as a future feature.

### Q: How long did this take to build?
A: (Your answer)

### Q: What would you add next?
A: Team collaboration, mobile app with push notifications, integration with Common App and FAFSA, and a recommendation engine that learns from user behavior.
