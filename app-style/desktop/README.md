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
ranks; first used in `app-style/examples/streaming-study`, a private study).

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
