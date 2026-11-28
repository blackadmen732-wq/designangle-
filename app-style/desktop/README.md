# Desktop: dark glass

Desktop app screens on a near-black ground: a creative tool, an editor, a
launcher, a studio. The first two screens built with it are Mark's Cinema
sign-in and CINEVORA home (`app-style/examples/cinema-login`,
`cinevora-home`).

```
dark-glass.css   the style: colour roles, glass, and the desktop parts
icons.js         one stroke icon family plus Google, Discord and GitHub marks
art.js           DG.streaks(), DG.mark(), DG.enter()
```

## Start here

1. Copy the closest example as your starting file:
   `app-style/examples/tally-home` (a home or dashboard built on one
   number: money, orders, bookings, tickets; keep its order of parts),
   `app-style/examples/cinevora-home` (an app home with a sidebar),
   `cinema-login` (a sign-in or splash), `streaming-study` (a screen
   carried by photos).
2. Put `<meta name="platform" content="desktop">` in its head. The checks
   then test it at 1280 and 1440 wide and skip phone size.
3. Design for 1280 to 1440 wide. Nothing important may sit off screen at
   1280 x 900.
4. No logo file? Use `.brand-word`: the product name as type, never a
   drawn imitation of a logo.
5. Need a part that is not listed below? Add it to `dark-glass.css` with a
   comment, not a `<style>` block in the page, so the next screen has it.
6. Check: `node tools/slop.js <page> --desktop`, `node tools/check.js
   <page>`, and `node tools/match.js <page> <ref.png>` when there is a
   reference.

## Depth: four layers, always

1. **Ground** `#050506`. Black with the faintest lift. Never grey.
2. **Light** `.dg-art`, fixed behind everything. A few streaks, placed in
   the corners and behind the one thing the screen is about. Never across
   text you have to read.
3. **Glass** `.glass`. Panels, cards, fields: 3 to 6% white over the light,
   blurred, with a 1px edge. `.glass.rim` brightens the edge for the one
   panel that matters (the sign-in card).
4. **Content.** White text, cool grey secondary (8:1), one solid white
   button per screen.

## Material recipes

| Material | Recipe |
|---|---|
| Glass | `linear-gradient(180deg, white 6.5%, white 1.8%)` under a 5% grain, `blur(26px) saturate(140%) brightness(1.08)`, 1px edge at 16% white, an inset 1px highlight at the top |
| Light behind glass | `DG.glow()` at 3 to 8%: glass over pure black cannot look like glass, so put a little light behind it |
| Rim glass | edge at 32%, inset highlight at 22%, a 32px white glow at 6% |
| Hot white button | `#fff` to `#d9d9df` top to bottom, an inner shadow line at the bottom, a white glow that grows on hover |
| Outlined button | 2.5% white fill, 16% edge; on hover the edge goes to 42% and a soft glow appears |
| Streak | three strokes on one path: a 26 to 44px blurred glow at 22%, a 3x blurred core at 55%, a thin hot core; a gradient along the path so it is hottest at one point and fades at both ends; an optional soft sheet beside it |
| Chrome | a diagonal gradient white, light grey, a dark band at about 52%, light again, with a soft white glow |
| Dashed empty state | 1px dashed at 20% white, the icon, a heading, one line, one action |

## Parts

Window bar (`.winbar`, `.wincontrols`), top bar with search and a shortcut
key (`.topbar`, `.search`, `.kbd`), user chip (`.me`, `.avatar`), sidebar
with an active item (`.sidebar`, `.nav`, `.promo`), the work area
(`.work`, `.stage`, `.side`), welcome (`.hero`), tiles (`.tiles`,
`.tile`), section headers with a view toggle (`.section-head`, `.seg`),
empty states (`.empty`), quick actions (`.tools-row`, `.btn-glass`), side
panels (`.panel`), sign-in (`.signin`, `.wordmark`, `.tagline`,
`.card-signin`, `.field`, `.check`, `.link`, `.btn-white`, `.or`,
`.socials`, `.social`, `.signup`), media screens where photos carry the
light (`.topnav`, `.tabs`, `.billboard`, `.feature`, `.actions`,
`.circle`, `.rows`, `.strip`, `.card` with `.bar` progress and `.num`
ranks; first used in `app-style/examples/streaming-study`, a private study),
data (`.brand-word`, `.stat-label`, `.stat-num`, `.delta`, `.stats`,
`.table` with `.tr`, `.th`, `.name`, `.initials`, `.muted`, `.num`, and
`.status`, a dot and a word in three tones: `.good`, `.wait`, `.late`),
and screens built on a number (`.figure` with `.label`, `.amount`, `.sub`,
`.act`, `.hint`; `.facts`; `.list-head`; `.ledger` with `.who`, `.amt`,
`.state`, `.go`, `tr.done`; `.btn-quiet`; `.chev`; `.breakdown` with
`.meter`; `.lede`; `.bars` with `.now`; `.nav .count`). See
`tally-home` for all of them in place.

Icon names are listed at the top of `icons.js`.

## Screens with numbers

Found by a blind review of the same screen built by Haiku, Sonnet and Opus:

- **The action sits with the number.** The one white button goes right
  under or beside the big figure, never alone at the far edge.
- **Show what the number is made of.** Under the figure, say what is
  urgent (overdue in the warning tone) and split the total: a bar, or two
  smaller figures.
- **Every panel adds something new.** A side panel that repeats the table
  is clutter; use it for who owes what, or a trend.
- **Never cut a row in half.** Fit the rows to 900 tall, or end the list
  with "View all".
- **Make it theirs.** Copying `tally-home` gets the layout right, but a
  flower shop and an invoicing app must not look the same. Give each
  screen one thing only that business could have: a photo of its product
  in `.dg-art` or a side panel, an icon from its world in the figure's
  label, or its one accent (from the brief's brand) on the live state.
  A reviewer's first question is "what is this for?"; the screen should
  answer before the words do.
- **Three stat cards in a row read as a template.** Prefer one strip of
  figures divided by thin lines, inside the hero.

## Motion

- **Arrival:** each `[data-enter]` element rises 12px and fades in, 60ms
  after the one before, on the strong ease-out. `data-enter="side-l"` and
  `"side-r"` slide in from the sides instead. Call `DG.enter()` once.
- **Hover:** tiles lift 4px and glow; their arrow moves 4px. Buttons glow.
  Social buttons lift 2px. Presses scale to .97.
- **Light:** each streak drifts a few pixels and a fraction of a degree
  over 24 to 36 seconds, and a glint runs along its core.
- **Reduced motion:** the light stops, arrivals are instant, hovers do not
  move.

## The art step

- **Logos:** never draw one by hand. Take it from the reference with
  `tools/trace-logo.py` (skill: `logo-recreate`): a cutout for big uses, a
  traced SVG for small ones. The Cinema mark, wordmark and CINEVORA lockup
  in `app-style/examples/cinema-art/` were made this way.
- **Light:** `DG.glow()`, `DG.streaks()` and `DG.sweep()` (skill:
  `animated-backgrounds`).
- **Pictures code cannot draw** (photographed or 3D-rendered light, smoke,
  metal): render them in an image tool and put an `<img>` in `.dg-art`.
  Nothing else changes. Say which you did.

## Scoring

```bash
node tools/match.js app-style/examples/cinema-login .refs/cinema-login.png
node tools/match.js app-style/examples/cinevora-home .refs/cinevora-home.png
```

References live in `.refs/`, which git ignores. Where Playwright's browser
cannot be downloaded, set `CHROME_PATH` to any Chromium.
