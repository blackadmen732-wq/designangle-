# Design Angle

A reusable kit for building animated business websites. One design system, one set of
animations, one build script. Each client site is a single content file plus photos.

The same layout and motion work for a restaurant, an HVAC company, a dentist, a gym or a
law firm. You change the words, the photos and two colours.

## What you get

- **Shared design and animation** in `template/` — change it once, every site improves.
- **Per-client content** in `sites/<name>/content.js` — one plain file, no HTML.
- **A build script** that outputs plain static files you can host anywhere.
- **Design rules** in `DESIGN.md` that keep quality consistent across clients.
- **Research** in `docs/research/` — how studios actually build and price this work.

## Quick start

Requires Node.js 18 or newer. No install step and no dependencies.

```bash
node build.js
```

That builds every site into `dist/`. To build one:

```bash
node build.js hvac
```

To look at it:

```bash
npx serve dist/hvac
```

## The two halves are separate, and that is tested

The design kit and the business side share a repository and nothing else.

```
DESIGN                              BUSINESS
build.js    template/   tools/      portal/   OFFER.md
.claude/skills/design/              Supabase, the panel, leads
```

`build.js`, `tools/audit.js`, `tools/contrast.js` and `tools/preview.js`
import nothing from `portal/`. Verified by deleting `portal/` outright and
running all four: every one still worked. The only mentions of the collector
anywhere in the design half are two comments in `template/site.js` and one
line in `DESIGN.md`, explaining why the form behaves as it does.

So you can design with this — a page, a phone screen, anything — without
touching or knowing about the business side. The design skill loads on its
own and the tools run on any HTML file, including files that have nothing to
do with a client site.

## Scale, money, and what is not built

`docs/SCALE-AND-TERMS.md` answers four things with measured numbers: whether
clients pay before or after (before — the preview is what makes that
sellable), whether one system runs 500 sites (yes, about $45 a month, but
only with event retention or the database fills in 14.5 months), what the
booking feature actually does today (it is a request form, not a booking
engine — and the $397 tier promises a booking engine), and what bundling
ReviewBoost into every plan really costs.

## The whole process, start to finish

`docs/RUNBOOK.md` is the sequence with real timings: what you need at each
stage, what the client gets, what they do not, and which things must be done
once before any real client exists. The short version is about two and a half
hours of your work per client, and everything else is waiting on their
photographs.

## Show a prospect a preview, without building their site

A prospect cannot picture themselves inside someone else's website. Showing
them Pomelo Kitchen and saying "yours would look like this" asks them to do
imaginative work while deciding whether to trust you, and most will not
bother. But hand-building a real site for every enquiry is hours of unpaid
work, and most enquiries do not close.

The preview is the middle. Their name, their town, their trade, in the real
template:

```bash
node tools/preview.js --name "Hartley Heating" --trade hvac --city "Dublin, OH"
```

Under a minute, and it converts like the real thing, because the only thing
most people need to see is their own name at the top of a page that looks
expensive.

It also writes `sites/<slug>/intake.md`: the list of what you need from that
client, with their name on it, worded for them rather than for you. Send it
the moment they show interest. The photographs are what you will wait days
for, so the ask should be out before the deposit clears.

**It reads as finished, and nothing on it is a claim about them.** Prices are
removed, because a price is an offer and somebody will call expecting it.
Promises and credentials are replaced with neutral trade copy any business
could stand behind. On the HVAC example that is 23 prices dropped and 8
claims neutralised. Only what the business must actually supply — phone,
email, hours — is left as a visible marker, and a banner across the top says
the words are a layout, not a quote.

The real risk was never the preview. It is the preview quietly becoming the
live site with example words still in it, so the check lives at launch:

```bash
node tools/launch-check.js <slug>      # exit 1 means do not ship
node tools/audit.js dist/<slug>/index.html --width 400
```

`launch-check` blocks placeholders, the preview banner and example names,
phone numbers and domains. It **flags** promises, credentials, prices and
review counts rather than blocking them — a client is entitled to make claims
about their own business, so it only asks that somebody confirm they said it.

## Make a site for a new client

```bash
cp -r sites/hvac sites/clientname
```

Then:

1. **Replace the photos** in `sites/clientname/img/` (WebP, quality 74, under 150KB each).
2. **Edit `sites/clientname/content.js`**: the business name, the words, and the `theme`
   colours (accent, soft, tint).
3. **Build and check it**: `node build.js clientname`.
4. **Work through the checklist** at the end of `DESIGN.md` before you hand it over.

The build fails with a clear message if a photo named in `content.js` is missing, so a
broken image cannot reach a client.

## What is on the page

Every site has the same eight parts, in this order:

| Part | What it does | Restaurant | HVAC |
|---|---|---|---|
| Header | Logo, links, call-to-action that never moves | Reserve | Get a quote |
| Hero | Sliding photos with a headline that rises into place | Five dishes | Five services |
| Belt | A moving strip of small photos and claims | "Wood-fired" | "Upfront prices" |
| Showcase | **The signature moment.** Pins and slides sideways on scroll | Tonight's plates | What we fit |
| List | Tabbed list with prices | The menu | Pricing |
| Story | Photo that wipes in, text, counting numbers | Our kitchen | How we work |
| Band | Full-width photo with one line over it | Late opening | Emergency line |
| Contact | Hours, address, and a request form | Reserve a table | Book a visit |

