# Agent Notes

Guidance for AI coding assistants (Claude Code, opencode, Copilot, Cursor, etc.) working in this repo.

## What this repo is

A GitHub **template repository** for hackathon attendees. When someone clicks "Use this template", they get a copy of these files in a fresh repo, then open a GitHub Codespace and land in a pre-configured Linux dev environment.

The contents of this repo are **scaffolding**, not a working application. Attendees will replace/extend it with their actual project code.

## Repo layout

- `.devcontainer/devcontainer.json` — Codespaces / dev container config. References `Dockerfile.local` via `build:`, declares VS Code extensions, forwarded ports, and host requirements.
- `.devcontainer/Dockerfile.local` — Thin amd64-pinning wrapper around the prebuilt image. Referenced by `devcontainer.json`'s `build:` stanza so the platform pin is honored at feature-extension time (runArgs alone is too late). No tools live here; see `Dockerfile` for image contents.
- `.devcontainer/Dockerfile` — The prebuilt dev environment image. Bakes in apt utilities, gh CLI, Node, Python, uv, opencode, and the deploy CLIs so a Codespace start is one image pull (no live `apt-get` or `npm install`). Ends with sanity-check assertions so a broken image fails the build instead of silently shipping.
- `.github/workflows/build-devcontainer-image.yml` — Builds the Dockerfile and pushes to `ghcr.io/<owner>/hackathon-template-env:latest` on push to `main`. Only triggers on changes to the Dockerfile or the workflow itself.
- `README.md` — Attendee-facing. Non-technical tone. Covers using the template, what's installed, opencode auth, deploy targets, port sharing, free-tier limits.
- `ORGANIZER.md` — Event-organizer-facing. Covers the prebuilt-image setup (including the one-time "make package public" step), template toggle, org Codespaces secrets for shared API keys, cost math, pre-event checklist.
- `opencode.json` — opencode configuration. Defaults the model to `opencode/deepseek-v4-flash-free` (free, no API key needed) so attendees can start chatting immediately.
- `.opencode/skills/` — Skill packs that opencode auto-discovers. Currently ships `frontend-design` (build distinctive UIs, avoid generic AI aesthetics), `vercel-infrastructure` (Vercel env vars, custom domains, blob storage gotchas), and `c4-diagrams` (source-grounded architecture diagrams). When opencode is asked to do work matching a skill's trigger, it loads the skill automatically.
- `.gitignore` — Standard Node + Python + deploy-tool-cache ignores.

## Conventions when editing

- **The Dockerfile must stay loud-on-failure.** Keep the sanity-assertion `RUN` block at the bottom that runs `--version` on every tool. A silent install is worse than a failed image build — a failed build is visible in the GitHub Actions log; a silent miss leaves attendees debugging "why doesn't X work" mid-hack.
- **Layer order: roughly slowest-changing to fastest-changing.** So most rebuilds hit the cache from the top. The current Dockerfile puts apt utilities first, then apt-based third-party CLIs (gh), then language runtimes (node, python), then npm globals, then the fastest-moving curl-installed CLIs (uv, opencode).
- **README tone: friendly, non-technical.** Assume the reader has never used a terminal. Spell out clicks and menu paths. ORGANIZER.md can be denser and assume CLI familiarity.
- **Keep the dependency surface small.** Every tool added to the Dockerfile is one more thing that can break the image build, slow it down, and one more thing to explain. Add only what most hackathon teams will actually use.
- **Don't add example application code** (no sample Next.js app, no Flask hello-world). The template is deliberately empty so attendees can start from `npm create vite`, `npx create-next-app`, etc., without having to delete scaffolding first.

## When changing `.devcontainer/Dockerfile`

