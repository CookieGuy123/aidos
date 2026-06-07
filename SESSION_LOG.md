# Session Changelog — June 7, 2026

## Summary of all changes made to The Admissions Atlas

---

### 1. Initial M3 Expressive Redesign (from Holo backup)
- Rewrote entire UI with Google Material 3 Expressive design language
- Color palette: Primary blue (#1A73E8), Secondary teal (#00639B), Tertiary purple (#7C4DFF)
- Typography: Outfit (UI) + JetBrains Mono (data)
- M3 components: cards, filled/outlined/text buttons, data tables, dialogs, chips, fields, nav bar
- Spring-physics easing on interactive elements
- Replaced `design_backup/` with original Holo files

### 2. Data Persistence Fixes
- Added `fetchInitialData()` to load scholarships/internships from API on mount
- Fixed localStorage save/load ordering (lazy state initializers, dataLoaded guard)
- Gradient, dark mode, wide mode all persist correctly across refreshes

### 3. Background Gradients
- 4 color options: Blue, Teal, Purple, Green
- Direction sub-selector: Top-down / Bottom-up
- Accent colors (buttons, tabs) match the active gradient hue
- Light mode: pastel-tinted gradients with saturated accents
- Dark mode: deep-tinted gradients with bright accents
- Compound `.dark.bg-gradient-*` CSS selectors for proper dark mode appearance
- Swatch previews → text label buttons (avoids circular color reference)

### 4. Dark Mode
- Full M3 dark color palette via `.dark` CSS variable overrides
- Toggle in top app bar (Sun/Moon icon) and Profile settings
- Cards use #1E1C22 to stand out against #141218 background
- Dark-mode gradient backgrounds (deep tones, not light tones)
- Dark-mode logo variant (`public/logo-dark.svg`)

### 5. AI Search Dialog
- Separated from the local filter search bar
- Opens as a modal dialog with its own text input
- Type toggle removed — only shows the relevant type (scholarships/internships)
- Esc key closes the dialog

### 6. Action Buttons (Hover Labels)
- Dark mode and Wide mode buttons in top bar: icon + expand-on-hover text
- Uses `max-w-0 overflow-hidden group-hover:max-w-[60px]` pattern
- Profile Dark/Wide buttons show opposite state (Light/Narrow) with matching icons

### 7. Restored Missing Features
- Wide mode toggle (expands content to full width)
- Admin upgrade input in Profile settings
- Notifications panel on overview/home page (mark as read, clear all)
- "Load to Calculator" button on Deadline college cards

### 8. Removed Scam / Verified UI
- Deleted `int-unverified-scam` demo entry from server seed data
- Removed `verifiedOnly` filter state and Verified chip from M3 InternshipsPanel
- Removed FLAG badges and scam banners from M3 and Holo scholarship/internship cards
- Removed Audit Safe Mode toggle (Verified Listings / Flagged Scams) from Holo InternshipsPanel
- Removed Verified Safe Portal/Employer badges from Holo cards
- Removed SUSPECTED SCAM / EMPLOYMENT FRAUD banners

### 9. Theme Switcher (Admin Only)
- Shell `App.tsx` detects admin role via Supabase `user_metadata.role`
- Admin sees a fixed top bar with Material / Holo toggle pills
- Both themes coexist via separate component trees (`src/themes/m3/`, `src/themes/holo/`)
- Lazy-loaded with Suspense
- Merged CSS file (`src/index.css`) has both M3 and Holo tokens (no conflicts — different class prefixes)
- Fonts set per-theme via inline `--font-sans` CSS variable overrides

### 10. Minor Fixes
- Fixed Vite HMR WebSocket port mismatch in Codespaces
- Changed "Scan" → "Upload Resume" with Upload icon
- Changed header from "Atlas" → "The Admissions Atlas" with logo
- Replaced logo with `logo1.svg`, favicon with `logo1.ico`
- Rounded logo corners with `rounded-xl`
- Fixed Holo double scrollbar (`h-screen overflow-y-auto` → `min-h-screen`)
- Updated gradient color names: removed amber/pink options
- Holo Wide toggle text now dynamic (Wide/Narrow)

---

## File Structure

```
src/
├── App.tsx                    # Shell: admin check + theme toggle
├── index.css                  # Merged M3 + Holo CSS
├── main.tsx                   # Entry point
├── supabaseClient.ts
├── types.ts
├── data/
│   └── colleges.ts
├── components/               # (currently M3 files, overwritten by restore)
├── themes/
│   ├── m3/
│   │   ├── App.tsx           # M3 app (Outfit, surface/primary tokens)
│   │   ├── index.css         # Deprecated, removed
│   │   └── components/       # M3 panels: Scholarships, Internships, Deadlines, etc.
│   └── holo/
│       ├── App.tsx           # Holo app (Roboto, holo-* tokens)
│       ├── index.css         # Deprecated, removed
│       ├── types.ts          # Holo-specific types (copy)
│       ├── data/colleges.ts  # Holo-specific data (copy)
│       └── components/       # Holo panels (restored from design_backup/)
public/
├── logo.svg                  # M3 logo (light mode)
├── logo-dark.svg             # M3 logo (dark mode, inverted colors)
├── favicon.ico               # M3 favicon
design_backup/
└── src/                      # Full copy of original Holo design (for restore)
server.ts                     # Express + Supabase + Gemini API
vite.config.ts                # HMR fix for Codespaces
```

---

## Files Touched Today

### Created
- `src/themes/m3/App.tsx`
- `src/themes/m3/components/*.tsx` (7 files)
- `src/themes/holo/App.tsx`
- `src/themes/holo/components/*.tsx` (7 files)
- `src/themes/holo/types.ts`
- `src/themes/holo/data/colleges.ts`
- `public/logo-dark.svg`

### Modified
- `src/App.tsx` — rewritten as theme shell
- `src/index.css` — merged M3 + Holo CSS
- `server.ts` — removed scam entry
- `vite.config.ts` — HMR fix
- `public/favicon.ico` — replaced
- `public/logo.svg` — replaced
- All 7 `src/components/*.tsx` — rewritten → then restored from backup

### Backup
- `design_backup/src/` — contains original Holo design (verified identical)
