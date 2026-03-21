# Changelog

All notable changes to the Ryzo Studios website will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.5] — 2026-03-20

### feat: Press page — new `/press` route
- Created dedicated press page with three cards: Live Event Materials, Release the Beast press packet, Rage Fighters press packet
- Each card links to its respective Google Drive folder
- Includes editorial use note and press inquiry email CTA
- Fixed apostrophe syntax error in press page that caused Vercel build failure

### feat: Footer — updated nav links
- Added Mission and Press under Company section
- Removed Year in Review from Resources
- Removed "Backed by Stanford & UCSF research. Created by former Pixar leaders." credit line from footer bottom

### feat: About — leadership bios added
- Added full bio for Tehya Kopp (Chief Impact Officer)
- Added full bio for Suzanne Slatcher; title updated to Chief Technology Officer; Added "Known for" film credits line
- Shortened Suzanne's bio to match Tehya's length
- Fixed leadership card alignment: names now align to top edge of photo (`align-self: start`)

### feat: Events page — overhaul
- Added audience badge (For Young People / For Creators) to each event
- Added "Get on the List" button for The MADE events linking to themade.org/calendar; all others show "Private"
- Changed all UnTilted event types from Workshop → Live Event
- Changed Story into Action type from Panel & Demo → Talk
- Increased venue name font size to `text-base`
- Brightened event-type label color to `var(--fg)`

### fix: Homepage & Mission — copy updates
- Reordered paragraph: "They're in Roblox at midnight." moved to after "They're scrolling before school."
- Reordered platform chips: Animated Film first, then Gaming
- Halved section `padding-block` spacing in `global.css` (`.section` and `.section-sm`)

### fix: Release the Beast — copy and media updates
- Replaced local `rtb-hero.mp4` with YouTube embed (knN0Eb-OTiI), muted by default with full controls
- Capitalized "Bullies" in Aaron's Got Problems synopsis
- Changed "collaborators who had looked" → "collaborators who listened" in Our Take On Anger section

### fix: Rage Fighters — copy updates
- Updated game description: "a melee fighting game" → "an educational melee fighter game"
- Renamed skill 03 from "Cool Down" → "Chill"

### fix: Activations — copy updates
- "You don't need Ryzo in the room" → "You don't need the Ryzo team in the room"
- Afterschool Program duration: "90-minute" → "60-90 minute"

---

## [1.1.4] — 2026-03-15

### fix: Subscribe form — resolved 500 error on submission
- Root cause: `createClient` (Sanity) at module level threw when `PUBLIC_SANITY_PROJECT_ID` was missing, crashing the entire API route
- Added `|| 'placeholder'` fallback to Sanity client init to match the pattern in `src/lib/sanity.ts`
- Wrapped `request.json()` in try-catch to prevent uncaught parse errors
- Moved `new Resend()` instantiation inside try-catch

### feat: Subscribe form — added Last Name field
- Added optional Last Name input next to First Name in a two-column grid
- Last name passed through to API, Resend Audience, and both notification + welcome emails
- Mobile: stacks to single column below 480px

### feat: Subscribe form — welcome email to new subscribers
- Sends automated welcome email from `hello@ryzo.studio` on signup
- Includes links to Release the Beast, Rage Fighters, Events, YouTube, and Roblox community
- Interests line omitted from both emails when none are selected

### feat: Resend domain verification — ryzo.studio
- Verified `ryzo.studio` as a sending domain in Resend
- Added 3 DNS records in Squarespace: DKIM TXT, SPF MX, SPF TXT
- All outgoing emails now send from `hello@ryzo.studio` instead of `onboarding@resend.dev`

### feat: Resend Audience — subscriber storage
- Replaced broken Sanity write with Resend Contacts API
- Every new subscriber is saved to Resend Audience (`8398772b-03c2-40cd-861a-76d76b155c23`)
- Viewable at resend.com/audience → Contacts
- Removed `@sanity/client` dependency from subscribe API entirely

