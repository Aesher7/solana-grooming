# Solana Dog Spa - Website Project Documentation

## Project Overview
Static marketing site for Solana Dog Spa, a dog grooming business in Craig, Colorado.
Hand-written HTML/CSS/vanilla JS, no build step, no framework.

The site was restyled from a light/dark hybrid template into an all-dark
"engineered instrument" system. **The brand palette did not change** — the same
black/orange/gold hexes carried over by value. What changed is typography, shape,
layout, and motion.

**GitHub Repo:** https://github.com/Aesher7/solana-grooming

---

## Business Information
- **Business Name:** Solana Dog Spa (formerly Solana Dog Grooming)
- **Location:** 575 Yampa Ave, Craig, CO 81625
- **Phone:** (970) 326-9788
- **Email:** solanadogspa@gmail.com
- **Facebook:** https://www.facebook.com/p/Solana-Dog-Spa-61573825206247/

### Business Hours
- Monday: Closed
- Tuesday - Saturday: 9:00 AM - 4:00 PM
- Sunday: Closed

---

## Design System

All tokens live on `:root` in `style.css`. Nothing is hardcoded in rules.

### Surfaces
Four near-black steps. The design brief called for tinting these toward the accent
hue; that was **deliberately skipped** because warming `#0f0f0f` would shift the
brand's base colour. `--bg-2` is the one new value, interpolated between the
existing blacks so sections have something to alternate against.

```css
--bg: #0f0f0f;        /* was --black, unchanged */
--bg-2: #141414;      /* new interpolated step */
--surface: #1a1a1a;   /* was --black-light */
--surface-2: #222222; /* was --black-lighter #2a2a2a, pulled down one notch so
                         --faint still clears 4.5:1 on it */
```

### Accent
Orange is the accent family, gold the second. **No semantic green** — with no
live-status pill on the site there is nothing for it to signal.

```css
--accent: #ff8c42;  --accent-2: #d4af37;
--accent-deep: #e67e22;  --accent-dim: #ffb380;
--border: rgba(255,140,66,.12);     /* hairlines, never solid grey */
--border-hi: rgba(255,140,66,.55);  /* hover only */
--grad: linear-gradient(135deg,#ff8c42 0%,#e8a04a 50%,#d4af37 100%);
```

**`--grad` has exactly four sanctioned uses:** headline emphasis, big numbers,
the primary button, and the nav progress bar. Do not add a fifth.

### Text
Three weights, all verified ≥4.5:1 against `--surface-2` (the lightest surface any
of them can land on). Lowest pair is `--faint` on `--surface-2` at 5.58:1.

```css
--text: #ffffff;  --muted: #e0e0e0;  --faint: #999999;
```

`#666666` from the old build is **retired** — it was 3.3:1 on black and only ever
survived on the white sections that no longer exist.

### Shape — the strongest signature
Asymmetric chamfers. One pair of corners sharp, the opposite pair carved. There is
no plain `border-radius` anywhere except on the decorative gradient washes, where
the radius describes an invisible shape rather than a visible edge.

```css
--r-card: 3px 18px 3px 18px;
--r-btn:  2px 13px 2px 13px;
--r-sm:   2px 10px 2px 10px;
```

### Type
Three families, one Google Fonts request, with real fallback stacks so a blocked
CDN degrades rather than breaks.

- `--display` **Bricolage Grotesque** — 800, uppercase, `font-variation-settings:'opsz'`
  set per size (96 on the hero, ~16 on card headings). Larger opsz keeps the hero
  from going soft.
- `--sans` **Space Grotesk** — body and UI.
- `--mono` **Space Mono** — load-bearing, not a code style. Every eyebrow, label,
  date, price caption, chip, nav link and footer line.

Size contrast is extreme on purpose: hero at `clamp(46px,7.8vw,108px)` sitting
directly above 12px mono. Everything non-display uses only `--t11/12/13/14/16/18/20`.

### Space
4px scale, `--s4` … `--s128`. `--section-y: clamp(96px,11vw,152px)`. Content maxes
at 1160px. Prose is capped in `ch` (46–58), never px.

---

## File Structure

