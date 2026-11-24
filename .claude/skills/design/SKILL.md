---
name: design
description: How to design or redesign any screen — a web page, a landing page, a phone app screen, a dashboard, a form — so it looks professionally made rather than generated. Use when building new UI, when asked to make something look better, more premium or less generic, when redesigning an existing screen, or when reviewing a design. Covers the order of work, the systems (type, colour, spacing, motion), mobile-specific rules, and a cheap screenshot critique loop.
---

# Designing a screen

This is the method, in the order it is applied. It works the same for a web
page and a phone screen; only the constraints at the end differ.

The single most common failure is timidity: everything the same size, the same
weight, the same spacing, nothing clearly first. Design is deciding what wins.

---

## 1. The order of work

Never start with colour. Colour is the last decision and the easiest to change.

**Step 1 — Name the one job.**
Write one sentence: *"A person comes to this screen to ____."* Book a table.
Call someone. Pick an episode. If you cannot finish the sentence, the screen
has no job and no design will save it.

**Step 2 — Find the one thing.**
What on this screen does that job? That is the hero: the Play button, the phone
number, the artwork, the price. Everything else is support.

**Step 3 — Make it bigger than feels comfortable.**
The hero should be visibly larger and higher contrast than anything else. This
is the step people skip. If the whole screen reads at one volume, nothing is
being said.

**Step 4 — Cut what competes.**
Two filled buttons means no primary action. Two headings the same size means no
hierarchy. Remove, or demote. Fewer things on screen is almost always better;
density is not richness.

**Step 5 — Demote the rest.**
Secondary actions become icons or quiet text. Never a second filled button.
Tertiary information gets smaller and greyer, or goes away.

**Step 6 — Apply the systems.**
Spacing, type, colour, motion. All four are below. They are systems, not
choices made per element.

**Step 7 — Look at it, then fix the worst thing.**
Screenshot it. Run the critique tool. Fix the worst thing. Look again.

---

## 2. The systems

### Spacing

One scale, multiples of **4**. Nothing between: no 13px, no 27px.

```
4  8  12  16  24  32  48  64  96
```

Every step here is in Carbon, Material 3 **and** Uber Base Web, checked
against the published packages. Material builds from an explicit
`--md-sys-space-unit: 8px` with quarter steps; Carbon and Base Web both start
their ladders at 2px. Add **2** when you are building something dense — it is
in all three and nothing marketing-shaped needs it.

**44 is not on this scale.** It is the minimum touch target, which is a
different rule with a different reason, and it does not belong in a spacing
sequence. Keep the two apart or the scale stops being a scale.

Gaps come from the layout (`gap` in flex or grid), not per-element margins,
which collapse and double unpredictably. Space groups things: related items
close, unrelated items far. That does more work than any border.

### Type

**Two faces at most.** One with character for headings, one plain for text.
Hierarchy comes from **weight and colour before size**.

| | Value |
|---|---|
| Body size | 15–17px, never below 15 on a phone |
| Line height | ~1.5 for body, ~1.1 for large headings |
| Line length | 45–90 characters, aim 55–75. `ch` is the width of "0" in *that* typeface, so the right `max-width` differs per font — measure it, do not copy a number. This kit's 17px Instrument Sans needs `54ch` to land at 45–60. |
| Heading tracking | tighten slightly: `letter-spacing: -0.02em` |
| Uppercase labels | loosen: `letter-spacing: 0.1em` |
| Numbers in columns | `font-variant-numeric: tabular-nums` |
| Weights per face | two, maybe three. Never five |

Give headings `text-wrap: balance`.

### Colour

**Two colours.** A deep ground and a warm or cool light. One accent, used for
the primary action and almost nothing else.

- **Tint the neutrals toward the accent.** A pure grey (`#808080`) looks
  unconsidered. A grey leaning warm or cool looks deliberate. This single
  change does more than any other to make a palette look chosen.
- **Never pure black** for text. Near-black with a hue: `#1e1512`, `#15171c`.
- **Body text needs 4.5:1** against its background. Check it, do not eyeball it.
- A third brand colour is almost always a mistake. Vary with tints instead.

### Motion

**One tempo for the whole product.** Mixed easing is what makes a site feel
cheap.

| Thing | Duration | Ease |
|---|---|---|
| Buttons, hovers, toggles, tabs | under 200ms | ease-out |

200ms is not a taste. It is Google's INP threshold for a tap counting as
responsive, so it is the number that is actually measured in the field.
Uber's `timing200` and Material 3's `short4` both sit at the same place:
200ms is where small interface feedback ends in every published system
checked. See `docs/research/motion-values-from-shipped-systems.md`.

