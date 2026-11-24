# Marketplace and delivery app patterns: a build reference

**Compiled 2026-11-24.** These apps redesign often — Google Maps moved its place page to a
sheet across 2024–2025, and Base is mid-migration from 1.0 to 2.0. Re-check anything
load-bearing at its source before you ship it.

## How to read this document

Every claim is tagged.

- **[PUBLISHED]** — the company published this value or rule, at a URL given here. Safe to
  quote and safe to copy.
- **[OBSERVED]** — a pattern from looking at these apps. Directionally right, not an
  official spec, and possibly already stale. Never present one of these as an official value.
- **[DERIVED]** — computed from a published formula (e.g. Base's type scale rule), not
  published as a number.

**A limit of this pass.** The two screenshot galleries available in this session, Mobbin
and Firecrawl's page scraper, both ran out of quota partway through. So the PUBLISHED
sections are first-hand and verified — the token values below were extracted from the
companies' own npm packages and their own documentation sites — but the OBSERVED sections
were **not** re-verified against current screenshots in this pass. Treat them as a
starting hypothesis to check against a real device, not as findings. Where a specific
detail is especially likely to have moved, it says so.

---

## 1. Which of these actually publish a design system

| App | Design system | Public site | Token values published? | Code / kits |
|---|---|---|---|---|
| Uber | **Base** | [base.uber.com](https://base.uber.com/) | Partly — rules and formulas public, the token tables sit behind SSO | **Yes** — `baseui` on npm, MIT, full token source |
| Google (Maps) | **Material 3** | [m3.material.io](https://m3.material.io/) | **Yes, completely** | **Yes** — `@material/web` on npm, Apache-2.0, plus official Figma kits |
| DoorDash | **Prism** | None public | No | No |
| Airbnb | **DLS** | None public | No | Tooling only (Lottie, react-sketchapp, Lona) |
| Starbucks | Creative Expression | [creative.starbucks.com](https://creative.starbucks.com/) | Brand only, not UI tokens | No |
| Deliveroo | **PDS 2.0** | design.deliveroo.net — **404 as of 2026-11-24** | Was public; unreachable now | No |
| Instacart | Internal | None public | No | No |

The practical upshot: **only two of these are usable as a token source — Uber's Base Web
and Google's Material 3.** Both are MIT/Apache and both ship real numbers. Everything
attributed to the other five is either brand-level or observation.

### Uber — Base

[base.uber.com](https://base.uber.com/). The public pages carry the *rules*; the token
tables are behind Uber SSO. But the open-source React implementation, `baseui`
([npm](https://www.npmjs.com/package/baseui), [GitHub](https://github.com/uber/baseweb),
MIT), ships the actual values, and §2 below is extracted from it (v18.2.0).

Published rules, quoted from [Base Typography 1.0](https://base.uber.com/6d2425e9f/p/976582-typography):

> It starts with a base font size of 14 and scales by multiplying 1.125 at each interval.

> Proper line height is achieved by multiplying the type size by 1.45 and rounding to the
> nearest interval of 4. This ensures all type aligns with our 4 baseline grid.

Spacing below a text block has its own published formula:
`Spacing = (Fontsize - lineheight) rounded to nearest 4` [PUBLISHED].

Three named principles [PUBLISHED]: **Go big** ("We prioritize larger font sizes because
the Uber experience values legibility and accessibility"), **Less is more**, **Simple
semantics**. Four type roles: Display, Heading, Label, Paragraph.

Type is **Uber Move** (Display / Text / Mono), proprietary. Published rule: use Move for
large titles and headings, *not* for labels, paragraphs and buttons. Use **Move Mono**
for money and isolated numerals, but not for nominal numbers like phone numbers or
addresses [PUBLISHED].

### Google — Material 3

[m3.material.io](https://m3.material.io/). The most complete of the lot: every token is
published with a value, there are official Figma kits, and `@material/web`
([npm](https://www.npmjs.com/package/@material/web), Apache-2.0) ships the generated token
files. §2 below is extracted from v2.5.0, token set `v0.192`.

**Important caveat.** Material 3's *baseline* palette is purple (`#6750a4`). Google Maps
does not use it. Google's own apps use an internal Google-brand variant of M3 ("GM3") with
Google Blue. So take M3's **structure, specs and type scale** as published truth, but do
**not** treat the M3 baseline hexes as Maps' colours.

### DoorDash — Prism

No public site. The one substantive public source is the engineering blog:
[Implementing Theming in DoorDash's Design Language System](https://careersatdoordash.com/blog/design-language-system-theming/)
(17 Dec 2020). It publishes the *architecture* but **no values**.

What it does tell you, and it is worth copying [PUBLISHED]:

- Two layers. **Tokens** are the raw atoms (`SystemBlue80`, `SystemGrey90`, `SystemRed60`)
  and never change. **Semantics** sit above them and name the *use*
  (`ButtonPrimaryBackground`, `TooltipInformationalBackgroundHovered`). Semantic names
  carry no hint of their value.
- Components reference Semantics only, never Tokens. That one discipline is what made
  theming possible at all — the Caviar acquisition was absorbed by re-pointing Semantics.
- Prism spans four platforms: Figma, iOS, Android, web. A new token must work on all four.
- Theming started with Colors, BorderRadius and Logos; Typography came second;
  Shapes and BorderWidths were being added at time of writing.

The naming convention is the transferable part. `ButtonPrimaryBackgroundPressed` is a
better name than `red-600`, and it is why DoorDash could ship two brands from one library.

### Airbnb — DLS

**There is no public Airbnb design system site, and no official token values.** This is the
most commonly misrepresented item in this space — the Figma "Airbnb DLS" community files
are fan recreations, and the community `DESIGN.md` files circulating with Airbnb hex codes
are observations, not Airbnb publications.

What *is* official:

- [Building a Visual Language](https://medium.com/airbnb-design/building-a-visual-language-behind-the-scenes-of-our-airbnb-design-system-224748775e4e) —
  Karri Saarinen, Airbnb Design, 2016. The origin write-up. Principles, no values.
- [airbnb.design/cereal](https://airbnb.design/cereal/introduction) and
  [Working Type](https://airbnb.design/working-type) — **Airbnb Cereal**, by Dalton Maag,
  May 2018. Proprietary; not licensable. The published motivation is legibility and
  accessibility at a wide weight range.
- [airbnb.io/projects](https://airbnb.io/projects) — the open-source *tooling*:
  **Lottie** (After Effects JSON animations, now industry-standard and used by Uber and
  Instacart among others), **react-sketchapp**, and **Lona**. None of these contain
  Airbnb's tokens. They are infrastructure, not a design system.

So: anything you see quoted as "Airbnb Rausch `#FF385C`" is [OBSERVED]. It is very
probably correct — it is sampled off the live product — but say so.

### Starbucks

[creative.starbucks.com](https://creative.starbucks.com/) is a real, public brand
expression guide (© 2020, so six years old). It covers **Color**, **Typography** and
**Illustration** at brand level, not UI level — there are no component specs, no spacing
scale, no tokens.

Published [PUBLISHED]: three typefaces, **SoDo Sans** (the workhorse, used for body copy;
weights Thin / Light / Regular / SemiBold / Bold / Black), **Lander** (serif, for
expressive accents), and **Pike**. On colour: "Our green is iconic… We're leaning into a
family of greens", with the rule that brand greens must be present either in the
composition or via the Siren logo. The page is JS-rendered and returned 503 on fetch in
this pass, so the specific hex swatches on it were **not** read first-hand — do not quote
a Starbucks hex from this document.

### Deliveroo and Instacart

Deliveroo ran a public system at **design.deliveroo.net** with a documented three-tier
token structure (core → semantic → component), Figma variables, and PDS 2.0 components.
As of 2026-11-24 every URL under that domain returns **404**. There is also a 2023
Deliveroo Design post on their colour system — 10 hues × 11 luminosity levels, built
around accessibility — which returned 403 on fetch. Treat both as leads to chase, not
as sources.

Instacart publishes **nothing**. Job listings reference a "Design Systems & Foundations"
team shipping "components, tokens, guardrails"; a former design leader's Substack mentions
a colour system that can shift between WCAG AA/AAA, high-contrast and monochrome modes,
which is an interesting idea but a second-hand one. Third-party sites hosting
"Instacart design.md" files are generated summaries, not Instacart material.

---

## 2. Published token values you can actually use

### Uber Base — type scale
Extracted from `baseui@18.2.0`, `themes/shared/typography.js` [PUBLISHED].

| Semantic name | Size | Weight | Line height |
|---|---|---|---|
| ParagraphXSmall | 12px | 400 | 20px |
| ParagraphSmall | 14px | 400 | 20px |
| ParagraphMedium | 16px | 400 | 24px |
| ParagraphLarge | 18px | 400 | 28px |
| LabelXSmall | 12px | 500 | 16px |
| LabelSmall | 14px | 500 | 16px |
| LabelMedium | 16px | 500 | 20px |
| LabelLarge | 18px | 500 | 24px |
| HeadingXSmall | 20px | 700 | 28px |
| HeadingSmall | 24px | 700 | 32px |
| HeadingMedium | 28px | 700 | 36px |
| HeadingLarge | 32px | 700 | 40px |
| HeadingXLarge | 36px | 700 | 44px |
| HeadingXXLarge | 40px | 700 | 52px |
| DisplayXSmall | 36px | 700 | 44px |
| DisplaySmall | 44px | 700 | 52px |
| DisplayMedium | 52px | 700 | 64px |
| DisplayLarge | 96px | 700 | 112px |

Read the structure, not just the numbers: **weight encodes role.** 400 = Paragraph,
500 = Label, 700 = Heading. The same 16px appears as both ParagraphMedium and LabelMedium,
differing only by weight and line height. That is how Base gets hierarchy out of one family.

Note the published guidance that **Paragraph XSmall (12px) must not be used for long-form
text on small devices** — max three lines, for legal disclaimers [PUBLISHED].

### Uber Base — spacing
`themes/shared/sizing.js` [PUBLISHED]. Root of 4, as the Dimensions page states.

```
scale0   2      scale550 14     scale850  28     scale1400  56
scale100 4      scale600 16     scale900  32     scale1600  64
scale200 6      scale650 18     scale950  36     scale2400  96
scale300 8      scale700 20     scale1000 40     scale3200 128
scale400 10     scale750 22     scale1200 48     scale4800 192
scale500 12     scale800 24
```

### Uber Base — phone layout
From [Base Dimensions](https://zeroheight.com/6d2425e9f/p/598458-dimensions) [PUBLISHED]:

| | iOS | Android |
|---|---|---|
| Nav bar height | 44 | 48 |
| Left & right margin | **16** | **16** |
| Artwork column (centred in) | 64 | 64 |

16px side margins on both platforms. That single number governs more of a delivery app's
look than any colour choice.

### Uber Base — radii
`themes/shared/borders.js` [PUBLISHED].

```
radius100  2px     buttonBorderRadius      8px    (mini 4px)
radius200  4px     inputBorderRadius       8px    (mini 4px)
radius300  8px     popoverBorderRadius     8px
radius400 12px     surfaceBorderRadius     0px    ← cards, modals, toasts
radius500 16px     tagBorderRadius        24px
                   checkboxBorderRadius    0px
```

**`surfaceBorderRadius: 0`** is the single most characteristic Base value. Uber's cards
and modals are square. Buttons and inputs get 8px; tags get a pill. If you want something
to read as "Uber", square the cards.

Borders are published as alpha on black, not grey hexes: `border100` through `border600`
are `hsla(0,0%,0%,0.04 / .08 / .12 / .16 / .2 / .24)`, all 1px solid. Alpha borders survive
a background change; hex borders don't.

### Uber Base — motion
`themes/shared/animation.js` [PUBLISHED]. Durations run `timing100` (100ms) through
`timing1000` in 100ms steps, then 1500/3000/5000/7000.

```
easeLinear                cubic-bezier(0, 0, 1, 1)         constant speed; opacity, colour
easeDecelerate            cubic-bezier(0.22, 1, 0.36, 1)   entering elements
easeAccelerate            cubic-bezier(0.64, 0, 0.78, 0)   exiting elements
easeAccelerateDecelerate  cubic-bezier(0.83, 0, 0.17, 1)   "a good default for most motion"
easeResponsiveAccelerate  cubic-bezier(0.11, 0, 0.5, 0)    pair with short durations
```

The comments are Uber's own. "Motion begins naturally and speeds up slightly. Good for
feeling of responsiveness when paired with short durations" is the one to use on taps.

### Uber Base — colour
`themes/light-theme/color-foundation-tokens.js` [PUBLISHED].

```
primaryA  #000000   (content)        accent300 #5B91F5   negative300 #E85C4A
primaryB  #FFFFFF   (background)     accent400 #276EF1 ← Uber blue
primary50  #F6F6F6                   accent500 #1E54B7   negative400 #E11900
primary100 #EEEEEE                                       positive200 #66D19E
primary200 #E2E2E2   warning300 #FFCF70                  positive300 #06C167 ← the green
primary300 #CBCBCB   warning400 #FFC043                  positive400 #048848
primary400 #AFAFAF                                       positive500 #03703C
primary500 #6B6B6B   negative100 #FED7D2
primary700 #333333   negative200 #F1998E
```

**`#06C167` (positive300) is the published Uber green**, shipped in Uber's own MIT library.
This is the one hex in this document you can cite for "Uber Eats green" without
qualification. `#276EF1` (accent400) is Uber blue.

The neutral ramp is a dedicated grey, not tinted: `gray50 #F3F3F3` → `gray900 #282828`
with pure `#000`/`#FFF` at the ends. (`platinum*` is deprecated in the source; don't use it.)

The architecture is worth copying regardless of the colours: **foundation → semantic →
component**, three files, with components never touching foundation. Same idea as Prism's
Tokens → Semantics.

### Material 3 — type scale
`@material/web@2.5.0`, token set `v0.192` [PUBLISHED]. Converted from rem at 16px base.

| Role | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| display-large | 57 | 64 | −0.25 | regular |
| display-medium | 45 | 52 | 0 | regular |
| display-small | 36 | 44 | 0 | regular |
| headline-large | 32 | 40 | 0 | regular |
| headline-medium | 28 | 36 | 0 | regular |
| headline-small | 24 | 32 | 0 | regular |
| title-large | 22 | 28 | 0 | regular |
| title-medium | 16 | 24 | 0.15 | medium |
| title-small | 14 | 20 | 0.1 | medium |
| body-large | 16 | 24 | 0.5 | regular |
| body-medium | 14 | 20 | 0.25 | regular |
| body-small | 12 | 16 | 0.4 | regular |
| label-large | 14 | 20 | 0.1 | medium |
| label-medium | 12 | 16 | 0.5 | medium |
| label-small | 11 | 16 | 0.5 | medium |

Note M3 **adds positive tracking as size decreases** (0.5px at body-small, 0 at headline).
Base does not track at all. Small text wants a little letter-spacing; this is the published
evidence for it.

### Material 3 — shape, elevation, state, motion
[PUBLISHED], same source.

```
corner-none 0   corner-small 8   corner-medium 12   corner-large 16   corner-full 9999

elevation  level0 0  level1 1  level2 3  level3 6  level4 8  level5 12   (dp)

state layer opacity   hover 0.08   focus 0.12   pressed 0.12   dragged 0.16

duration-short1..4    50 / 100 / 150 / 200 ms
duration-medium1..4   250 / 300 / 350 / 400 ms
duration-long1..4     450 / 500 / 550 / 600 ms
duration-extra-long   700 / 800 / 900 / 1000 ms

easing-standard              cubic-bezier(0.2, 0, 0, 1)
easing-standard-decelerate   cubic-bezier(0, 0, 0, 1)
easing-standard-accelerate   cubic-bezier(0.3, 0, 1, 1)
easing-emphasized            cubic-bezier(0.2, 0, 0, 1)
easing-emphasized-decelerate cubic-bezier(0.05, 0.7, 0.1, 1)
easing-emphasized-accelerate cubic-bezier(0.3, 0, 0.8, 0.15)
```

The **state layer** idea is the most portable: instead of defining a hover colour, overlay
the foreground colour at 8% / 12%. One rule covers every component in both themes.

### Material 3 — component specs
[PUBLISHED], extracted from the component token files.

| Component | Spec |
|---|---|
| **Navigation bar** | container-height **80dp**; icon **24dp**; active indicator **64 × 32dp**, `corner-full`; container `surface-container`, `corner-none`; active label `on-surface`, inactive icon `on-surface-variant`; label uses **label-medium (12/16)** |
| **FAB (primary)** | **56 × 56dp**, icon 24dp, `corner-large` (16dp — *not* a circle in M3), container `primary-container`, elevation **level3 (6dp)**, hover level4, lowered level1 |
| **Extended FAB** | height **56dp** |
| **Filled button** | height **40dp**, `corner-full`, label **label-large (14/20)** |
| **Search bar** | height **56dp**, `corner-full`, container `surface-container-high`, elevation level3 |

Two things designers get wrong and this settles: the M3 nav bar is **80dp**, not 56; and
the M3 FAB is a **16dp rounded square**, not the M2 circle.

---

## 3. The food delivery home screen [OBSERVED]

Everything in this section is observation and was not re-verified against screenshots in
this pass. Check against a live build.

The stack is consistent across Uber Eats, DoorDash and Deliveroo, top to bottom:

1. **Address bar** — the delivery address as a tappable control with a chevron, often
   paired with a Delivery/Pickup toggle. It sits *above* search, because it changes the
   whole result set. Usually truncated to one line with the street only.
2. **Search field** — a pill, placeholder like "Food, groceries, drinks, etc."
3. **Category row** — horizontally scrolling, circular or rounded-square icon + short
   label beneath, roughly 8–14 items. These are illustrated food images, not line icons;
   the illustration quality does a lot of the brand work.
4. **Promotional carousel** — wide cards, full-bleed image, overlaid or below-set text.
5. **Section headers** with a "See all" affordance.
6. **Restaurant card list/grid.**

### What a restaurant card carries

In rough priority order as observed:

- **Image**, 16:9 or 3:2, top of card, corner-rounded (Uber Eats rounds; Base's
  `surfaceBorderRadius: 0` applies to Base *surfaces*, not Eats' imagery — do not conflate).
- **Promotion badge** overlaid on the image, top-left — e.g. "Buy 1, Get 1 Free",
  "20% off". Brand-coloured fill, white text, small radius.
- **Favourite / heart** overlaid top-right.
- **Name**, one line, truncated with ellipsis, the strongest label on the card.
- **Rating** — numeric to one decimal (`4.7`) with a star glyph, frequently with a review
  count in parentheses. Note that Uber Eats shows the number, not five stars.
- **Delivery fee** — "$0.99 Delivery Fee", or "Free" / "$0 delivery fee" when promoted.
- **Delivery time** — a range ("25–40 min"), not a point estimate.
- **Secondary chips** below: cuisine tags, distance, "Top Rated", DashPass/Uber One badge.

The metadata row is where the pattern lives: **rating · time · fee**, separated by middots,
in a smaller muted label, one line. If you build one component from this document, build
that row — it is the densest piece of information in the entire category and it appears on
every card in every app in scope.

**Two layouts, used deliberately.** A full-width card with a large hero image for the
primary feed, and a compact horizontal card (small square thumbnail left, text right) for
dense lists, search results and "order again" rows. Both carry the same metadata row.

---

## 4. The listing / detail screen [OBSERVED]

### Airbnb listing page

- **Hero**: a gallery, swipeable, with a counter ("1 / 28") and a grid-view entry point.
  Image is edge-to-edge and tall — roughly 40–50% of the viewport.
- **Title block**: listing title at heading weight, then a secondary line with property
  type, location, and capacity (guests · bedrooms · beds · baths).
- **Rating row**: numeric rating, star, review count as a tappable link, host superlatives.
- **Host row**: avatar, "Hosted by X", host tenure.
- **Body**: amenities summary, description with "Show more", a calendar, a map, reviews
  with sub-rating bars, house rules.
- **Primary action**: **sticky bottom bar** with price on the left ("$180 night", with the
  dates below as a link) and a **Reserve** button on the right. The price and the button
  live in the same bar; this is the defining Airbnb layout decision.

### Google Maps place page

Now a **bottom sheet** rather than a full screen, across both platforms — the map stays
visible above it and the sheet drags to several detents. Closing is an **×** at top-right
of the sheet, replacing the older back arrow
([9to5Google, Jan 2025](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/),
[iPhone, Mar 2025](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/)).

Structure within the sheet:

- **Photo strip** at top — a row/grid of photos rather than one hero.
- **Title block**: place name, then rating · review count · price level · category.
- **Action icon row** — the signature Maps component: 4–6 evenly spaced
  **icon-above-label** buttons, typically **Directions / Save / Nearby / Send to phone /
  Share**. Directions is the emphasised one. Icon ~24dp, label at label-medium.
- **Tab strip**: Overview / Reviews / About / Photos / Updates, scrollable.
- **Body**: address, hours (expandable), phone, website, popular times, reviews.
- **Primary action**: **Directions** — it appears twice, once in the icon row and once as
  a prominent filled button, which is a deliberate redundancy worth noting.

The shared skeleton across both: **hero → title → rating row → action row → tabs → body →
sticky primary action.** Airbnb puts its primary action in a sticky bar; Maps puts it in
the icon row and repeats it.

---

## 5. The primary action

| App | Colour | Status | Shape | Placement |
|---|---|---|---|---|
| Uber Eats | **`#06C167`** | **[PUBLISHED]** — `positive300` in `baseui` | Rounded; Base `buttonBorderRadius` is 8px [PUBLISHED] | Sticky bottom bar on cart/checkout [OBSERVED] |
| Uber (rides) | **`#000000`** | **[PUBLISHED]** — `primaryA` | 8px | Sticky bottom [OBSERVED] |
| Airbnb | `#FF385C` ("Rausch") | **[OBSERVED]** — Airbnb publishes no tokens | ~8px, often a gradient on the Reserve button | **Sticky bottom bar**, right side, price on left [OBSERVED] |
| Google Maps | Google Blue (~`#1A73E8`) | **[OBSERVED]** — this is Google-brand, *not* the M3 baseline `#6750a4` | M3 `corner-full` (pill) for filled buttons [PUBLISHED] | In the sheet's action row, repeated as a filled button [OBSERVED] |
| DoorDash | Red | **[OBSERVED]** — Prism's own blog uses `SystemRed60` as the example `ButtonPrimaryBackground` [PUBLISHED, as an example not a value] | — | Sticky bottom [OBSERVED] |
| Starbucks | Starbucks green | Brand green is published as a concept; the hex was not read first-hand here | — | — |

The pattern underneath: **one saturated brand colour, used once per screen, on a
full-width or near-full-width sticky bottom button.** Uber's own stated principle — "one
bold primary button per view" — is the general rule in this category. Sticky is the norm
on any screen with a commitment at the end of it (cart, checkout, reserve); not sticky on
browse screens, which have no single action.

The published shape values diverge sharply and this is a real fork in the road:
**Base uses 8px on buttons; M3 uses a full pill.** Pick one deliberately. An 8px button
reads utilitarian and transactional; a pill reads friendlier and more Android-native.

---

## 6. Bottom navigation

**[PUBLISHED], M3**: navigation bar is **80dp** tall, container `surface-container`, square
corners, icons **24dp**, labels at **label-medium (12/16)**. The active state is a
**64 × 32dp pill-shaped indicator** behind the icon, plus `on-surface` for the active label
against `on-surface-variant` for inactive icons. M3 supports 3–5 destinations.

**[OBSERVED]** across the apps in scope:

- All use a **fixed tab bar pinned to the bottom**, not a floating bar. Floating bars are
  a Dribbble convention more than a shipped one in this category.
- **Typically 4–5 items.** Uber Eats: Home, Browse/Grocery, Carts, Orders, Account.
  DoorDash: Home, Grocery, Retail, Orders, Account. Airbnb: Explore, Wishlists, Trips,
  Messages, Profile.
- **Active state is colour + filled icon**, not an indicator pill, on iOS builds. Inactive
  icons are outline style and a muted grey; active is the brand colour (or black) with a
  filled glyph. The M3 pill indicator is Android-side.
- **Badges** — a numeric count on Orders/Carts, a dot on Messages.
- **Uber Eats' cart FAB**: a green circular/pill floating cart button sitting *above* the
  tab bar, bottom-right, showing item count and often cart total. This is the clearest
  "FAB plus tab bar" case in the category, and the reason is specific: the cart is a
  cross-screen persistent state, so it gets a persistent affordance that outranks
  navigation. **Treat this as observed and re-check it** — Uber Eats has moved the cart
  between a FAB, a tab-bar item and a top-bar icon more than once.

Design rule from this: **add a FAB only for a persistent, cross-screen, in-progress state.**
Everything else belongs in the tab bar.

---

## 7. Empty states, loading and skeletons [OBSERVED]

This is the section most reference docs skip and the one the user sees on every cold open.

**Skeletons, not spinners.** All the apps in scope render the *shape* of the content while
loading: grey blocks at the exact dimensions of the image, title, and metadata row of a
restaurant card. The category row skeletons as grey circles. This matters because the
layout does not shift when data arrives.

Practical notes:

- Skeleton fill is a very light neutral — around Base's `primary100 #EEEEEE` or
  `gray100 #E8E8E8`, animated with a slow shimmer or a gentle opacity pulse. M3's
  `surface-container` family serves the same role.
- **Match the real text's line height, not its character count.** A skeleton line at 16px
  tall with the real 24px line box leaves the right gap.
- The skeleton should carry the **same corner radius** as the real element.
- Use Base `easeLinear` for shimmer (constant speed is right for a repeating loop) and a
  long duration — `timing1500` or more. A fast shimmer reads as anxiety.

**Progressive, not all-or-nothing.** The address bar and tab bar render immediately from
local state; only the feed skeletons. Chrome should never skeleton — it is known before
the network call returns.

**Image loading.** Cards show a solid neutral placeholder at the final aspect ratio, then
cross-fade the image in. A fade of roughly `duration-short4` (200ms) with
`easing-standard-decelerate` is appropriate; longer reads as sluggish on a fast connection.

**Empty states** split into three kinds and they need different treatments:

| Kind | Example | Treatment |
|---|---|---|
| **Nothing yet** | No past orders, empty wishlist | Illustration + one line of copy + a primary button that starts the flow ("Browse restaurants"). This is the only empty state that gets an illustration. |
| **Nothing found** | Search with no results, filters too narrow | No illustration. State what was searched, then offer the escape: clear filters, widen radius, suggest alternatives. Never a dead end. |
| **Nothing available** | Address outside delivery zone, all restaurants closed | The hardest one and the most commonly botched. Needs a concrete alternative: switch to pickup, schedule for later, change address. Make the recovery action the primary button. |

The third is where delivery apps differ from generic products, and it is worth designing
properly: "closed" is a time problem with a scheduling answer, and "out of zone" is a
location problem with an address-change answer. Neither should produce a shrug.

**Errors.** Inline and retryable, not a modal. A failed section shows its own retry within
the section's bounds; the rest of the feed stays usable.

---

## 8. Accessibility and localisation

### Published

- **Base**: "We prioritize larger font sizes because the Uber experience values legibility
  and accessibility" [PUBLISHED]. Paragraph XSmall (12px) is explicitly restricted — max
  three lines, not for long-form, "the smaller size can strain the eyes" [PUBLISHED].
  Use Paragraph Medium (16) or Large (18) for multi-line text [PUBLISHED].
- **Base on links**: "Links embedded inside a sentence can be unfriendly to screen readers
  and localization. It's much better to use a link or button below a paragraph." If you
  must inline a link, **underline it** — "Avoid using text color alone because an underline
  is a more visible, accessible option" [PUBLISHED]. This is a localisation point as much
  as an accessibility one: inline links break when word order changes in translation.
- **Base on numerals**: use the Mono ramp where "the legibility of every character is
  critical", e.g. codes read from a distance [PUBLISHED].
- **Prism**: the stated reason for centralising components is that a team rolling its own
  button will miss "a key accessibility feature, which could hurt some end users'
  abilities to use the application" [PUBLISHED]. Prism components are built "with key
  concepts like accessibility and internationalization in mind".
- **M3 state layers** (hover 0.08 / focus 0.12 / pressed 0.12) [PUBLISHED] give every
  component a visible focus state for free — including keyboard and switch-control users.
- **Airbnb Cereal** was commissioned with legibility and accessibility as a stated goal
  ([airbnb.design](https://airbnb.design/cereal/introduction)).

### What a small studio misses

These are the constraints these apps visibly design around.

1. **Dynamic Type / font scaling.** iOS users can push text well past 200%. The
   `rating · 25–40 min · $0.99` metadata row is the first thing to break — it wraps to
   three lines and destroys the card. Design that row at the largest scale first, or make
   it wrap gracefully to two lines by intent.
2. **Touch targets.** 44pt (iOS HIG) / 48dp (Android). The heart icon overlaid on a card
   image and the "See all" link are the usual offenders — both tend to be drawn at the
   size of their glyph.
3. **String expansion.** German and Finnish run 30–40% longer than English; "Delivery Fee"
   becomes "Liefergebühr", "Buy 1, Get 1 Free" becomes much worse. Promotion badges
   overlaid on images are the single most fragile element in a delivery UI, because they
   are sized to English and sit on a fixed-width image. Give them a max-width and a
   truncation rule, or design a two-line variant.
4. **RTL.** Arabic and Hebrew mirror the entire layout: the card thumbnail moves to the
   right, chevrons flip, the back arrow flips. Numerals and the star rating do **not**
   mirror. The action icon row in a Maps-style sheet reverses order.
5. **Numerals and currency.** Arabic-Indic digits, comma decimal separators, currency
   symbol position (prefix vs suffix), and **distance units** (km vs mi) — a delivery app
   shows distance on nearly every card.
6. **Time formats.** 24-hour clocks in most of Europe; opening-hours rows need both.
   Delivery time *ranges* ("25–40 min") localise the dash and the unit separately.
7. **Colour is never the only signal.** "Open" vs "Closed", promotion badges, and the
   rating colour must all carry text or an icon too. ~8% of men have a colour vision
   deficiency, and green/red status pairs are exactly the failure case.
8. **Contrast on image overlays.** The promotion badge and the favourite icon sit on
   arbitrary user-supplied food photography. Without a scrim or a solid badge fill, the
   contrast ratio is undefined. Solid fills, not transparency, on anything over an image.
9. **Reduced motion.** The skeleton shimmer, carousel auto-advance and sheet transitions
   should all respect the OS setting. A shimmer that cannot be turned off is a vestibular
   trigger that runs on every cold open.
10. **Screen reader grouping.** A restaurant card must read as **one** element —
    "Joe's Pizza, 4.7 stars, 312 reviews, 25 to 40 minutes, 99 cent delivery fee,
    20 percent off" — not as eight separate focusable fragments. This is the most common
    and most damaging mistake in a card-based feed.

---

## 9. What to take from this

If you build one thing from this document, build the **token architecture**, not the
screens. Both systems that publish anything real (Base, Prism) converged independently on
the same three layers:

```
foundation / tokens      raw values, never used directly    #06C167, 16px, 8px
        ↓
semantic                 named by role                      ButtonPrimaryBackground
        ↓
component                consumes semantics only            Button, Card, NavBar
```

That is what let DoorDash absorb Caviar's entire brand without touching component code,
and what lets Base ship light and dark from one source.

Then the three numbers that do most of the visual work: **16px side margins**
(Base [PUBLISHED], both platforms), a **4px spacing root**, and **one brand colour used
once per screen** on a sticky bottom action.

## Sources

**Published, first-hand (values extracted from the companies' own packages/sites):**
- Uber Base — [base.uber.com](https://base.uber.com/) · [Typography 1.0](https://base.uber.com/6d2425e9f/p/976582-typography) · [Dimensions](https://zeroheight.com/6d2425e9f/p/598458-dimensions)
- Base Web — [npm `baseui`](https://www.npmjs.com/package/baseui) · [github.com/uber/baseweb](https://github.com/uber/baseweb) (MIT) — v18.2.0 read directly
- Material 3 — [m3.material.io](https://m3.material.io/) · [npm `@material/web`](https://www.npmjs.com/package/@material/web) (Apache-2.0) — v2.5.0, token set v0.192, read directly
- DoorDash Prism — [Implementing Theming in DoorDash's Design Language System](https://careersatdoordash.com/blog/design-language-system-theming/), 2020-12-17
- Starbucks — [creative.starbucks.com](https://creative.starbucks.com/) ([Typography](https://creative.starbucks.com/typography/), [Color](https://creative.starbucks.com/color/)) — typography read via index; colour page returned 503

**Published, secondary (read but not value-bearing):**
- Airbnb — [Building a Visual Language](https://medium.com/airbnb-design/building-a-visual-language-behind-the-scenes-of-our-airbnb-design-system-224748775e4e) · [Cereal](https://airbnb.design/cereal/introduction) · [airbnb.io/projects](https://airbnb.io/projects)
- Uber — [Introducing Base Web](https://www.uber.com/blog/introducing-base-web/) · [How to Measure Design System at Scale](https://www.uber.com/us/en/blog/design-system-at-scale/)
- Google Maps sheet redesign — [9to5Google Android](https://9to5google.com/2025/01/21/google-maps-redesign-sheets/) · [9to5Google iPhone](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/)

**Unreachable in this pass (leads, not sources):**
- design.deliveroo.net — 404 on every URL as of 2026-11-24
- [Deliveroo Design, Brightening up accessibility](https://medium.com/deliveroo-design/brightening-up-accessibility-with-a-new-colour-system-5921915641ed) — 403
- Instacart — publishes nothing; third-party "design.md" files are generated, not official
- Mobbin and Firecrawl scraping both hit quota limits, so §3–§7 observations were not
  re-verified against screenshots in this pass