```
solana-website/
├── index.html      # hero, credentials, services, reviews, visit, closing
├── services.html   # size bento, add-on chip lists
├── hours.html      # contact grid, hours rail, map
├── booking.html    # phone-first, why-call bento, quick facts
├── privacy.html    # numbered policy prose
├── style.css       # the whole system (~1200 lines, commented)
├── script.js       # palette, motion, pointer interactions
├── logo.png        # Golden Retriever + mountains + "SOLANA DOG SPA" wordmark
└── CLAUDE.md
```

---

## Layout — every section differs from the one before it

A page of identical 3-across card grids is the failure mode this system exists to
avoid. The patterns in rotation:

- **Asymmetric span grid** (`.spangrid`) — 3 cols, cells spanning 2+1 then 1+2.
  Exactly as many cells as items, never a filler tile. Wide cells earn the width
  with larger icons and headings, not by stretching the same content.
- **Bento** (`.bento`) — 4 cols, mixed spans, one cell on `--surface-2` so it never
  reads as N identical dark rectangles.
- **Rail timeline** (`.rail`, hours.html) — mono days right-aligned left of a
  hairline, times right, dots straddling, gradient line drawn on scroll scrub,
  bottom masked so it tapers instead of stopping dead.
- **Overlapping split** (`.overlap`, index.html reviews) — used **exactly once on
  the site**. The second card starts a column early and is pushed down to lap the
  first's corner; the underlying card reserves right padding so its text never runs
  beneath the overlap. A second instance would turn an accent into a pattern.
- **Hairline-grouped chip lists** (`.group` + `.chips`) — for dense small items.
  services.html uses these for add-ons and specialty cuts; twelve near-identical
  pricing cards was exactly the failure mode.

Breakpoints **1020 / 920 / 700**. At 700 every `grid-column` span is reset to `auto`
explicitly — a `span 2` surviving into a 1-column grid creates a phantom column.

---

## Motion

GSAP + ScrollTrigger from CDN, gated behind a `body.js` class.

**All entrances use `gsap.from()`** — never a hidden initial state in CSS. If the
CDN is blocked the page is simply visible and static.

**Shared language:** every display heading, hero included, reveals identically — JS
wraps each line in an `overflow:hidden` mask and the inner span rises from
`yPercent:110`. This is what makes five separately-laid-out pages read as one system.
The hero is the only load-time animation; everything else is scroll-triggered.

**Per-section verbs** (via `data-verb`), so the page reads as a sequence:

| Verb | Behaviour |
|---|---|
| `settle` | cards arrive from the grid's start with a slight overshoot — `back.out(1.4)`, the one use on the site |
| `tilt` | cells rotate up from below on `rotateX`, hinged at their bottom edge |
| `chips` | populate fast and tight, quicker than any other entrance |
| `place` | one card arrives rotated 2.4° and scaled 0.96, settling flat |
| `calm` | the closing section — nothing overshoots, nothing rotates |

Plus the rail, which draws on scrub while rows enter from alternating sides.

**Pointer:** 3D tilt ≤7° (rAF-throttled, `(hover:hover)` only); magnetic pull on
**exactly two** CTAs site-wide, clamped to 12px so neither leaves its hit box;
cursor-following radial card highlight via `--mx`/`--my`.

**`prefers-reduced-motion`** is honoured properly, not blanket-disabled: durations
zeroed, the progress bar and ornament **removed** rather than stranded, line masks
unset to `overflow:visible`, and the rail shown in its finished state.

---

## Components

- **Cards** — hairline border, chamfered, asymmetric padding (more at the bottom to
  balance the corner-pinned index number). Hover: `--border-hi` plus a long lift
  shadow `0 22px 60px -20px` — heavily negative spread, a lift and not a glow.
- **Buttons — two weights only.** Primary: `--grad` with near-black ink, inset white
  top highlight, solid dot before the label. Ghost: hairline on translucent surface.
  A third weight, where needed, is `.tlink` — mono with an offset underline.
- **Nav** — sticky 62px, `backdrop-filter: blur(14px)`, one hairline bottom border,
  2px gradient progress bar driven by **one scrubbed ScrollTrigger** (never a scroll
  listener).
- **⌘K command palette** — Cmd/Ctrl+K, mono input, filtered arrow-navigable list,
  Esc closes and returns focus to the opener. Gradient border via the
  padding-box/border-box double-background trick, the one place a gradient border is
  earned. **On mobile it becomes the "Menu" button and fully replaces the hamburger.**