**State the intent, not a magic bezier.** Earlier versions of this file named
two specific curves. They were never wired into anything, so anyone matching
an existing site by reading the docs matched nothing. Pick a curve per intent
and put it in one variable:

| Intent | Shape | Uber's published value, if you want one |
|---|---|---|
| Entering | decelerate | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Exiting | accelerate | `cubic-bezier(0.64, 0, 0.78, 0)` |
| Moving across | both | `cubic-bezier(0.83, 0, 0.17, 1)` |
| Scroll-linked, looping | linear | `cubic-bezier(0, 0, 1, 1)` |

Entering and exiting are not mirror images. Entering gets the longer duration
and the softer landing; exiting is quicker, because nobody is waiting to look
at a thing that is leaving.
| Things entering | 0.4–0.9s | ease-out: decelerate into place |
| Full-screen moves, page transitions | 0.7–1.2s | ease-in-out |
| Anything scroll-linked or looping | — | linear |

Rules that do not bend:
- **Never transition a property that re-runs layout**: width, height, top,
  left, margin, padding, font-size, gap, or `all`. Those recalculate the page
  on every frame and drop frames. `transform` and `opacity` do not, which is
  why they are the default answer.
- Paint-only properties — background, colour, border-colour, box-shadow — do
  *not* re-run layout. Transitioning one briefly on hover or focus is fine and
  every shipping design system does it. Keep those under 200ms. The fault is a
  slow one, or a layout one, not a coloured one.
- A hover that changes instantly, with no transition on it at all, is not an
  animation and breaks nothing.
- **Never animate frequent actions.** Navigation, tabs and the main button must
  feel instant. A delight the hundredth time is a cost.
- Spend motion on the rare moment: the load, the hero, the transition.
- Honour `prefers-reduced-motion`, and make the page complete without it.

---

## 2b. The eight patterns that make an app screen look expensive

`docs/phone/app-patterns-dark.html` is a live reference built by pulling two
app redesign walkthroughs apart frame by frame. In short:

1. **Action row.** One filled pill, then translucent circles **of the same
   height**, on one baseline. The equal height is what makes three controls
   read as one object.
2. **A glow, not a flat ground.** One very soft radial gradient (7–14% white,
   spread wider than the element). A flat dark screen looks switched off.
3. **Hierarchy by value, not size.** Two lines the same size, the second a
   lower-value grey. Three text values beats three text sizes.
4. **Pills have no borders.** Selected inverts to solid white on black. Tags
   are the same idea, smaller and squarer, in 10% white.
5. **Cards separate by value.** Page `#070707`, card `#1c1c1c`. No border, no
   shadow. Inner radius always smaller than outer.
6. **Scrolling rows run off the edge.** The half-cut card is the only scroll
   cue needed. Negative margin, matching padding.
7. **Navigation floats.** A translucent blurred pill lifted off the bottom
   edge, the active tab in its own pill, and create pulled out as a separate
   circle.
8. **The brand colour appears once.** Netflix red is a 3px underline on one
   tab and nothing else on the screen. That restraint is why it still reads
   as the brand.

**Those eight came from two dark media apps, where one thing dominates the
screen.** That is not most work. For a light, dense screen — a dashboard, a
list of invoices, anything an owner scans rather than browses — read
`docs/phone/light-dense-patterns.html` as well. Four of the eight flip:

| Dark set says | On light |
|---|---|
| A glow, not a flat ground | No glow. A light screen does not need lighting, and a white radial on white is invisible. |
| Cards separate by value, no border, no shadow | White has nowhere to go underneath. Use a hairline, or Material's two-part shadow. |
| Navigation floats | Nothing to float above. Anchor it to the edge. |
| Make one thing much larger than feels comfortable | Several numbers can be peers. Make them identical and let the *change* carry the emphasis. |

What is **not** in those screens: no animation library, no 3D, no mesh
gradient, no glass beyond one backdrop blur. The work is choosing one bright
colour, spending it once, making the important thing much larger than feels
comfortable, and deleting what competes.

## 3. Phone app screens

Everything above applies. These are the extra constraints.

**Touch targets are 44px minimum.** Not the icon — the tappable box around it.

**The bottom third is where thumbs reach.** Primary actions belong low on the
screen, not at the top. A button in the top-right corner of a tall phone is
a two-handed operation.

**Navigation floats.** A pill-shaped bar sitting above the bottom edge with a
margin around it reads as more considered than a bar locked to the edge. If
there is a create action, give it its own circular button beside the bar rather
than cramming it in as a fifth tab.

