# Design Angle

A kit for building business websites, plus the owner panel behind them.
Read this before changing anything.

## Load the design skill

Before building or changing any screen — a web page, a phone layout, the
owner panel, a client site — read `.claude/skills/design/SKILL.md`. It holds
the method: the order of work, the type, colour, spacing and motion systems,
the phone rules, and how to redesign something that looks bad.

For any app screen, the owner panel included, also read
`.claude/skills/app-style/SKILL.md`: the style measured from the app
redesign recordings, the parts in `app-style/`, the motion system, and the
unslop and motion audits.

To redesign an existing app or screen, follow `.claude/skills/app-redesign/`:
the order of work and the traps four redesigns hit. Before it, read
`.claude/skills/redesign-eye/`: how the reference designer sees a screen,
words each change (what changed, then what you get), and tells the story
(read from six of her videos, `docs/research/her-redesigns.md`). For
motion, the `animate` and `review-animations` skills (Emil Kowalski's,
adapted).

`DESIGN.md` holds the kit's own locked-in values (the exact tokens every
client site uses). The skill is the method; DESIGN.md is this kit's instance
of it. Where they overlap, DESIGN.md wins for the kit's sites.

## The rules that are not style preferences

These exist because breaking them loses money or breaks trust.

- **A phone-button tap is not a phone call.** Taps live in `mk_events`, real
  calls in `mk_calls`. Never report one as the other. The panel says so on
  the page.
- **No automated text without registration and consent.** Both
  `mk_messaging_registration` and a matching `mk_message_consent` row must
  exist first. Do not add a bypass. See `OFFER.md` section 5.
- **Never launch a client fact they did not give you.** No guarantee, response
  time, price, review count or certification unless the client said it. The
  example sites are invented and labelled as such in every file.

  This applies at **launch**, not to a sales preview. A preview full of visible
  placeholders looks broken, and a broken-looking preview cannot do the only
  job it has. `tools/preview.js` makes one that reads as finished — neutral
  copy, no invented prices, no invented promises — and
  `tools/launch-check.js` refuses to ship a site that still contains
  placeholder or example text. It flags claims rather than blocking them,
  because a client is entitled to make claims about their own business; it
  only asks that somebody confirm they actually made it.

  ```bash
  node tools/launch-check.js <site>    # exit 1 means do not ship
  ```
- **A lead needs a name and a phone number.** The collector refuses one
  without them, so a miswired form fails loudly instead of filling the
  owner's list with enquiries nobody can answer.
- **Distances are estimates and say so.** Straight-line adjusted for roads,
  not a routed drive time.

## Checking work

Build with `node build.js`, then look at it before saying it is done:

```bash
node build.js                      # every site, into dist/
node build.js hvac                 # one site
node tools/check.js                # every screen at both sizes: contrast, tap size, sideways scroll
node tools/audit.js dist/hvac/index.html --width 400    # one page in depth: contrast against the painted ground, with the fix
node tools/slop.js <page>          # does it look AI-made? 18 points, and the bottleneck to fix first
node tools/motion.js <page>        # presses through it: every animation measured, frame-exact filmstrips
python3 tools/photos.py try <ids>  # candidate photos on a contact sheet, before fetching any
python3 tools/critique.py shot.png --kind app    # the judgement call
node tools/reel.js app-style/examples/chick-fil-a/reel.json   # a redesign as a reel, into .check/reel/
```

`tools/check.js` and `tools/audit.js` are the half of review that is
arithmetic: contrast, tap-target boxes, input sizes, layout-thrashing
transitions, sideways overflow. Both exit non-zero, so they can gate a build.
Run them before the vision model, and never ask a model whether a ratio
passes.

Screenshot at **400×860** and **1280×900**. Both, every time. `tools/check.js`
takes both into `.check/` and fails on the rules that can be measured. The
owner panel needs a login, so the check fills it with invented sample data
(`tools/panel-sample.js`). Where cdnjs or jsDelivr are blocked, the checks
load the same GSAP and Lenis versions from npm (`tools/cdn.js`), so they
test the page visitors get. A pass is not the end: open the screenshots, and
for anything that moves, the filmstrips in `.check/motion/`. A recording is
worth watching too: the tickets example's recording caught a tab hidden
under a floating button that every audit had passed (check.js now fails it).

## Layout

```
build.js              turns sites/<name>/content.js into static files
template/             shared design, motion, tracking — change once, all sites improve
sites/<name>/         one client: content.js plus photos
portal/               owner panel: schema, edge functions, dashboard
app-style/            the app style: CSS system, icons, recreations, an example app
tools/check.js        measured design checks and screenshots, both sizes
tools/slop.js         the unslop audit: 18 points, a score, the bottleneck
tools/motion.js       the motion audit: durations, curves, layout animation, reduced motion
tools/cdn.js          blocked CDN libraries served from npm, so the checks test the real page
tools/photos.py       photos by Unsplash id: a contact sheet first, then fetch with credits
tools/watch.py        a redesign video read: her words, a storyboard, the camera's moves
tools/reel.js         a redesign told as a vertical video, her structure and timing
tools/compare.js      a screen beside the reference frame it should match
tools/critique.py     screenshot review on the user's NVIDIA credit
docs/research/        the research the design decisions came from
DESIGN.md             this kit's locked values
OFFER.md              packages, and the rules that protect the business
```
