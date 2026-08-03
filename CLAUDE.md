# Ryzo Studios

Ryzo Studios builds animated films and games that teach kids emotional regulation skills. The flagship IP is **Release the Beast** (film) and **Rage Fighters** (Roblox game), featuring a character named Stan who learns to manage anger through four core skills: Pause, Breathe, Chill, and Connect.

## Tech Stack

- **Framework**: Astro 5.3 with React integration
- **Hosting**: Vercel (adapter in `astro.config.mjs`)
- **CMS**: Sanity (integrated but lightweight usage)
- **Styling**: Scoped `<style>` blocks per page + `src/styles/global.css` for design tokens
- **APIs**: Google Sheets (session data via service account), Resend (email)
- **TypeScript**: Strict mode, path aliases `@/*` and `@sanity/*`
- **Live site**: https://www.ryzo.studio

## Design System (`src/styles/global.css`)

| Token | Value |
|---|---|
| `--font-display` | Cabinet Grotesk |
| `--font-body` | DM Sans |
| `--accent` | `#f5c842` (brand yellow) |
| `--purple` | Secondary color |
| `--bg` | Dark theme background |
| `--max-w` | 1440px |
| `--radius` | Default border radius |

Dark theme throughout. Pages use scoped styles with CSS custom properties from global.css.

## Project Structure

```
src/
  pages/          # Astro pages + API routes
    api/          # collect.ts, contact.ts, subscribe.ts, survey-auth.ts
  components/     # Header.astro, Footer.astro, AaronsSketchbook.tsx, ContactForm.tsx, etc.
  layouts/        # Layout.astro (Header + Footer, supports noFooter prop)
  styles/         # global.css
public/
  images/         # Static images organized by subfolder (premiere/, etc.)
```

## Key Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `index.astro` | Homepage |
| `/premiere` | `premiere.astro` | Release The Beast premiere party page |
| `/play` | `play.astro` | Aaron's Sketchbook RPG game |
| `/events` | `events.astro` | Event listings |
| `/press` | `press.astro` | Press kits |
| `/films` | `films.astro` | Film catalog |
| `/release-the-beast` | `release-the-beast.astro` | RTB film page |
| `/rage-fighters` | `rage-fighters.astro` | Game page |
| `/dashboard` | `dashboard.astro` | Data dashboard |
| `/about` | `about.astro` | About page |

## Aaron's Sketchbook RPG (`src/components/AaronsSketchbook.tsx`)

A React-based RPG game where players explore a grid map, encounter Stans, and answer questions about emotional regulation skills. Key details:

- **HUD**: 46px orbs showing captured/uncaptured Stans
- **Encounters**: Skill encounters (Throwdown) at 15% rate per step; arc encounters (Spar) for Stan captures
- **Fail threshold**: 2 wrong answers → redirect for Throwdown, 3 for Spar
- **Win detection**: `dialogue.includes("paid")` — detects "You've been paying attention."
- **Data collection**: Session data sent to `/api/collect` → Google Sheets
- **Key constants at top of file**: `SKILL_ICONS`, `SKILL_QUESTIONS`, `NOTEBOOK_PAGES`

## API: `/api/collect` (`src/pages/api/collect.ts`)

Writes RPG session data to Google Sheets. 28-column schema. Auth via `COLLECT_SECRET` bearer token + Google service account JWT. Environment variables: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`.

## Premiere Page Design Decisions

- Hero uses full-bleed YouTube thumbnail as background (no text overlay — the thumbnail IS the title)
- Countdown numbers: `#FFE600` bright yellow
- Zoom button: `#C01A08` deep film red
- YouTube button: cyan outline (`#00e5ff`)
- Section headers are compact: `clamp(1rem, 1.8vw, 1.6rem)`
- Note filename typo: `RelaseTheBeastPoster_Official.jpg` (Relase, not Release)

## Brand & Tone

- Voice: Direct, warm, friend-to-friend — not corporate marketing
- Target audience: Kids, parents, educators
- Core message: Emotional skills through storytelling and play

## Workflow

- **Branch**: `main` — push directly, no PRs needed
- **Deploy**: Automatic via Vercel on push to main
- **Images**: Place in `public/images/[subfolder]/`
- **After changes**: `git add [files] && git commit -m "..." && git push`
