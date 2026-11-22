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
portal/
  schema.sql             the portal database
  functions/collect/     the endpoint websites report to
  app/index.html         the owner dashboard
  README.md              how to add a client
OFFER.md                 packages, and the rules that protect the business
docs/research/           two research reports behind the design decisions
dist/                    build output, not committed
```