## The content file

`content.js` is a plain JavaScript object. Nothing in it is HTML, so you cannot break the
layout by editing it.

```js
module.exports = {
  name: 'Northwind Heating & Air',
  short: 'Northwind',
  seo: { title: '...', description: '...', type: 'HVACBusiness', telephone: '...' },
  theme: { accent: '#0b63ce', soft: '#f1f6fc', tint: '#dcebfb' },
  cta: { label: 'Get a quote', href: '#book' },
  hero: { eyebrow: '...', headline: '...', headlineAccent: '...', slides: [ ... ] },
  belt: [ { img: 'thermostat.webp', text: 'Upfront prices' } ],
  showcase: { id: 'services', title: '...', cards: [ ... ] },
  list: { id: 'pricing', groups: [ { name: 'Repair', items: [ ... ] } ] },
  story: { id: 'about', img: 'desk.webp', paragraphs: [ ... ], facts: [ ... ] },
  band: { img: 'house.webp', title: '...', link: { ... } },
  contact: { id: 'book', hours: [ ... ], blocks: [ ... ], form: { ... } },
  footer: { mark: 'Northwind', left: '...', right: '...' }
};
```

Set `seo.type` to the right one for the trade: `Restaurant`, `HVACBusiness`, `Dentist`,
`Plumber`, `Electrician`, `LocalBusiness`. It becomes the structured data Google reads.

## Built on

GSAP 3.13 and ScrollTrigger (free for commercial use since April 2025), SplitText, and
Lenis for smooth scroll. All loaded from a CDN, so there is nothing to install.

## Before you sell a site

The example sites are **demonstrations**. Pomelo Kitchen and Northwind Heating & Air do
not exist, and every name, price, guarantee and phone number in them is invented. Replace
all of it with the client's real facts. Never ship an invented guarantee or response time.

Two things the kit does not do, which a paying client will need:

1. **The form only shows a message.** Connect it to a real service (Formspree, Resend, a
   serverless function) or replace it with a link to the client's booking system.
2. **Booking and ordering platforms are the client's.** The research found that no
   award-winning restaurant site builds its own reservations; they all embed OpenTable,
   Resy or Zenchef. Do the same.

## The design method

`.claude/skills/design/SKILL.md` holds the method itself: the order of work,
the type, colour, spacing and motion systems, the phone-screen rules, and how
to take something that looks bad and make it look made. It loads automatically
in this repo, so any session starts knowing it, and it applies to app screens
as much as web pages.

### Two halves of review

`tools/audit.js` does the half that is arithmetic. It opens the page in a real
browser, reads the computed styles, and reports exactly what is wrong:

```bash
node tools/audit.js dist/hvac/index.html --width 400
node tools/audit.js dist/hvac/index.html --width 1280
```

It checks contrast against the colour actually painted behind the text
(including through translucent layers), tap-target boxes including ones grown
by a pseudo-element, input font sizes that make iOS zoom, transitions on
properties that re-run layout, and sideways overflow. Every finding comes with
the fix, and contrast findings come with the exact replacement colour. It exits
non-zero, so it can gate a build.

`tools/contrast.js` is the maths on its own:

```bash
node tools/contrast.js check "#db2235" "#ffffff"
node tools/contrast.js darken "#e03a4b" "#ffffff" 4.5
```

`darken` keeps hue and saturation and walks lightness until it passes, so a
client's brand colour stays their brand colour.

`tools/critique.py` reviews a screenshot on your own NVIDIA credit, not
Claude's:

```bash
python3 tools/critique.py shot.png --kind app --fix
```

It handles the mechanical half of review — hierarchy, spacing, contrast, touch
targets — so the expensive model is spent on judgement. About one point in
three is wrong, because it sees one still image with no hover, scroll or
motion. Argue with it.

## The owner panel

Each client gets a dashboard showing what their website did: visitors, taps on
their phone number, enquiries from the form, and a box to request changes.
The database and collector are live; see `portal/README.md` to add a client.

What the panel will not do is overstate results. A tap on a phone button is
counted as a tap, never as a completed call, and the page says so.

## Repository layout

```
build.js                 the build script
DESIGN.md                the rules that keep quality consistent
template/
  site.css               shared design
  site.js                shared behaviour and animation
sites/
  restaurant/            example: Pomelo Kitchen (invented)
  hvac/                  example: Northwind Heating & Air (invented)
.claude/skills/design/  the design method, loaded automatically
tools/preview.js       a named preview for a prospect, polished, no invented facts
tools/launch-check.js  refuses to ship a site with somebody else's words in it
tools/audit.js         the design rules, measured in a real browser
tools/contrast.js      WCAG contrast maths and brand-safe darkening
tools/critique.py      screenshot review on your NVIDIA credit
portal/
  schema.sql             the portal database
  functions/collect/     the endpoint websites report to
  app/index.html         the owner dashboard
  README.md              how to add a client
OFFER.md                 packages, and the rules that protect the business
docs/research/           two research reports behind the design decisions
dist/                    build output, not committed
```
