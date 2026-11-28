# Design techniques to reach for

The owner's quality bar, distilled from his field guide ("The Anatomy of
Premium UI & UX", 28 pages, kept outside the repo; ask him for it when a
case needs the full study). It covers seven redesign studies (six by
uidesignmahsa, one sign-in by nuhushaik) and three of his own screens in
this repo: `app-style/examples/cinevora-home`, `cinema-login` and
`streaming-study` (REEL). REEL is the direction he wants: its look came
from the film it shows, not from the other two.

These are techniques, not rules or checks. Take the decision behind a
study, never its appearance. Recreations of other companies' screens are
private studies, never client material.

## Techniques

| Technique | In one line | Worked out in |
|---|---|---|
| Subtract first | Remove greetings, extra tabs, duplicate numbers and decoration before adding anything; keep real alternatives findable. | `redesign-eye` §1 (2, 7, 8) |
| Hierarchy around what they came for | The thing the screen is for (a balance, a title, a photo, a task) is the biggest thing; the rest recedes. | `redesign-eye` §1 (1); `brief/TEMPLATE.md` |
| Content sets the atmosphere | When the item is visual (a room, a film, food), let it set the mood; scrims only where text needs them. | `brief/TEMPLATE.md`; `redesign-eye` §3 |
| Compress information | A sentence becomes a number, a badge or a progress bar read at a glance. | `redesign-eye` §1 (4, 5) |
| Decisions, not data | Order facts the way the choice is made: what is it, can I use it now, does it suit me, what next. | `docs/research/her-redesigns.md` |
| Group by the scanning question | Group by when, urgency or type, the question people scan with, not by arbitrary categories. | `redesign-eye` §3 |
| One action leads | One primary action, supporting ones beside it and quieter. | `brief/TEMPLATE.md` |
| Thumb reach | On a phone, the main action and frequent controls sit low, within reach. Not automatically on desktop. | `redesign-eye` §1 (6) |
| Progressive disclosure | Summary first, the rest on a tap, a sheet or a detail page; never hide cost, availability or safety. | `app-style/recipes` |
| Spatial continuity | What opens grows from where it was and returns there, with scroll and focus restored. | `app-style/recipes/product-expand` |
| Interaction choreography | One element leads, the rest follow a beat behind; a new action retargets the old one, never queues behind it. | `docs/research/motion-sources.md` |
| Layered depth | A few clear layers (ground, artwork, surfaces, content) instead of shadows everywhere. | `redesign-eye` §3; `app-style` skill |
| Materials | Glass, metal and light only where the product's world has them; one light direction, solid fallbacks, blur that adds depth without hiding content. | `app-style/desktop/` (a preset, not a default) |
| Art direction per product | Colour, type, imagery and density come from this product and its audience. No look is premium everywhere. | `brief/TEMPLATE.md`; `CLAUDE.md` |
| Identity from the first screen | A sign-in shows the brand at once and leads with how most people sign in; the rest stays findable. | `cinema-login` |

## Why each study works (one line each)

- **Gmail:** low-value mail becomes one counted group, rows group by time, and a photo or date tile shows what a message is before it is opened.
- **Sign-in (Halo):** fewer decisions before signing in (no tabs, providers first, email behind one button) and real artwork in place of a generic gradient.
- **Starbucks:** the balance is the headline, progress shows the next reward, and rewards become cards you can act on.
- **Uber Eats:** search, categories and filters are distinct and early; cards carry the facts needed to compare while the food sells.
- **Airbnb:** the photos set the mood; rating, reviews and host gather in one place; one booking action.
- **Google Maps:** the practical question comes first (open now, rating) as words plus colour; one dominant action, Directions.
- **Netflix:** the title's artwork carries through hero, compact detail and episodes, so it stays one title across states.
- **CINEVORA home:** a material hierarchy (dark metal, rim light) for a creative tool, with the workspace's four entry points first and real empty states.
- **Cinema sign-in:** the same identity-first idea as Halo, kept as a direct desktop form with believable glass and one light source.
- **REEL:** the film still is the atmosphere, Play is the brightest action, continue-watching links the hero to ongoing activity, and the shell stays quiet.

## Three independent choices

Pick one from each list, from the brief. They combine freely: an editorial
site can be dark, a functional dashboard light, and glass works in either.
None is a default.

**Appearance**
- **Light:** reading, commerce, scheduling, health, daytime work.
- **Dark:** media, editing, games, night use, art-led work.
- **Hybrid:** a dark image hero over a light reading area, or a light
  workspace with a dark preview; the switch should mean a change of context.
- **System-adaptive:** follows the person's light or dark setting, with both
  designed, not one inverted.

**Materials**
- **Solid:** opaque surfaces; the safest for dense work and reading.
- **Glass:** for the control layer (bars, sheets, menus) floating over
  content, so content shows through. Never on every card; always with a
  solid fallback.
- **Metallic:** brushed or polished surfaces with a rim light, where the
  product's world is tools and machines (CINEVORA, Cinema). One light
  direction.
- **Textured:** paper, grain, fabric, where the product is tactile or
  crafted. Subtle enough that text stays clean.

**Creative direction**
- **Editorial:** type-led, generous space, imagery as illustration.
- **Cinematic:** large imagery, strong contrast, a few bold type moments.
- **Minimal:** few elements, precise spacing; craft in alignment and type.
- **Expressive:** bold colour, shape and motion for brands that play.
- **Functional:** dense, calm and fast for tools used all day.
- **Content-driven:** the product's own imagery is the atmosphere and the
  shell stays quiet (REEL, Airbnb, Netflix).

Black is not premium by itself. Check contrast on the real backgrounds and
images. Where each idea comes from: `docs/design-sources.md`.

## Defects and taste

Block only real defects: broken controls, missing names, lost focus, wrong
data, clipping, overflow, covered actions, unreadable contrast. Hierarchy,
type, density, materials and originality are advice, judged against the
brief, never against a universal score.
