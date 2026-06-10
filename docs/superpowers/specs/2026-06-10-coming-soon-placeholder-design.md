# Coming-Soon Placeholder — Design Spec

Date: 2026-06-10. Status: approved by Brendan in visual review (confidence: high).

## Purpose

Replace the live www.infolog.io homepage with a one-screen placeholder. It carries the new positioning while the bento gateway site is built. Phase 2 (bento site on infolog.lib tokens) is out of scope here.

## Layout

Desktop: single viewport, no scroll. Left column 58% on near-white paper. Right panel 42% is the dithered sky behind a 1px ink rule.

Mobile (≤720px): sky becomes a masthead band (~34vh). Content stacks below. Fits the fold on 390×844; shorter viewports scroll.

Left column order: kicker, headline, lede, spacer, hairline rule, "NEW SITE — 2026", CTA row.

## Copy (locked)

- Kicker: `AI PRODUCT ENGINEERING · AGENT SYSTEMS · EVALUATION UX`
- Headline: `Machines handle the routine. Humans build what matters.`
- Lede: `AI-native product design and engineering: agent workflows, applied evals, trace and debug UX, human-in-the-loop systems. Every engagement is principal-led.`
- Marker: `SOON` (Brendan's wording, 2026-06-10; replaced `NEW SITE — 2026`)
- CTA: `BOOK A CALL` → Google Calendar appointment-schedule URL, recovered from the previous live homepage
- Contact: `BDL@INFOLOG.IO` → `mailto:bdl@infolog.io`
- Sky caption: `THE SKY OVER {CITY} — {HH:MM}`

No project callouts. The five-project lineup (crow.pet, multiplex.chat, skillstud.io, monet.haus, infolog.lib) is stashed for phase 2.

## Type

- Display + lede: Fraunces (Google Fonts), weight 600 display, 500 lede, tracking −0.015em, leading 1.04.
- Labels, caption, CTA: IBM Plex Mono, letter-spacing 0.14em, uppercase.
- Headline sizes via clamp: 2.4rem mobile → 4.5rem desktop. Big type is the design.

## Color

- Paper: `#fdfcfa` (near-pure white; explicitly not yellow cream).
- Ink derives from the live sky palette's zenith (darkest) stop, darkened until contrast ≥ 4.5:1 on paper. At dusk this resolves near `#221c44` (deep purple). Never ash-brown.
- Muted text and hairlines mix ink with paper (approx `#5f5670`, labels `#897d99`, rules `#e3dde9` at dusk).
- Button: ink background, paper text. Panel rule: 1px ink.

## The sky (signature element)

Hand-rolled WebGL fragment shader. No libraries. ~230 lines of JS+GLSL as shipped.

- Vertical gradient from 5 palette stops, ordered-dithered with a 4×4 Bayer matrix.
- Grain: 2 CSS px per dither cell, device-pixel-ratio aware.
- Quantization: 5 levels per channel (matches approved mockups).
- Palette keyframes: night, dawn, day, golden hour, dusk, night. Interpolate continuously by local clock.
- Sunrise/sunset approximated from day-of-year solar declination at latitude 40°N. Solar noon assumed 12:00 local. Exactness is not required; plausibility is (confidence: medium on perceived accuracy at extreme latitudes).
- Re-render every 60 seconds and on resize. No per-frame animation loop.
- Caption city: IANA timezone tail (`America/Los_Angeles` → `Los Angeles`). Fallback for `UTC`/`Etc/*`: drop the city ("THE SKY — HH:MM"). Clock updates with the render tick.
- Debug override: `?t=HH:MM` forces the time for testing.

### Pointer interaction (added 2026-06-10, same day)

- Repel: pixels displace away from the cursor inside the panel. Radius 0.32 × panel height, max displacement 8.5% of radius. Strength eases in/out (0.14 per frame); decays to zero on panel leave, window blur, or page mouseleave.
- Reverse parallax: the whole sky's sample position offsets up to 9px horizontal and 6px vertical (device px), opposite the cursor, eased at 0.10 per frame.
- Both run in the fragment shader by displacing the cell-space sample, so dither cells stay crisp.
- The rAF loop self-suspends when values settle; any mousemove wakes it. Mouse-only. Not attached under reduced motion or in the CSS fallback.
- Debug: `?tz=<IANA zone>` forces the clock, caption, and palette. `Etc/GMT∓X` zones render as `GMT±X`.

### Fallbacks

- `prefers-reduced-motion`: render one static, time-correct frame. No ticks.
- WebGL unavailable: CSS linear-gradient of the current palette stops, no dither.
- JS disabled: static CSS dusk gradient; caption hidden.

## Tech and deploy

- One static `index.html`, inline CSS and JS. No build step, no dependencies beyond Google Fonts.
- Keep existing JSON-LD Person/Organization schema, updated to the new positioning. Keep canonical, OG, and description tags updated to match. og:image: 1200×630 static dusk capture at `/assets/og.png`.
- Repo: `informationlog.github.io`, GitHub Pages from `main`, CNAME `www.infolog.io`.
- Work happens on branch `placeholder-coming-soon`. Prior uncommitted homepage restyle is preserved in commit `81fc3b9`.
- Merge to `main` only on explicit go-ahead — that push is the deploy.
- Old site remains in git history. POV pages stay reachable by direct URL but unlinked.

## Accessibility

- Semantic landmarks: `header`/`main`/`footer` roles as appropriate; the sky panel is `aria-hidden` decoration with the caption as visible text.
- All text meets WCAG AA contrast on paper. Focus-visible styles on both links and the button.
- Reduced motion honored as above.

## Verification checklist

- [ ] Forced times render correctly: 05:30, 09:00, 13:00, 17:30, 20:45, 23:30 (`?t=`).
- [ ] Desktop and mobile screenshots match the approved mockups.
- [ ] Contrast checks pass for derived ink at noon (worst case: blue zenith stop).
- [ ] Reduced-motion, no-WebGL, and no-JS fallbacks verified.
- [ ] Lighthouse-class basics: title, description, OG, canonical, favicon present.
- [ ] Booking URL still placeholder — flagged before deploy.
