# Why AI design comes out generic, and what this repo does about it

Short on purpose: read it once, then follow the fixes. Each cause names the
file that fixes it.

| # | Why it looks generic | The fix here |
|---|---|---|
| 1 | **It guesses the brief.** No audience, mood or reference, so it picks the average of everything it has seen. | `brief/TEMPLATE.md`: fill it first; ask up to five questions rather than guess. |
| 2 | **It has nothing to aim at.** "Make it premium" is not a target; a screenshot is. | The brief's references, and `tools/match.js` to aim at them. |
| 3 | **It never looks at what it made.** It writes code and calls it done, so misplaced, cramped or clashing things survive. | Render and look, every time: `tools/match.js` (against a reference), `tools/check.js`, `tools/slop.js`. A pass is not the end; open the pictures. |
| 4 | **Flat, single-layer backgrounds.** One colour, or one gradient. Real interfaces have a ground, light on it, glass over the light, and content on the glass. | Depth in four layers: ground, art (`.dg-art`), glass (`.glass`), content. See `app-style/desktop/README.md`. |
| 5 | **No material.** Panels are grey boxes with a border and a big shadow. | Material recipes: glass is 3 to 6% white with a 1px edge brighter at the top; one solid white thing per screen; glow, not shadow, on dark. |
| 6 | **Default type and spacing.** 16px everything, Tailwind gaps, everything the same weight. | One spacing scale (`tokens/tokens.css`), type set by role, sizes measured from references, not picked. |
| 7 | **Colour as decoration.** A purple gradient and five accents. | Light does the work on dark screens; one accent at most, spent on what is live or primary. |
| 8 | **Motion as decoration, or none.** Everything bounces, or nothing moves. | Motion with a job and a speed: arrivals in order on a strong ease-out, hovers that answer, a background that drifts slowly; all still under reduced motion (`tokens/tokens.css`, `.claude/skills/animate/`). |
| 9 | **It fakes art in CSS.** Photographs, chrome logos and 3D light cannot be drawn well in code, so they come out cheap. | The art step: say up front which pictures exist, which code can draw (streaks, glows, gradients, simple marks), and which need an image tool. Leave a slot for the real art. |
| 10 | **No critique loop.** One pass, no score, no second look. | Score, find the biggest difference, fix it, score again. Stop when what is left is art or fonts, and say so. |

## The loop, in order

1. Brief (`brief/`). Ask what is missing.
2. Pick the nearest style (`app-style/`, `app-style/desktop/`, or a website
   layout) and say which.
3. Build from the system's parts. A new part goes into the system, not the
   page.
4. Render. Score against the reference (`tools/match.js`), run the checks.
5. Fix the biggest difference. Repeat 4 and 5.
6. Report the score honestly, and what is left that code cannot do.

## What a score means

`tools/match.js` scores out of 100 from structure, layout and tone. On the
two Cinema screens (79 and 76): layout of 86 to 95 meant every block was
within a few pixels of the reference; what kept the totals there was the
light (drawn streaks against photographed or rendered light) and the font
(Inter where the reference used Segoe UI). Taking the logos from the
picture moved the sign-in from 75 to 79.

## Found by review, and made into rules

Two reviewers with fresh eyes compared the Cinema screens with Mark's
references. Every problem they found became a rule in the system, not a
patch on one page:

| Problem | Rule now in the system |
|---|---|
| Glass card looked like grey plastic | Dark glass is mostly dark: a diagonal sheen from 6% to under 2%, a 4% grain, no brightness lift (`--glass`, `--grain`) |
| Rim was a flat grey stroke | Rim light is directional: bright top left and bottom right, nearly gone between (`.glass.rim::after`) |
| Fields lighter than the card they sit in | A nested surface is darker than its parent, with an inner shadow (`.field`) |
| Icons thin and small everywhere | Icon sizes by role: 30 navigation, 26 buttons, 44 tiles, 24 inline |
| Selected sidebar item barely different | A selected state is clearly lighter, with a bright edge and a glow |
| Streaks thin, dim, too many hairlines | Fewer, bolder streaks; a hot core with stacked glows, screen-blended |
| Logo drawn by hand looked wrong | Logos are taken from the picture (`tools/trace-logo.py`, skill `logo-recreate`) |
| Text running into a tile's arrow | Leave room for a corner control in the text's padding; checks catch overlap |
| Dashed borders invisible on black | Decorative strokes at 26% or more on a black ground |
| Primary button looked soft | The primary is solid white and bold; glass is for everything else |

What the reviewers flagged that is not a system problem: the font (the
references use Segoe UI, a Windows font this computer does not have) and the
references' own photographed light, which needs an image, not code.

## Found by giving the same brief to Haiku, Sonnet and Opus

The same short brief (`Tally`, an invoicing home screen) went to three
fresh sessions that had only this repo. What the smaller models got wrong
became rules:

| Problem | Rule now in the system |
|---|---|
| Nothing for numbers and tables, so each model wrote its own in a `<style>` block | Data parts in the style: `.stats`, `.stat-num`, `.delta`, `.table`, `.status` in three tones |
| Icons guessed by name and missing | Every icon name listed at the top of `icons.js`, with invoice, money and status icons added |
| Checks tested a desktop screen at phone size and failed it | `<meta name="platform" content="desktop">` makes `tools/check.js` test 1280 and 1440 wide only |
| No obvious first step | "Start here" in `app-style/desktop/README.md`: copy the closest example, mark it desktop, check it |
| Drawn imitation logos when there was no logo | `.brand-word`: the name as type, never a fake mark |
| Asked questions the brief already answered | A complete brief means start; ask only for empty needed lines |
| A copied example carried a bug (glow code run twice) | Fixed in the example, since examples are copied as they are |
| Smaller models had the parts but still laid them out like a template (button far from the number, a row of stat cards, a side panel repeating the table) | A finished example to copy, `app-style/examples/tally-home`, built from the best-rated build; its layout is now parts in the style (`.figure`, `.facts`, `.ledger`, `.breakdown`, `.bars`) |
| Status pills read as badges and crowded the list | `.status` is a dot and a word |
| A row of cards running off the edge failed the edge check | `.strip` scrolls sideways, so the cut card means "more" |
| With the example, Haiku matched Opus on a new brief, but the flower shop looked like the invoicing app with new words | "Make it theirs" rule in `app-style/desktop/README.md`; product icons (truck, map-pin, box, flower, bag, cart) |
| No way to give a screen its business's colour or picture | `--accent` on the page tints the selected item, icons, meters and bars; `DG.streaks` lines take `color`, `DG.glow` a colour; `.scene` puts their own photo behind the figure and keeps words over it readable; `--late` and `--good` move if the brand colour clashes |