---

## Accessibility

- Every text/surface pair verified ≥4.5:1; lowest is 5.58:1.
- The primary button is near-black ink on the gradient at **8.29:1 against the
  lightest stop**. The previous build used white on `#ff8c42` at ~2.1:1, which
  failed AA outright.
- Global `:focus-visible` — 2px accent outline, 3px offset. Hover-only affordances
  (nav underline, card highlight) also fire on focus.
- Skip link, `<main>`/`<nav>`/`<footer>` landmarks, `aria-label` on repeated nav,
  `aria-hidden` on every ornament, wash and decorative icon.
- The rating is conveyed in text as well as stars, via a `.visually-hidden`
  clip-rect paragraph.

---

## Hero background — read before touching

`logo.png` carries the "SOLANA DOG SPA" wordmark *below* the artwork. A centred
`cover` crop drags that wordmark into the bottom of the hero as a ghosted serif
blob. Two values handle it, and they are load-bearing:

- Desktop: `background-position: center 18%` — pushes the wordmark out of frame.
- ≤700px: `background-size: auto 145%; background-position: 62% 8%` — on a narrow
  tall hero, `cover` scales to fit the *height*, so the whole image comes back into
  frame regardless of position. Oversizing re-crops it out.

A pre-cropped asset was tried and reverted: at 2.5:1 it forced `cover` to scale by
height on desktop and blew the dog up to fill the viewport.

The scrim is a **left-weighted linear gradient**, not a text-shadow — the type sits
on controlled darkness while the dog stays legible on the right.

---

## Pricing Structure

### Base Grooming (includes bath, blow dry, nail trim, ear cleaning, sanitary trim)
- Small: $48-$78
- Medium: $78-$93
- Large: $88-$118
- XL: $100-$150+

### Add-Ons
- Teeth Brushing: $10
- Anal Gland Care: $10
- De-Shed Treatment: $10-$50
- Specialty Cuts: $10-$50
- Paw Cream Treatment: $10
- Spa Treatment: $15-$35

### Special Handling: $10-$45
(For anxious dogs, rescues, seniors, behavioral concerns)

### Specialty Cuts
Hand scissor finish, clean feet, clean face, lamb cut, puppy cut, show cut.

---

## Important Notes

⚠️ **CRITICAL:** Owner does NOT want online scheduling automation. All bookings are
handled via direct phone contact: (970) 326-9788. `booking.html` is built around
this deliberately — the phone number *is* the interface.

⚠️ **The palette is fixed.** The black/orange/gold hexes above are the brand and are
not to be changed. Restyling work happens through type, shape, layout and motion.

- No Instagram anywhere on the site.
- No emoji as iconography — Font Awesome only. (The brief bans emoji icons, not
  icon fonts.)

---

## Dependencies

CDN only, all with SRI hashes and `crossorigin`:
- GSAP 3.12.5 + ScrollTrigger (cdnjs)
- Font Awesome 6.4.0 (cdnjs)
- Google Fonts: Bricolage Grotesque, Space Grotesk, Space Mono — one request

No npm, no build tools. The site must work with all three blocked.

---

## Verification

```bash
cd /Users/andreesher/Desktop/solana-website && python3 -m http.server 8000
```

Then check, on all five pages:

1. **JS off** — every section visible, layout intact, nav usable (links stay in the
   bar and the ⌘K button hides itself, since nothing can open it).
2. **CDN blocked** — content visible and unanimated, fallback fonts legible.
3. **Reduced motion** — no animation, progress bar gone rather than stuck, headings
   not clipped by their masks, rail in its finished state.
4. **Breakpoints** 1020 / 920 / 700 / 390 — no horizontal scroll, spans reset at 700,
   overlap fully unstacked, ornament hidden below 1020.
5. **Keyboard** — skip link first, visible ring on every stop; ⌘K opens, arrows move,
   Enter activates, Esc closes and restores focus.

Note on screenshots: headless Chrome enforces a ~500px minimum window width on
macOS, so `--window-size=390` renders a 500px layout cropped to 390 and produces
false overflow. To test a true 390px viewport, load the page in a 390px-wide
`<iframe>` — media queries then evaluate against the frame.

---

## Last Updated
September 1, 2026 — all-dark restyle across all five pages.

**Created with Claude Code** 🐕✨
