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
| `accent` | The single brand colour. Buttons, eyebrows, the dot in the wordmark. | `#db2235` | `#0b63ce` |

The restaurant accent was `#e03a4b`, which is **4.31:1 on white** and fails the
4.5:1 rule this file sets, on text we were shipping. `#db2235` is the same hue
and saturation, darkened until it passes everywhere it is used:

| Use | Ratio |
|---|---|
| accent text on white (`.eyebrow`, `.msg.err`) | 4.89:1 |
| accent text on `--soft` `#fff4f1` (`.btn.locate`) | 4.53:1 |
| white text on an accent button | 4.89:1 |

`#fff4f1` is the binding case at 4.53:1, so do not lighten the accent past
this. `node tools/contrast.js darken "<colour>" "<ground>" 4.5` recomputes it
for a new client's brand colour and keeps the hue.
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

- Body text **17px**, line height **1.55**, measure **45 to 90 characters**.
  `54ch` gives that in Instrument Sans at 17px — measured, 45 to 60 per line.
  `ch` is the width of "0" in whatever font is loaded, so that number is only
  right for this face. Change the font and measure again.
- Headings: `letter-spacing: -0.02em` and `text-wrap: balance`.
- **Two weights only** per face. Use weight and colour for hierarchy before size.
- Uppercase labels get `letter-spacing: .14em`.
- Numbers in columns get `font-variant-numeric: tabular-nums`.

Defaults are Bricolage Grotesque (display) and Instrument Sans (text). Change them per
client, but keep the pairing shape: one characterful, one neutral.

## 4. Spacing and layout

- **Multiples of 8.** 8, 16, 24, 32, 48, 64.
  44 used to be in this list. It is the minimum touch target, not a spacing
  step, and having it here made the scale look arbitrary. It lives with the
  tap-target rule now.
- Side gutter never below 20px, written as `max(20px, env(safe-area-inset-left, 0px))`.
- Lay out with flex or grid and `gap`, not margins.
- Everything stacks to one column at 860px. Test at **400px wide**.
- The page must never scroll sideways.

## 5. Motion

**One tempo for the whole site.** The kit uses expo easing everywhere; do not mix in
bounce, elastic (except the thumbnail pop) or linear-looking curves.

| Thing | Duration | Ease |
|---|---|---|
| Interface feedback (buttons, hovers, tabs) | under 200ms | ease-out |
| Text reveals | 0.9s, 0.08s stagger | `expo.out` |
| Full-screen wipes, photo slides | 1.1 to 1.4s | `expo.inOut` |
| Anything scroll-linked or looping | n/a | `none` (linear) |

Standard CSS equivalents if you write a new effect:
What this kit actually runs, measured rather than intended:

- **Every CSS transition**: `cubic-bezier(.65, 0, .2, 1)`, from the single
  `--ease` variable in `template/site.css`.
- **Hero, showcase and wipes**: GSAP `expo.inOut`.
- **The one spring**: `back.out(1.6)`, on the locate button.
- **Anything scroll-linked**: `none`, i.e. linear. Correct, and the same
  choice Uber ships as `easeLinear`.

Two other curves used to be listed here. They appeared nowhere in the code,
so anyone matching an existing site from this file matched nothing. They are
gone.

The open question, not decided here because it changes how live sites feel:
one ease-in-out is doing entering, exiting and moving. Every published system
separates those three. `docs/research/motion-values-from-shipped-systems.md`
has the values and the argument.

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

## 9. What a request form must ask for

A lead the owner cannot act on is worth nothing, so every form asks for these
and names the first one missing when it is not filled in:

| Field | Why |
|---|---|
| Name | who to ask for |
| **Phone** | how they get called back. A lead with no phone number is not a lead |
| Email | optional, for the confirmation |
| **Street address** | service businesses only. A ZIP alone cannot be driven to |
| ZIP | checks the service area and gives the distance |
| What they need | sets how long the job takes |
| Date and window | **a window, never an exact time**. No trade can promise 2:00pm |
| Describe the problem | optional, and worth more than it looks: the make and model means the right part is on the van |

Group them under three short headings rather than listing a dozen fields: it
reads as less work. Mark optional fields as optional; everything else is
assumed required.

The collector refuses a lead with no name or no phone number, so a form that
is wired up wrong fails loudly instead of quietly filling the owner's list
with enquiries nobody can answer.

## 10. Before you ship

- [ ] Real content, no placeholder text left anywhere
- [ ] Real photos, one grade
- [ ] The call-to-action is in the header on every screen size
- [ ] Phone width 400px: no sideways scroll, nothing clipped
- [ ] Reduced motion on: page is complete and readable
- [ ] Keyboard: every control reachable, focus ring visible
- [ ] LCP under 2.5s on a phone connection
- [ ] `seo` block filled in with the real type, address and phone
- [ ] The form posts somewhere real, or is replaced by a link to the real booking system
- [ ] The form asks for a phone number, and an address if anyone has to drive there
- [ ] No invented claims
