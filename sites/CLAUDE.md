# Sites

One folder per website: `content.js` holds every word, colour, photo and
section, and `img/` the photos. `node build.js <name>` turns it into
`dist/<name>/`. The design lives in `template/` and `tokens/tokens.css`, so a
fix there improves every site; a client's own look is the `theme` in
`content.js`. The locked values are in `DESIGN.md`.

## What a content.js says

- `kind`: `business` (the default), `product`, `portfolio`, `docs` or `page`.
  A business must carry the `contact` section and its form: a business page
  that cannot take a lead has failed at its one job. The others need no form,
  and the header button follows the page's own `cta`, or is left out.
- `sections`: the page in order, one name per line, from `belt`, `showcase`,
  `list`, `story`, `band` and `contact`. A misspelled name, a duplicate, a
  section with no block, or a business without its form stops the build and
  says what to change. `node tools/test-sections.js` proves each of those is
  caught.
- `layout`: the default; `atelier`, one photo at full bleed, then the work,
  then a price ledger (the salon, the barber); or `still` (the meditation
  centre).

## Never launch a client fact they did not give you

No guarantee, response time, price, review count or certification unless the
client said it. The example sites (hvac, restaurant, salon, meditation,
barber) are invented, and each says so at the top of its `content.js`.

This applies at launch, not to a sales preview. A preview full of gaps looks
broken, and a broken-looking preview cannot do the only job it has.
`tools/preview.js` builds one from the public name, town and trade: every
promise from the example becomes neutral copy, every fact it cannot know (a
phone number, a price) stays in [brackets], and a banner says it is a preview.

```bash
node tools/preview.js --name "Mario's Pizza" --trade restaurant --city "Columbus, OH"
```

`tools/launch-check.js` refuses to ship a site that still holds placeholder or
example text. It flags claims rather than blocking them, because a client is
entitled to make claims about their own business; it only asks that somebody
confirm the client made them.

```bash
node tools/launch-check.js <site>    # exit 1 means do not ship
```

## Photos

By Unsplash id: a contact sheet first, then fetch with credits.

```bash
python3 tools/photos.py try <ids>
```

Credits go in `img/CREDITS.json`, with any crop that took another business's
lettering out of the frame. Stock is a stand-in: the client's own photos
replace it before launch.

## Before it is done

```bash
node build.js <site>
node tools/check.js dist/<site>
node tools/audit.js dist/<site>/index.html --width 400
node tools/slop.js dist/<site>
```

Then open both screenshots in `.check/`.
