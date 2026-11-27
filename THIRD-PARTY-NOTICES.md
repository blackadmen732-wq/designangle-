# Third-party software and sources

Everything this project depends on, or took a value from, with its licence
checked against the real file rather than remembered. Checked 24 November 2026.

Nothing listed here is copied into this repository. The runtime libraries load
from a CDN; the design values are facts read from published packages.

---

## Loaded at runtime by every built site

These appear in `<script>` and `<link>` tags in the generated HTML. A client's
browser fetches them from the CDN. They are not vendored, not redistributed,
and not modified.

### GSAP 3.13.0 — gsap.min.js, ScrollTrigger.min.js, SplitText.min.js

Standard "no charge" licence — <https://gsap.com/standard-license>
Copyright © 2008–2025 GreenSock. Licensor is now Webflow.

**Commercial use is covered.** The licence grants "a non-exclusive, worldwide
license to use, reproduce, display, and implement GSAP Products solely for
Permitted Uses", where Permitted Uses means "the implementation and/or use of
GSAP Products on any website, web application, or digital interface by any
person or entity". Its own FAQ answers "Can I really use GSAP in commercial
projects without paying anything?" with "Yes, really!"

**SplitText is explicitly included.** The FAQ: "All of GSAP including the
plugins that were formerly 'members-only' like SplitText and MorphSVG can be
used in commercial projects at no charge." ScrollTrigger is not named on that
page, and is covered by "All of GSAP" — an inference, not a quotation.

**The one restriction**, and it does not apply here: GSAP may not be used in
"tools that allow users to build visual animations without code" that compete
with Webflow's visual animation builder. Design Angle generates finished
static sites; it gives nobody a no-code animation builder. Also: proprietary
notices and branding must not be removed, which loading from the CDN
guarantees.

**Two things worth knowing.** The licence may be amended at any time by
Webflow posting revised terms, and it may be terminated at Webflow's
discretion for non-compliance, at which point all use must stop. Pin the
version and re-read the page before a major release.

### Lenis 1.3.4

MIT — <https://github.com/darkroomengineering/lenis>

### Google Fonts: Bricolage Grotesque, Instrument Sans

SIL Open Font License 1.1. Served from `fonts.googleapis.com`; neither font
file is copied into this repository. Embedding in a webpage is the OFL's
intended use.

**Note for the owner panel and client sites:** the OFL permits bundling and
self-hosting too, which is worth doing later for speed and for not telling
Google who visits a client's site.

---

## Values read from published packages

No code from these is in this repository. What was taken is numeric design
values — an 8px spacing unit, a cubic-bezier, a two-part shadow — which are
facts about a design rather than creative expression. Each package's licence
permits far more than that in any case.

| Package | Version | Licence | What was read |
|---|---|---|---|
| `baseui` (Uber Base Web) | 18.2.0 | MIT | easing curves with their stated intents, duration ladder, sizing scale |
| `@material/web` | tokens `v0_192` | Apache-2.0 | elevation (two-shadow levels), shape, space unit, motion durations and easings |
| `@carbon/layout` | 11.63.0 | Apache-2.0 | spacing scale, used to cross-check the other two |
| `open-props` | 1.7.23 | MIT | easing intensity scale, used to place this kit's curve |

Where any of these is quoted in `docs/research/`, the file names the package,
the version, and the command that re-reads it.

Apache-2.0 asks that changes be stated when you distribute a modified work.
Nothing from these packages is distributed here, modified or otherwise.

---

## Also in use, and previously unlisted

Found missing when this file was reviewed:

| Thing | Where | Licence |
|---|---|---|
| `@supabase/supabase-js` | `portal/app/index.html`, `portal/functions/collect/` | MIT |
| Playwright | `tools/audit.js`, screenshots | Apache-2.0 |
| Census ZCTA centroids | `mk_zip_points` | US Census, public domain |
| NVIDIA NIM API | `tools/critique.py` sends screenshots to it | a third-party service, not a library — screenshots of client work leave the machine when it runs |
| Site photographs, restaurant and hvac | `sites/*/img/` | **unverified** — came from stock sources and the per-image licence is not recorded |
| Site photographs, salon | `sites/salon/img/` | Unsplash, free licence. Collected 24 Nov 2026 from unsplash.com search results, taking only `images.unsplash.com` assets. `plus.unsplash.com` premium, `media.istockphoto.com` and Getty-credited results were excluded deliberately: those are licensed, not free. The Unsplash licence permits commercial use without attribution. Re-shot the same day: nine near-identical stock macros of a hand against fabric were replaced with hands-at-work photography, each one looked at full size before it was chosen rather than judged from a thumbnail. |

The photographs are the one with real exposure. Record the source and licence
of every image in a client site, or replace it with the client's own.

---

## ⛔ Deliberately not used

**Shopify Polaris** (`@shopify/polaris-tokens`) is **not** MIT, despite being
listed beside Carbon and Material in the expansion research as just another
system to learn from. It declares `"SEE LICENSE IN LICENSE.md"`, and that file
grants rights only for software that interoperates with Shopify, or that is
"dissimilar and visually distinct from Shopify products and services … as
determined by Shopify in its sole discretion."

A kit that is sold, whose purpose is making commerce screens look good, cannot
carry a clause the vendor adjudicates alone. Nothing from Polaris is in this
repository. Carbon covers the same ground under Apache-2.0.

**Apple's fonts and icons.** SF Pro and SF Symbols are licensed for Apple
platforms only. They must not go on a client's website. Measurements and
behaviours described in the Human Interface Guidelines are facts about how the
platform works and following them is the intended use; the artwork is not.
Where this repo quotes an Apple value it says whether it was verified, and
`docs/research/apple-hig-values.md` section 5.1 stays marked unverified until
it is checked against a primary source.

---

## Before adding anything new

1. `npm view <package> license`. If it is not a plain SPDX identifier, read
   the actual LICENSE file. `"SEE LICENSE IN LICENSE.md"` is the signal that
   a condition is hiding in there — it is what caught Polaris.
2. Record it here: package, version, licence, and what was taken.
3. Ask whether it is a fact or an expression. A contrast ratio and an 8px grid
   unit are facts. Component source, an icon set and a complete colour system
   are expression.
4. If the licence restricts the field of use **in a way that could apply to
   what this kit does**, the answer is no.

   Stated as "any field-of-use restriction at all", this rule would have
   excluded GSAP, which the kit depends on. GSAP's restriction is specific and
   checkable — do not build a no-code visual animation builder that competes
   with Webflow — and this kit plainly does not. Polaris's is open-ended and
   adjudicated by the vendor alone, with no test you can apply in advance.
   That is the difference, and it is the difference that matters.

   Prefer MIT or Apache-2.0 where one exists. Where it does not, read the
   restriction and write down why it does or does not reach you.
