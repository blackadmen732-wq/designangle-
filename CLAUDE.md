# Design Angle

Websites, phone app screens, desktop app screens, and the owner panel behind
a client's website, all from one design system. Read this page, then only
what your job needs.

**Before designing anything, get a brief.** Fill `brief/TEMPLATE.md` from
what you were told. If a line marked *needed* is empty, ask (at most five
short questions, each with a suggested answer); do not guess. Why:
`docs/WHY-AI-DESIGN-IS-GENERIC.md`.

## Start here

| The job | Read first | Then, if needed |
|---|---|---|
| A client's website | `sites/CLAUDE.md` | `DESIGN.md`, the locked values |
| A web page that is not a business: a product, a portfolio, docs | `sites/CLAUDE.md`, the part on `kind` | `DESIGN.md` |
| A desktop app screen: an editor, a studio, a launcher, a dashboard, a business tool | `app-style/desktop/README.md` (start at "Start here": pick the pattern, copy its example) | `.claude/skills/design/SKILL.md` for the method |
| A logo in a reference picture | `.claude/skills/logo-recreate/SKILL.md` | `tools/trace-logo.py` |
| A background, or making one move | `.claude/skills/animated-backgrounds/SKILL.md` | `app-style/desktop/art.js` |
| A phone app screen | `.claude/skills/app-style/SKILL.md` | `app-style/styles/` when the brief wants a tool, not a brand |
| Redesigning an existing app or screen | `.claude/skills/app-redesign/SKILL.md` | `.claude/skills/redesign-eye/SKILL.md`, to brief and present it her way |
| The owner panel, the database, the edge functions | `portal/CLAUDE.md` | the app-style skill, for the panel's screens |
| Motion | `.claude/skills/animate/SKILL.md` | `.claude/skills/review-animations/SKILL.md`, to critique it |
| Any other screen | `.claude/skills/design/SKILL.md` | |

The design skill is the method under all of them: the order of work, the type,
colour, spacing and motion systems, the phone rules, and how to fix something
that looks bad. The other skills say when to open it. A copy edit does not
need it.

## One design system

- `tokens/tokens.css` holds the space scale, the corners, the touch sizes and
  the motion, for the websites, the app screens and the panel alike. Change a
  value there, never in a stylesheet: `node tools/tokens.js` fails if anything
  sets its own.
- `template/` draws every website; a client's look is the `theme` in its
  `content.js`.
- `app-style/` draws the app screens, in her look by default. `app-style/styles/`
  holds other looks for the same parts and markup.

## Five rules that are not style

Breaking these loses money or breaks trust. Each is enforced in code, and its
detail lives beside that code.

1. **A phone-button tap is not a phone call.** Never report one as the other. `portal/CLAUDE.md`
2. **No automated text without registration and consent.** Do not add a bypass. `portal/CLAUDE.md`, `OFFER.md` section 5
3. **Never launch a client fact they did not give you.** No guarantee, response time, price, review count or certification unless the client said it. `sites/CLAUDE.md`
4. **A lead needs a name and a phone number.** The collector refuses one without them. `portal/CLAUDE.md`
5. **Distances are estimates and say so.** `portal/CLAUDE.md`

## Checking work

Look before saying it is done. The measured checks come first: they exit
non-zero, so they can gate a build. Then open the screenshots. Then judge.

```bash
node build.js                            # every site into dist/; node build.js hvac for one
node tools/test-sections.js              # a wrong section list or kind cannot reach a built page
node tools/tokens.js                     # one set of tokens
node tools/check.js [page]               # 400x860 and 1280x900: contrast, tap size, sideways scroll; shots in .check/
node tools/audit.js <page> --width 400   # one page in depth: contrast against the painted ground, with the fix
node tools/slop.js <page>                # does it look AI-made? 18 points, and the bottleneck to fix first
node tools/motion.js <page>              # every animation measured; filmstrips in .check/motion/
node tools/match.js <page> <ref.png>     # against a reference: side by side and a score out of 100
```

Never ask a model whether a ratio passes. Do open the screenshots, and for
anything that moves, the filmstrips: a recording once caught a tab hidden
under a floating button that every audit had passed. Where cdnjs or jsDelivr
are blocked, the checks load the same GSAP and Lenis versions from npm
(`tools/cdn.js`), so they test the page visitors get.

## Layout

```
CLAUDE.md             this map
DESIGN.md             the websites' locked values
OFFER.md              packages, and the rules that protect the business
tokens/tokens.css     the shared scales and motion
build.js              sites/<name>/content.js into static files in dist/
template/             the websites' shared design, motion and tracking
sites/                one folder per site (sites/CLAUDE.md)
portal/               owner panel, schema, edge functions (portal/CLAUDE.md)
app-style/            the app style: parts, icons, styles/, recreations, examples
tools/                checks: check, audit, slop, motion, tokens, test-sections, launch-check
                      makers: preview, photos.py, reel, watch.py, compare, critique.py
docs/research/        the research the design decisions came from
.claude/skills/       design, app-style, app-redesign, redesign-eye, animate, review-animations,
                      logo-recreate, animated-backgrounds
```