### chore: Rotated Resend API key
- Old key (`re_U731HZwh...`) was shared in chat and has been deleted
- New key generated and stored in Vercel environment variables only

### docs: Added MAINTENANCE.md
- Covers all services (GitHub, Vercel, Sanity, Resend, Squarespace), what each does, how they connect
- Full environment variable reference with descriptions and where to get each one
- Common troubleshooting scenarios
- Notes Squarespace domain access via spockngrizz@gmail.com

---

## [1.1.3] — 2026-03-03

### feat: Events — new UnTilted Clubhouse Network event (Mar 18)
- Added: UnTilted — Mastering the Internal OS with Ryzo
- Group/venue: The Clubhouse Network · The Tech Center @ Boys & Girls Clubs of San Leandro
- Type: Workshop · March 18, 2026

### feat: Events — "Invite us to your community" link opens mailto
- Now opens `hello@ryzo.studio` with subject "EVENT REQUEST" pre-filled

### fix: Activations — "Coming Soon" buttons more visible
- Border opacity raised, text opacity raised, removed double-opacity
- Buttons now read clearly as disabled/forthcoming without being invisible

### feat: Afterschool Hub — continuous frame from hero into toolkit
- Removed "Go to the Toolkit" gate button
- Hero height reduced to auto (title card only)
- Removed border-top between hero and toolkit section
- Hero title flows directly into "Three tools. One unforgettable session."

### feat: Supporters — Equimundo logo added
- Logo added to Lead Partners block with white background pill
- Card border opacity raised to 0.14 for clearly visible pill frames

### feat: Connect — Discord added to social links
- Discord pill linking to `https://discord.gg/Pe4P9Ykrn8`

---

## [1.1.2] — 2026-02-28

### feat: Supporters page — full content overhaul
- Replaced all placeholder content with real copy across every section
- Added **Get Involved** section: "Ryzo is ready to scale with impact investment." with mailto CTA button pre-addressed to `Erica@ryzo.studio` and `Todd@ryzo.studio` with subject "Impact Investor Here"
- Added **Our Approach** section with real body copy
- Added **Gratitude** section with three blocks: Equimindo & the Caring Masculinity Fund (lead partners), AutoDesk · Unreal · Perforce (technical partners), Community Supporters (crowdfunding/Kickstarter)
- Updated bottom CTA copy

### feat: Supporters added to main nav
- Added `{ label: 'Supporters', href: '/supporters' }` to `navItems` array between About and Connect
- Removed old hardcoded mobile-only Supporters and duplicate Activations entries

### fix: Mobile nav — page content bleeding through overlay
- Moved `.mobile-nav` outside `<header>` to escape `backdrop-filter` stacking context
- Boosted z-index from `99` → `9999` — overlay now properly covers all page content on iPhone

### feat: Film page hero — countdown and Join button moved to right
- Split `.film-hero-content` into a two-column grid
- Left: eyebrow, title, logline, tagline
- Right: "Premiering on YouTube" label, date, countdown timer, "Join the Live Watch Party →" button
- Mobile: stacks back to single column

### fix: About page — founder card mobile layout
- Restructured `founder-info` into `founder-header` (name + title) and `founder-bios` (bio paragraphs) using CSS grid placement
- Desktop: photo spans both rows, name/title top-right, bio bottom-right (unchanged visually)
- Mobile: photo + name/title side by side in row 1, bio spans full width in row 2

### fix: Rage Fighters — mobile hero
- Shifted `background-position` to `left center` to better show character faces on portrait screens
- Darkened overlay on mobile (gradient to `0.92` opacity at bottom) — image was too bright
- Hidden `.production-credit` on mobile — was overlapping the Play Now button

### feat: Connect page — Discord added to social links
- Added Discord pill button linking to `https://discord.gg/Pe4P9Ykrn8`
- Matches existing social link pill style

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
