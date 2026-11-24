# From "can I see it?" to live

What happens, in order, with real times. Everything marked **you** is work on
your side. Everything marked **them** is you waiting, and it is where the time
actually goes.

---

## Stage 0 — Before your first client, once

Three things in `portal/README.md` are unticked, and one of them blocks a
launch rather than merely being tidy.

| | Why it matters |
|---|---|
| ⛔ **The panel is not hosted anywhere** | You cannot give a client a URL for it. The dashboard is one self-contained file; it needs to go on any static host. **Until this is done, you can sell a website but not the panel.** |
| ⛔ Delete `demo-owner@mkwebstudio.test` | A live login with a known password in a database that will hold real client leads |
| ⚠ Turn on leaked-password protection | One toggle in Supabase Auth |
| ⚠ Open the panel on a real phone | It has only been checked in a desktop browser at phone width |

Do these once. Everything below assumes they are done.

---

## Stage 1 — They ask to see something · **2 minutes**

You need exactly three things, and all three are public. You can get them from
their Google listing without asking:

- the business name, spelled the way they write it
- the trade — restaurant or hvac
- the town

```bash
node tools/preview.js --name "Hartley Heating" --trade hvac --city "Dublin, OH"
```

That builds `dist/<slug>/`. Put it anywhere static and send the link.

**What they see:** their name in the header, their town in the contact block,
the real design, the real animation, a finished-looking page.

**What is deliberately not on it:** no prices, because a price is an offer and
somebody will call expecting it. No phone number, because a made-up number is
somebody's real number. No opening hours, no guarantees, no credentials. A bar
across the top says, on the page, that the words are a layout and not a quote.

The tool also writes `sites/<slug>/intake.md` — the list of what you need from
them, with their name already on it. That is Stage 2, and it exists before
they have even replied.

---

## Stage 2 — They say yes · **20–30 minutes with them, then days**

This is the whole bottleneck. The build is fast; getting content out of a
small business is not. Send `intake.md` the moment they show interest, not
after they sign, because the photos are what you will be waiting for.

**The one thing to be firm about:** 13 photographs. That is what the layout
uses. If they cannot supply them, the site either ships with stock — which
looks like every other trades site — or you shoot them, which is a real cost
and belongs in the price.

**Everything they tell you about themselves is theirs.** Prices, response
times, "licensed and insured", years in business. You write down what they
say. You do not improve it, round it, or fill a gap with something plausible,
because the claim goes out under their name and they carry it.

---

## Stage 3 — You build · **45–90 minutes**

```bash
# their content
$EDITOR sites/<slug>/content.js

# their photos, WebP, quality 74, under 150KB each
cp ~/photos/*.webp sites/<slug>/img/

# remove the preview banner — the launch check blocks it anyway
# (delete the `preview` key from content.js)

node build.js <slug>
```

Most of the 45–90 minutes is photographs: cropping, converting, checking each
one is the right shape for its slot. The words take twenty minutes.

---

## Stage 4 — The two gates · **5 minutes**

Neither is optional and both exit non-zero when they fail, so they can gate a
deploy script.

```bash
node tools/launch-check.js <slug>
```

**Blocks:** a preview placeholder, the preview banner, the `555-01xx` example
numbers, `.example` and `.test` domains, "Pomelo Kitchen", "Northwind
Heating", lorem or TODO.

**Flags but allows:** promises, credentials, prices, review counts. A client
is entitled to make claims about their own business. The check only asks that
you confirm they made it.

```bash
node tools/audit.js dist/<slug>/index.html --width 400
node tools/audit.js dist/<slug>/index.html --width 1280
```

Contrast, tap targets, input sizes, layout-thrashing transitions, sideways
overflow. Both widths, every time — several faults in this repo only appeared
at one of the two.

---

## Stage 5 — Live · **30 minutes**

1. **Host the site.** `dist/<slug>/` is plain static files.
2. **Point their domain at it.** The domain is in their name and they keep it.
3. **Wire the panel** — `portal/README.md`, "Adding a client": create the
   account and site, invite the owner, add the `track` block to their
   `content.js` with the returned site id, rebuild.
4. **Send them the panel URL** and their login.

Step 3 matters more than it looks. **Until the `track` block is in their
`content.js`, the booking form has nowhere to send a lead** — and the form now
tells the visitor so honestly rather than pretending it sent. A site that is
live without this is a site that turns enquiries away.

---

## What they get, and what they do not

| They get | They do not get |
|---|---|
| The built site: HTML, CSS, JS, their photos | This repository, `build.js`, `template/`, `tools/` |
| Their domain, in their name | The design method or the kit |
| Their lead and customer data, exported on request | Any other client's site |
| The owner panel, for the paid term | |

The site is **licensed, not sold**: one business, one domain, for the paid
term, perpetual only on a buyout. It goes offline at the end of the period
unless they buy it out. All of that belongs in the signed agreement, which
prevails over `LICENSE`. Say it before the first payment, not after.

---

## The honest timings

| | Your time | Elapsed |
|---|---|---|
| Preview | 2 min | same day |
| Intake call | 30 min | whenever they are free |
| **Waiting for photos** | **0** | **this is where days go** |
| Build | 45–90 min | |
| Checks | 5 min | |
| Go live | 30 min | |

**About two and a half hours of your work per client.** Everything beyond that
is waiting on them.

Which is the argument for sending `intake.md` at the first sign of interest
rather than after the deposit clears.
