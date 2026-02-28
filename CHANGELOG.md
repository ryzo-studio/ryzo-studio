# Changelog

All notable changes to the Ryzo Studios website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.1] — 2026-02-27

### fix: Connect hero headline
- Changed "Let's make something real." → "Let's keep in touch." with accent split: "Let's keep" (white) / "in touch." (yellow)

### feat: Header — logo and nav text size increased 40%
- Logo height: `72px` → `101px`
- Nav link font size: `0.8125rem` → `1.14rem`
- Header padding tightened slightly to compensate for taller logo

### feat: About page hero — team photo background
- Added `IMG_0079.JPG` (team at table) as full-bleed background for About hero
- Gradient overlay: darker bottom-left for text legibility, opens up top-right

### fix: About page — Ty Goodwin moved from Leadership to Team
- Removed Ty Goodwin's `person-card` from the Studio Leadership section
- Added as first entry in the Team grid with photo and "Creative Director" role

### fix: About page — Team section headline updated
- "The crew we love." → "Rockstars of animation and gaming."

---

## [1.1.0] — 2026-02-27

### feat: Simplified Connect page with email link + social media

- Replaced ContactForm component with a centered, prominent `mailto:hello@ryzo.studio` link
- Added social media link row (YouTube, Instagram, LinkedIn, TikTok) below email address
- Social links styled as pill buttons with hover accent color

### feat: Updated Afterschool Hub facilitator guide

- Replaced `/Un-Tilted_GroupFacilitatorGuide.pdf` with new `/UNTilted_FacilitatorGuide_2_2026.pdf`
- Updated Master Slide Deck link to new Google Slides URL

### feat: Added Roxie cinema photo to Events hero

- Added `RTB_OnScreenRoxie.png` as full-bleed background on `/events` hero
- Gradient tuned: left side dark for text legibility, right side opens up to show screen and fairy lights

### feat: Activations — "Story that does something" section redesign

- Removed dark full-bleed background treatment (photo was invisible behind overlay)
- Added `activation_community_event.jpg` as a visible inset `<img>` element in center column
- Layout is now a 3-column editorial grid: body text | photo | format list
- Headline moved above grid as full-width header
- Responsive: 2-col on tablet (photo spans full width), single-col on mobile

### fix: Standardized hero top alignment across all 14 pages

- All hero sections now use `padding-block: 8rem 5rem` to match the home page baseline
- Pages fixed: `connect`, `events`, `guides`, `merchandise`, `rage-fighters`, `release-the-beast`, `supporters`, `year-in-review`

### fix: Lightened full-bleed photo overlays site-wide (~−0.20 opacity)

- All dark gradient overlays on photo-backed sections reduced by ~0.20 to let images show through
- Affected: `index`, `activations`, `connect`, `rage-fighters` (hero + zones + notebook), `release-the-beast` (hero + themes + origin + screen)

### fix: Hero headline color consistency across all pages

- All hero `h1` display titles now use white line + accent-colored line pattern
- `events.astro` was the only page missing an accent span — added `<span class="accent-text">show up.</span>`
- `release-the-beast` retains red (`#E8352A`) for "The Beast" — intentional film brand color

### fix: Brightened small text in Release the Beast hero

- `.film-hero-logline` ("A 12-minute animated film…"): `var(--fg-2)` → `rgba(255,255,255,0.92)`
- `.film-hero-tagline` ("The monster inside…"): `var(--fg-2)` → `rgba(255,255,255,0.92)`
- `.premiere-date`: `rgba(255,255,255,0.60)` → `rgba(255,255,255,0.88)`
- `.countdown-label` (DAYS/HRS/MIN/SEC): `0.35` → `0.70`
- `.countdown-sep` (colons): `0.20` → `0.45`

### fix: "Our take on anger" section — gradient and text legibility

- Right-side overlay darkened (`0.52` → `0.82`) to darken the text column background
- Body copy in right column overridden to `rgba(255,255,255,0.90)` from muted `var(--fg-2)`

### fix: "Made Possible By" credit on Rage Fighters page

- Label size increased from `var(--text-xs)` to `var(--text-base)`
- Color changed from dim `var(--fg-3)` to `var(--accent)` (gold)

### fix: "Coming Soon" buttons in Engagement Guides

- Changed from `btn-primary` (bright yellow) to a new `btn-coming-soon` class
- Styled as ghost/muted (transparent, dim border, 50% opacity) so the active "Open the Hub →" button pops

### fix: Todd Shaiman founder photo scaling

- Added `transform: scale(1.2)` on Todd's photo via `.founder-card:last-child .founder-photo img`
- Frame size unchanged; image fills more of it

### chore: Updated Rage Fighters — "Made Possible By" section visibility

- Attribution label is now prominent and accent-colored to signal importance

---

## [1.0.0] — 2026-02-27

Initial release of the Ryzo Studios marketing and content site.

### Tech Stack
- **Framework:** Astro 5 (SSR, server output)
- **Adapter:** Vercel
- **CMS:** Sanity v5 with embedded Studio at `/studio`
- **UI layer:** React 19 (islands where needed)
- **Language:** TypeScript 5

### Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, studio principles, franchise model, research section, dynamic upcoming events, CTA |
| `/about` | Studio story and team |
| `/mission` | Mission and impact philosophy |
| `/release-the-beast` | Flagship animated film landing page |
| `/rage-fighters` | Roblox game landing page |
| `/activations` | School activation programs |
| `/afterschool-hub` | After-school program hub |
| `/educators` | Educator-facing resources |
| `/guides` | Downloadable engagement guides (Sanity-powered) |
| `/events` | Full events listing (Sanity-powered) |
| `/merchandise` | Merch page with Sanity visibility toggle |
| `/supporters` | Funders and supporters |
| `/year-in-review` | Annual impact recap |
| `/connect` | Contact / partnership inquiry |

### Components
- **`Header.astro`** — Fixed, scroll-aware header with blur/backdrop on scroll; active-link highlighting; hamburger menu for mobile (≤900px) with full-screen overlay nav
- **`Footer.astro`** — Three-column footer nav (Projects, Resources, Company) with brand tagline and Stanford/UCSF/Pixar attribution
- **`Layout.astro`** — Base layout wrapping all pages

### Sanity CMS Integration
- **Schemas:** `event`, `guide`, `merch`
- **Client:** `src/lib/sanity.ts` — graceful no-op when `PUBLIC_SANITY_PROJECT_ID` is not configured (returns `null` instead of throwing)
- **Queries:** upcoming events, all events, guides, merch, merch visibility flag
- **Studio:** embedded at `/studio` route via `@sanity/astro`

### Design System
- Dark-mode-first color palette (deep purple/near-black background, gold `#f5c842` accent)
- Display font + body font via CSS custom properties (`--font-display`, `--font-body`)
- Global CSS tokens: spacing scale (`--s-*`), text scale (`--text-*`), radius, border, transition
- Responsive breakpoints at 480px, 768px, 900px, 1024px

### Key Features
- Homepage events section is conditionally rendered — only appears when Sanity returns upcoming events
- Merch page respects a CMS-controlled visibility flag (`isVisible`) to show/hide the store
- Sanity client is environment-aware: uses CDN in production, direct API in development
- All pages deployed as SSR (no static export) via Vercel adapter
