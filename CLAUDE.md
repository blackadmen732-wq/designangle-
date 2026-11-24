# Design Angle

A kit for building business websites, plus the owner panel behind them.
Read this before changing anything.

## Load the design skill

Before building or changing any screen — a web page, a phone layout, the
owner panel, a client site — read `.claude/skills/design/SKILL.md`. It holds
the method: the order of work, the type, colour, spacing and motion systems,
the phone rules, and how to redesign something that looks bad.

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
- **Never invent a client fact.** No guarantee, response time, price, review
  count or certification that the client did not give you. The example sites
  are invented and labelled as such in every file.
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
node tools/audit.js dist/hvac/index.html --width 400    # the rules, measured
node tools/audit.js dist/hvac/index.html --width 1280
python3 tools/critique.py shot.png --kind app           # the judgement call
```

`tools/audit.js` is the half of review that is arithmetic: contrast against the
real painted background, tap-target boxes, input sizes, layout-thrashing
transitions, sideways overflow. It exits non-zero, so it can gate a build.
Run it before the vision model, and never ask a model whether a ratio passes.

Screenshot at **400×860** and **1280×900**. Both, every time.

## Layout

```
build.js              turns sites/<name>/content.js into static files
template/             shared design, motion, tracking — change once, all sites improve
sites/<name>/         one client: content.js plus photos
portal/               owner panel: schema, edge functions, dashboard
tools/critique.py     screenshot review on the user's NVIDIA credit
docs/research/        the research the design decisions came from
DESIGN.md             this kit's locked values
OFFER.md              packages, and the rules that protect the business
```
