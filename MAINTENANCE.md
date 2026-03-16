# Ryzo Studios Website — Maintenance Guide

This document covers every service the site depends on, what each one does, how they connect, and what to do when something breaks or needs updating.

---

## How It All Fits Together

```
You write code → push to GitHub → Vercel detects the push → builds and deploys the site
                                                               ↓
                                              Visitors hit ryzo.studio
                                                               ↓
                            Page content (events, guides) pulled from Sanity CMS
                            Form submissions → saved to Sanity + email via Resend
```

---

## Services

### 1. GitHub
**What it is:** Where all the website code lives.
**Repo:** `ryzo-studio/ryzo-studio`
**Why it matters:** Every time code is pushed to the `main` branch, Vercel automatically rebuilds and deploys the site. You don't need to do anything manually — push = deploy.

**Common tasks:**
- View code history, see what changed and when
- Roll back to a previous version if something breaks (via Vercel, see below)

---

### 2. Vercel
**What it is:** The hosting platform. Serves the live website at ryzo.studio.
**Login:** vercel.com — connected to the `ryzo-studio` GitHub account
**Plan:** Hobby (free tier)

**What it does:**
- Builds the site from GitHub on every push to `main`
- Runs the server-side code (API routes like `/api/subscribe`)
- Stores secret environment variables (API keys, tokens) securely
- Serves the site globally via CDN

**Common tasks:**

*Redeploy manually (if something looks stuck):*
Deployments → find the latest → `···` menu → Redeploy

*Roll back to a previous version:*
Deployments → find the last working deploy → `···` → Promote to Production

*Add or update an environment variable:*
Settings → Environment Variables → Add / edit → then redeploy

**Environment Variables (full list):**

| Variable | What it does | Where to get it |
|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | Identifies your Sanity project | sanity.io/manage → project → Settings |
| `PUBLIC_SANITY_DATASET` | Which dataset to use (should be `production`) | sanity.io/manage |
| `SANITY_API_READ_TOKEN` | Lets the site read content from Sanity | sanity.io/manage → API → Tokens |
| `SANITY_WRITE_TOKEN` | Lets the site save subscriber signups to Sanity | sanity.io/manage → API → Tokens (Editor role) |
| `RESEND_API_KEY` | Authorizes outgoing emails via Resend | resend.com/api-keys |

> **If any of these go missing**, the affected feature silently breaks (forms, content loading). Always check Vercel env vars first when something stops working.

---

### 3. Sanity CMS
**What it is:** The content management system. This is where you manage events, guides, and merchandise — without touching code.
**Login:** sanity.io/manage
**Studio (in-browser editor):** ryzo.studio/studio

**What it manages:**
- **Events** — title, date, location, type, registration link, featured flag
- **Guides** — downloadable PDFs, descriptions, audience, skills
- **Merch** — products with a visibility toggle (controls whether the merch page shows at all)
- **Subscribers** — people who sign up via the Connect page form (if `SANITY_WRITE_TOKEN` is set)

**Common tasks:**

*Add a new event:*
Go to ryzo.studio/studio → Events → New Event → fill in fields → Publish

*Hide the merch page:*
Studio → Merch → set `isVisible` to false on all items → the merch page automatically goes blank

*View subscribers:*
Studio → Subscribers (requires `SANITY_WRITE_TOKEN` to be set in Vercel for new ones to save)

---

### 4. Resend
**What it is:** The email sending service. Handles two types of emails:
1. **Studio notification** — sent to `hello@ryzo.studio` whenever someone signs up
2. **Welcome email** — sent automatically to each new subscriber

**Login:** resend.com
**Verified domain:** `ryzo.studio` (verified March 2026)
**Sending from:** `hello@ryzo.studio`
**API key:** stored in Vercel as `RESEND_API_KEY`

> **Important:** The API key visible in this project's history (`re_U731HZwh...`) was shared during setup and should be rotated. Go to resend.com/api-keys → create a new key → update it in Vercel → delete the old one.

**If emails stop sending:**
1. Check resend.com → Logs to see if sends are failing and why
2. Check that `RESEND_API_KEY` is still set in Vercel
3. Check resend.com → Domains → confirm `ryzo.studio` still shows as Verified

---

### 5. Squarespace (Domain & DNS)
**What it is:** Where `ryzo.studio` is registered and where DNS records live. DNS records are instructions that tell the internet where to send traffic for your domain.
**Login:** squarespace.com — **account: spockngrizz@gmail.com** ⚠️
> This is a former company email. Make sure access to this account is maintained — if it's ever lost, recovering the domain registration becomes very difficult.

**DNS records currently set:**

| What it does | Records |
|---|---|
| Points `ryzo.studio` → Vercel (the website) | `@ A` → `216.198.79.1` and `www CNAME` → `cname.vercel-dns.com` |
| Google Workspace email (hello@ryzo.studio) | `MX` records pointing to Google mail servers |
| Email authentication (prevents spam flags) | `SPF`, `DKIM`, `DMARC` TXT records |
| Resend email sending (subscriber emails) | `resend._domainkey TXT`, `send MX`, `send TXT` |
| Squarespace domain verification | Various CNAME records |

**⚠️ Do not delete or modify DNS records unless you know exactly what you're changing.** Deleting the wrong record can take the website offline or break email. If in doubt, add — don't edit or remove.

---

## Common Situations

**"The site is down"**
1. Check vercel.com → Deployments — is the latest deploy green (Ready)?
2. If a recent deploy broke something, roll back (see Vercel section above)
3. Check Squarespace DNS — has anything changed?

**"The subscribe form gives an error"**
1. Check Vercel → Logs → Functions for the error
2. Check that `RESEND_API_KEY` is set in Vercel env vars
3. Check resend.com → Domains → is `ryzo.studio` still verified?

**"I'm not getting notification emails for new signups"**
1. Check resend.com → Logs — are sends failing?
2. Check your spam folder
3. Verify `RESEND_API_KEY` in Vercel is current and not expired

**"Content I updated in Sanity isn't showing on the site"**
- The site is SSR (server-rendered), so changes show immediately on next page load — no redeploy needed
- If it's still not showing, check that `PUBLIC_SANITY_PROJECT_ID` is set in Vercel

**"I need to update the welcome email copy"**
- Edit `src/pages/api/subscribe.ts` — the HTML email templates are in the `resend.emails.send()` calls
- Push to GitHub → Vercel auto-deploys

---

## Things That Are Safe to Edit Without Code Knowledge
- Event content in Sanity Studio (ryzo.studio/studio)
- Guide PDFs and descriptions in Sanity Studio
- Merch visibility toggle in Sanity Studio

## Things That Require Code Changes (but are straightforward)
- Welcome email copy → `src/pages/api/subscribe.ts`
- Page text and layout → `src/pages/*.astro`
- Form fields → `src/components/SubscribeForm.tsx`

## Things to Be Careful With
- Vercel environment variables — deleting one breaks the feature that depends on it
- Squarespace DNS records — wrong changes can take the site or email offline
- Resend domain verification — if the DNS records are removed, email sending stops
