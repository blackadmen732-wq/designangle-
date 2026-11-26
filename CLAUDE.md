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
redesign recordings, the parts in `app-style/`, and the unslop audit.

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
node tools/check.js                # every screen at both sizes: contrast, tap size, sideways scroll
node tools/slop.js <page>          # does it look AI-made? 18 points, and the bottleneck to fix first
python3 tools/critique.py shot.png --kind app    # cheap design review
```

Screenshot at **400×860** and **1280×900**. Both, every time. `tools/check.js`
takes both into `.check/` and fails on the rules that can be measured. The
owner panel needs a login, so the check fills it with invented sample data
(`tools/panel-sample.js`). A pass is not the end: open the screenshots.

## Layout

```
build.js              turns sites/<name>/content.js into static files
template/             shared design, motion, tracking — change once, all sites improve
sites/<name>/         one client: content.js plus photos
portal/               owner panel: schema, edge functions, dashboard
app-style/            the app style: CSS system, icons, recreations, an example app
tools/check.js        measured design checks and screenshots, both sizes
tools/slop.js         the unslop audit: 18 points, a score, the bottleneck
tools/compare.js      a screen beside the reference frame it should match
tools/critique.py     screenshot review on the user's NVIDIA credit
docs/research/        the research the design decisions came from
DESIGN.md             this kit's locked values
OFFER.md              packages, and the rules that protect the business
```