**Respect the safe areas.** Content clears the notch and the home indicator:

```css
padding-top: env(safe-area-inset-top, 0px);
padding-bottom: env(safe-area-inset-bottom, 0px);
```

**Full-bleed media, inset text.** Images run edge to edge; text keeps a
16–20px gutter. This is most of what makes an app screen feel native.

**One screen, one job** is stricter on a phone than on the web. There is no
room to hedge.

**Inputs are 16px minimum** or iOS zooms the page when they are focused.

---

## 4. Redesigning something that looks bad

The usual job. Work in this order and resist jumping to colour.

1. **Keep the brand.** Their logo, their colour, their name. You are changing
   the structure, not rebranding them. Changing the brand is a different,
   larger, separately-paid job.
2. **Say what the screen is for** in one sentence. Usually nobody has.
3. **Find the most important content and double its size.** On a media screen
   that is the artwork. On a service screen it is the phone number or the
   price. This one move fixes more than everything else combined.
4. **Count the things.** If more than about seven elements compete for
   attention, cut or group until they do not.
5. **Find the primary action and make it the only filled button.** Everything
   else becomes an outline, an icon, or text.
6. **Rebuild the spacing on one scale.** Most bad screens have six arbitrary
   gaps where they need three values.
7. **Reduce to two typefaces and three sizes.**
8. **Strip the palette to two colours plus one accent.**
9. **Add space.** Nearly every bad screen is too tight. Doubling the space
   around the hero is usually right.
10. **Then, and only then, consider motion.**

---

## 5. What generated design looks like

Call these out by name when reviewing, and avoid them when building:

- Inter with an indigo-to-purple gradient
- Three equal rounded cards in a row
- A centred hero: headline, subheading, two buttons side by side
- The same border radius and drop shadow on every single element
- Emoji used as icons
- An uppercase eyebrow label above every heading
- Glassy cards floating over blurred colour blobs
- A fade-up animation on every block as it scrolls in
- Cream background, serif display, terracotta accent
- Near-black with one acid-green accent

None of these is bad once. They are bad because they are not choices — they are
what you get when nobody decided anything. The fix is always the same: make one
thing on the page memorable and let everything else be quiet.

---

## 6. The critique loop

**Run `tools/audit.js` first.** It opens the page in a real browser, reads the
computed styles and checks what can be measured exactly: contrast ratios
against the real painted background, tap-target boxes including any grown by a
pseudo-element, input font sizes, layout-thrashing transitions and sideways
overflow. It is deterministic and it is free.

```bash
node tools/audit.js dist/restaurant/index.html --width 400
node tools/audit.js dist/restaurant/index.html --width 1280
```

Never ask a vision model whether 4.31:1 passes. It cannot divide. Spend the
model on whether the thing looks good, which is the part arithmetic cannot
reach.

`tools/critique.py` sends a screenshot to a vision model on the user's own
NVIDIA credit and returns specific fixes. Use it for the mechanical half of
review so the expensive model is spent on judgement.

```bash
python3 tools/critique.py shot.png                 # web page
python3 tools/critique.py shot.png --kind app      # phone screen
python3 tools/critique.py shot.png --fix           # as a work list
```

**Treat the output as a checklist to argue with, not a verdict.** It sees one
still image: no hover, no scroll, no motion, nothing below the fold. Roughly
one point in three is wrong, and the wrong ones are usually obvious. Fix what
is right, say why you are ignoring the rest.

To take the screenshot:

```bash
node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();
const p=await b.newPage({viewport:{width:400,height:860}});
await p.goto('http://localhost:8000');await p.waitForTimeout(2000);
await p.screenshot({path:'shot.png',fullPage:true});await b.close()})()"
```

Use **400×860** for a phone and **1280×900** for desktop. Check both.

---

## 7. Before calling it done

- [ ] One sentence says what the screen is for
- [ ] The most important thing is visibly the largest
- [ ] Exactly one filled primary button
- [ ] Every gap comes from one spacing scale
- [ ] Two typefaces, three or four sizes
- [ ] Two colours plus one accent; neutrals tinted toward it
- [ ] `node tools/audit.js <page> --width 400` and `--width 1280` both clean
- [ ] Phone width 400px: no sideways scroll, nothing clipped
- [ ] Touch targets 44px, inputs 16px
- [ ] One motion tempo; nothing frequent is animated
- [ ] Reduced motion: still complete and readable
- [ ] No item from the generated-design list above
- [ ] Real content and real images, no placeholder anything
