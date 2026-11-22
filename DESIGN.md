# Design rules for this kit

These are the rules that keep every site built from this kit at the same quality.
They come from the research in `docs/research/`. Follow them unless a client's own
brand says otherwise. The client's wishes beat this file; this file beats personal taste.

An AI coding agent working in this repository should read this file before changing
anything in `template/` or adding a site.

---

## 1. The one rule above all others

**One memorable thing, everything else quiet.**

The kit gives you one signature moment: the pinned horizontal showcase that slides
sideways as you scroll. That is the moment. Everything around it stays calm. Adding a
second big effect does not double the impression, it halves it.

Award juries score **Design 40%, Usability 30%, Creativity 20%, Content 10%**. Most
ambitious sites lose on usability, not on missing effects. A hero that stutters costs
more than the effect earns.

---

## 2. Colour

Every site uses **two colours**: a deep ground and a warm light. Nothing else.

Set them in `content.js` under `theme`:

| Token | What it is | Restaurant | HVAC |
|---|---|---|---|
| `accent` | The single brand colour. Buttons, eyebrows, the dot in the wordmark. | `#e03a4b` | `#0b63ce` |
| `soft` | The tinted section background. A very pale version of the accent. | `#fff4f1` | `#f1f6fc` |
| `tint` | The blob behind the hero photo. Slightly stronger than `soft`. | `#ffe3dc` | `#dcebfb` |
| `ink` | Text. Near-black, never pure `#000`. | `#1e1512` | `#101820` |
| `muted` | Secondary text. | `#6f625c` | `#5b6672` |
| `line` | Hairlines and borders. | `#eee7e2` | `#e4e9ef` |
| `tag` | The small label colour (V, 24/7). Often the accent. | `#1f6b45` | `#0b63ce` |

Rules:
- **Tint the neutrals toward the accent.** A pure grey looks unconsidered. The restaurant's
  grey leans warm, the HVAC grey leans cool. That one shift is most of what makes it look
  deliberate.
- **Body text needs 4.5:1 contrast** against its background. Check it.
- **Do not add a third brand colour.** Per-slide `tint` values give variety.
- Avoid the AI defaults: indigo-to-purple gradients, cream with terracotta, near-black
  with one acid green.

## 3. Type

Two typefaces: one with character for headings, one plain for text. Both from Google Fonts,
set as `theme.fontsUrl`, `theme.display` and `theme.body`.

- Body text **17px**, line height **1.55**, measure **45 to 90 characters** (`max-width: 54ch`).
- Headings: `letter-spacing: -0.02em` and `text-wrap: balance`.
- **Two weights only** per face. Use weight and colour for hierarchy before size.
- Uppercase labels get `letter-spacing: .14em`.
- Numbers in columns get `font-variant-numeric: tabular-nums`.

Defaults are Bricolage Grotesque (display) and Instrument Sans (text). Change them per
client, but keep the pairing shape: one characterful, one neutral.

## 4. Spacing and layout

- **Multiples of 8.** 8, 16, 24, 32, 44, 64.
- Side gutter never below 20px, written as `max(20px, env(safe-area-inset-left, 0px))`.
- Lay out with flex or grid and `gap`, not margins.
- Everything stacks to one column at 860px. Test at **400px wide**.
- The page must never scroll sideways.

## 5. Motion

**One tempo for the whole site.** The kit uses expo easing everywhere; do not mix in
bounce, elastic (except the thumbnail pop) or linear-looking curves.

| Thing | Duration | Ease |
|---|---|---|
| Interface feedback (buttons, hovers, tabs) | under 300ms | ease-out |
| Text reveals | 0.9s, 0.08s stagger | `expo.out` |
| Full-screen wipes, photo slides | 1.1 to 1.4s | `expo.inOut` |
| Anything scroll-linked or looping | n/a | `none` (linear) |

Standard CSS equivalents if you write a new effect:
- Reveals: `cubic-bezier(0.33, 1, 0.68, 1)`
- Wipes and transitions: `cubic-bezier(0.76, 0, 0.24, 1)`

Rules:
- **Animate only `transform` and `opacity`.** Never width, height, top or left.
- **Never animate the navigation, the tabs or the main call-to-action.** Frequent actions
  must feel instant. Spend motion on the load, the hero and the scroll moment.
- Every animation must respect `prefers-reduced-motion`. The kit handles this centrally:
  with reduced motion on, the page is complete and static.
- **The page must be readable if the scripts never load.** All content is in the HTML.
  Never hide content behind an animation that may not run.

## 6. Photography

- **Real photos of the actual business**, always, if they exist.
- Free-licence stock (Unsplash, Pexels) is the fallback for demos and previews. Avoid
  photos with recognisable logos, artwork or faces you cannot clear.
- **One treatment on every photo.** The kit applies `saturate(1.04) contrast(1.03)`. Keep
  every image in one light and one grade, or the page looks assembled from parts.
- Export as **WebP at quality 74**, no wider than 1200px for cards and 1600px for the band.
  Aim under 150KB each.
- Write a real `alt` description for every photo.

## 7. Speed

Google's thresholds, which the site must meet on a phone:

| Measure | Target | Means |
|---|---|---|
| LCP | under 2.5s | the biggest visible thing appears |
| INP | under 200ms | taps respond |
| CLS | under 0.1 | nothing jumps |

- The first hero photo gets `fetchpriority="high"`; everything else is `loading="lazy"`.
- **No long preloader.** A three-second intro screen fails LCP on its own.
- Third-party booking widgets are the main threat to speed. Link out to the booking page,
  or load the widget only when the visitor opens it.

## 8. Content

- Write what the visitor recognises, not what the system calls it.
- Specific beats clever. "Fitted, wired and set up on your phone in one visit" beats
  "Premium smart home solutions".
- Buttons say exactly what happens: "Request this visit", not "Submit".
- Errors say what to do: "Add your name so we know who to ask for."
- Avoid em-dash asides, "not X but Y" phrasing and stock phrases.
- **Never invent facts about a client**: no guarantees, response times, certifications,
  prices or review counts that they did not give you. The example sites are clearly
  marked as invented for this reason.

## 9. Before you ship

- [ ] Real content, no placeholder text left anywhere
- [ ] Real photos, one grade
- [ ] The call-to-action is in the header on every screen size
- [ ] Phone width 400px: no sideways scroll, nothing clipped
- [ ] Reduced motion on: page is complete and readable
- [ ] Keyboard: every control reachable, focus ring visible
- [ ] LCP under 2.5s on a phone connection
- [ ] `seo` block filled in with the real type, address and phone
- [ ] The form posts somewhere real, or is replaced by a link to the real booking system
- [ ] No invented claims