- Build locally before pushing: `cd .devcontainer && docker buildx build --platform linux/amd64 -t test .`. The build must succeed, including the final sanity-assertion `RUN` step.
- New tools must get a matching `--version` line in the sanity-assertion `RUN` block — not scattered through the file.
- Prefer `apt-get install -y --no-install-recommends`, end with `rm -rf /var/lib/apt/lists/*` in the same `RUN`, to keep layers small.
- For `curl | sh`-style installers, check if the installer exposes an install-dir override (e.g. uv's `UV_INSTALL_DIR`) before resorting to a post-install `mv` dance.

## When changing `.devcontainer/devcontainer.json`

- Validate it parses as JSON before committing: `python3 -c "import json; json.load(open('.devcontainer/devcontainer.json'))"`.
- Port additions should include a friendly `label` in `portsAttributes` and use `onAutoForward: notify`.
- VS Code extensions go in `customizations.vscode.extensions` using their full marketplace IDs (e.g. `esbenp.prettier-vscode`, not just `prettier`).
- `postCreateCommand` and `postStartCommand` are intentionally identical (the staged-file copy must run on first attach AND on session resume in case the file was deleted). If you edit one, edit the other.

---
# ---- PROJECT: THE ADMISSIONS ATLAS ----
# Full-stack scholarship/internship/college-admissions utility built on this template.

## Stack
- **Frontend**: Vite + React 19 + Tailwind CSS v4 + Lucide icons + Framer Motion
- **Backend**: Express server (port 3000) with Vite middleware in dev mode
- **Database/Auth**: Supabase (anon key + service key for admin ops)
- **AI**: Google Gemini API (`@google/genai`) for scholarship/internship search & resume analysis
- **Start command**: `npm run dev` → `tsx server.ts` (boots both Express and Vite)

## Architecture
- `server.ts` — Express server at port 3000. Serves API endpoints, serves static build in prod, Vite middleware in dev.
- `src/App.tsx` — Main React app with 6 tabs (overview/hub, scholarships, internships, deadlines, calculator, profile). Manages all global state (scholarships, internships, bookmarks, won list, auth, notifications, theme).
- `src/components/` — One panel per tab: ScholarshipsPanel, InternshipsPanel, DeadlinesPanel, AidCalculatorPanel, ProfilePanel. Plus AuthModal and ResumeScannerModal.
- `src/data/colleges.ts` — Static college data (14 schools with tuition, aid, deadlines, acceptance rates).
- `src/types.ts` — TypeScript interfaces: Scholarship, Internship, College, UserPreferences, BookmarkedOpportunity, NotificationItem, UserProfile.
- `src/supabaseClient.ts` — Supabase client singleton.

## API Endpoints (server.ts)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/scholarships | Return all scholarships from in-memory array |
| POST | /api/scholarships/update | AI search via Gemini, merges results into array |
| GET | /api/internships | Return all internships from in-memory array |
| POST | /api/internships/update | AI search via Gemini, merges results |
| POST | /api/analyze-resume | Extract profile from resume text, return scored matches |
| POST | /api/auth/profile | Get user role from Supabase |
| POST | /api/auth/upgrade-admin | Promote user to admin via secret code |
| POST | /api/reset | Reset scholarship/internship data to pre-seeded defaults |

## Auth Flow
- Supabase auth with email/password (login + signup in AuthModal)
- Anonymous bookmarks stored in `localStorage` under `anon_bookmarks`
- On login, anon bookmarks sync to server (currently just reads them; cloud table sync is latent)
- Admin role stored in `user_metadata.role` on Supabase auth user
- Admin can hit POST /api/reset to wipe AI-added data back to seeds

## Current Seed Data (server.ts defaultScholarships)
7 scholarships pre-seeded:
1. **The Gates Scholarship** — $55k/yr, HS senior, deadline 2026-09-15
2. **Coca-Cola Scholars Program** — $20k, HS senior, deadline 2026-09-30
3. **SMART Scholarship Program** — $38k/yr + tuition, college STEM, deadline 2026-12-01
4. **Barry Goldwater Scholarship** — $7.5k/yr, college STEM, deadline 2027-01-30
5. **Taco Bell Live Más Scholarship** — $25k, ages 16-26, deadline 2027-01-15
6. **Horatio Alger Career & Technical Scholarship** — $2.5k, college/CTE, Under 35, deadline 2026-06-15
7. **Horatio Alger National Scholarship** — $25k, HS junior, deadline 2027-03-01

## Design Language: Android Holo (2010s)
- Dark slate canvas (`bg-holo-gray-dark`, `bg-black`)
- Electric cyan text accents (`text-holo-blue-light`)
- Thin crisp borders (`border-holo-gray-border`)
- Sharp geometric grids, uppercase monospace labels
- Tailwind theme tokens defined via `@tailwindcss/vite` plugin

## Recent Changes (Session 2026-06-06)
- **AuthModal fix**: Moved `useRef`/`useEffect` before early `if (!open) return null` to fix React "Rendered more hooks" error
- **Horatio Alger overhaul**: Split single entry into two real entries (CTE $2.5k + National $25k) with correct deadlines, eligibility, and source URLs
- **Removed scam demo**: Deleted "Fast-Track Platinum Merit Scholarship" object and the "Audit Safe Mode" toggle UI
- **Fixed notification**: Replaced fake Taco Bell "June 25" notification with accurate Horatio Alger CTE deadline alert
- **Fixed age filter bug**: Changed `ageFilter: "Under 35"` to `"All eligible"` because the filter's naive `\d+` extraction parsed "35" as a minimum age requirement, filtering out the scholarship (35 > default ageLimit of 30)

## Server Lifecycle
- Run: `nohup npx tsx server.ts > /tmp/server.log 2>&1 &` then `disown`
- Server process does NOT survive shell/logout — must be restarted each session
- Verify: `curl -s http://localhost:3000/api/scholarships | head -c 100`

## UX Conventions
- Each scholarship card shows: org, name, amount badge, deadline, level, age limits, field, requirements, scam banner (if flagged)
- Buttons: bookmark toggle, mark-as-won (with editable dollar amount), external apply link
- Sorting: soonest deadline, highest award, name A-Z
- Filtering: target level (all/high_school/college/both), age limit slider
- Manual entry form for user-tracked scholarships/won awards
- AI search bar triggers Gemini to find and merge new scholarships

## Env Vars (.env)
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
- GEMINI_API_KEY (optional; falls back to seed data)
- ADMIN_SECRET_CODE (default "ADMIN2026")

---

## If a project actually needs Docker inside the Codespace

The default Codespace deliberately does NOT install Docker — adding the
`docker-in-docker` feature costs ~30s of cold-start time per Codespace, and
most hackathon projects deploy to hosted services (Vercel, Railway, Neon)
rather than running containers locally.

If your project genuinely needs `docker` (e.g. running compose stacks, building
images locally), add this to `.devcontainer/devcontainer.json`:

```json
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:3": {}
}
```

Then commit, push, and **create a fresh Codespace** (the feature only installs
on container creation; rebuilding an existing Codespace via "Dev Containers:
Rebuild Container" also works). Don't try to install Docker via `apt-get` in a
shell — the feature is needed to set up the daemon, not just the CLI.

## When changing `.github/workflows/build-devcontainer-image.yml`

- The first publish requires a manual "make package public" step in the GitHub UI (see ORGANIZER.md section 0). If you change the package name, attendees will hit a pull failure until that step is repeated.

## When running local commands / dev servers

- **Long-running processes (dev servers, watchers, REPLs, build watchers) must run in the background**, not in the foreground. A foreground `npm run dev` or `python -m http.server` blocks the agent on its own command until it's killed, which wastes the rest of the session. Use `run_in_background: true` (or `&` + `disown` from a shell), capture the output, then continue with other work.
- After starting a server in the background, verify it actually came up before assuming success (e.g. `curl localhost:PORT/health` or check the captured log). A backgrounded process that crashed on boot looks the same as one that's serving — don't conflate them.
- Stop background processes you started before declaring a task complete, unless the user explicitly wants them left running.

## What to push back on

- Requests to add framework-specific scaffolding (a starter Next.js app, etc.) — see "don't add example application code" above.
- Requests to pin every tool to an exact version — for a hackathon template, "latest stable" is usually right. Pinning becomes a maintenance burden when versions drift.
- Requests to install VS Code or extensions into the Dockerfile — Codespaces installs the VS Code server and the extensions listed in `devcontainer.json` into a separate volume at container start. Pre-installing them in the image is unsupported and conflicts.
