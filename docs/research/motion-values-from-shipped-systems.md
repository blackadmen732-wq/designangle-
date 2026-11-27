# Motion values, taken from shipped design systems

Every number here was read out of a published package on this machine, not
from memory and not from a tutorial. The commands that produced them are at
the bottom so you can re-run them when a version moves.

Checked 24 November 2026.

| Source | Package | Version | Licence |
|---|---|---|---|
| Uber Base Web | `baseui` | 18.2.0 | MIT |
| Google Material 3 | `@material/web` | tokens `v0_192` | Apache-2.0 |
| Open Props | `open-props` | 1.7.23 | MIT |

All three are permissively licensed. None of this needed reverse
engineering — the values ship in the packages.

---

## 1. What this kit actually does today

Before copying anyone, here is what Design Angle ships. This was measured,
and it is not what `DESIGN.md` and the design skill said it was.

| Layer | Value | Where |
|---|---|---|
| All CSS transitions | `cubic-bezier(.65, 0, .2, 1)` | `template/site.css`, one `--ease` variable |
| Hero, showcase, wipes | `expo.inOut` | `template/site.js`, GSAP |
| The one spring | `back.out(1.6)` | `template/site.js` |
| Scroll-linked | `none` (linear) | `template/site.js` |

The two curves the docs promised — `cubic-bezier(0.33, 1, 0.68, 1)` and
`cubic-bezier(0.76, 0, 0.24, 1)` — appear **zero times** in the code. They
were written down and never wired up.

So the kit has three motion systems and documented a fourth. The docs are
now corrected to describe the three that exist.

---

## 2. Durations

### Uber Base Web

`themes/shared/animation.js` exports a plain ladder, no stated intent per
step:

```
timing100  100ms     timing400  400ms     timing900   900ms
timing150  150ms     timing500  500ms     timing1000 1000ms
timing200  200ms     timing600  600ms     timing1500 1500ms
timing250  250ms     timing700  700ms     timing3000 3000ms
timing300  300ms     timing800  800ms
```

### Material 3

`md-sys-motion` names its steps by band, which is the more useful shape:

| Band | Values |
|---|---|
| short1–4 | 50, 100, 150, **200ms** |
| medium1–4 | 250, 300, 350, **400ms** |
| long1–4 | 450, 500, 550, **600ms** |
| extra-long1–4 | 700, 800, 900, **1000ms** |

### What they agree on

**Small interface feedback tops out at 200ms.** Material calls 200ms the end
of `short`; Uber's ladder has `timing200` sitting in the same place. Neither
treats a button response as a medium-length event.

That settles the 200ms-vs-300ms disagreement between this kit's two files,
and it agrees with the independent reason already given: 200ms is Google's
INP threshold, so it is the number measured in the field rather than a
preference.

**Nothing routine runs past 1000ms.** Material's longest named step is
`extra-long4` at 1000ms. Uber has 1500ms and up, but those are for
progress indicators and skeletons, not for a thing appearing.

---

## 3. Easing curves

### Uber Base Web, with the intent it ships with

| Token | Curve | Uber's own comment |
|---|---|---|
| `easeLinear` | `cubic-bezier(0, 0, 1, 1)` | constant speed; opacity and colour |
| `easeDecelerate` | `cubic-bezier(0.22, 1, 0.36, 1)` | starts at top speed, gradual stop; **entering** |
| `easeAccelerate` | `cubic-bezier(0.64, 0, 0.78, 0)` | starts gradually, ends at top speed; **exiting** |
| `easeAccelerateDecelerate` | `cubic-bezier(0.83, 0, 0.17, 1)` | gradual both ends, fast middle; **"a good default for most motion"** |
| `easeResponsiveAccelerate` | `cubic-bezier(0.11, 0, 0.5, 0)` | for responsiveness with short durations |

### Material 3

| Token | Curve |
|---|---|
| `easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` |
| `easing-standard-decelerate` | `cubic-bezier(0, 0, 0, 1)` |
| `easing-standard-accelerate` | `cubic-bezier(0.3, 0, 1, 1)` |
| `easing-emphasized` | `cubic-bezier(0.2, 0, 0, 1)` |
| `easing-emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` |
| `easing-emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` |

### Open Props

A numbered intensity scale rather than named intents, which is useful for
seeing where a curve sits:

```
ease-in-out-1  cubic-bezier(.1, 0, .9, 1)     gentlest
ease-in-out-2  cubic-bezier(.3, 0, .7, 1)
ease-in-out-3  cubic-bezier(.5, 0, .5, 1)
ease-in-out-4  cubic-bezier(.7, 0, .3, 1)
ease-in-out-5  cubic-bezier(.9, 0, .1, 1)     most aggressive
```

### Where this kit's curve sits

`cubic-bezier(.65, 0, .2, 1)` is an ease-in-out between Open Props' steps 3
and 4, pulled slightly toward a faster finish. It is a reasonable general
curve and it is not an outlier.

The problem is not the curve. It is that one ease-in-out is used for
**everything**, including things entering. All three systems above separate
entering from moving, because an element arriving should decelerate into
place rather than ease in at both ends.

---

## 4. What all three systems agree on

These hold across Uber, Material and Open Props, so they are worth treating
as settled rather than as taste:

1. **Three intents, not one curve.** Entering decelerates, exiting
   accelerates, moving across does both. A single ease-in-out everywhere is
   the thing each of them specifically avoids.
2. **Entering and exiting are not symmetric.** Entering gets the longer
   duration and the softer landing; exiting is quicker and can be harsher,
   because nobody is waiting to look at a thing that is leaving.
3. **Linear is correct, for exactly two cases**: anything tied to scroll
   position, and anything that loops. Both Uber (`easeLinear`) and this kit
   (`ease: 'none'`) already do this.
4. **Interface feedback stays under 200ms.**

---

## 5. What this changes here

Nothing in the shipped sites, yet. The curves above are not better than
`cubic-bezier(.65, 0, .2, 1)` in a way that justifies changing how two live
sites feel without being asked.

What **is** fixed: `DESIGN.md` and the design skill now state the curves the
code actually uses. Documenting motion the kit does not perform was the real
fault, because it meant anyone reading the docs to match an existing site
would have matched nothing.

The open decision, for whoever owns the design: adopt a three-intent set so
entering stops sharing a curve with moving. The nearest coherent family that
is already MIT and already has stated intents is Uber's:

```css
--ease-enter: cubic-bezier(0.22, 1, 0.36, 1);   /* decelerate into place */
--ease-exit:  cubic-bezier(0.64, 0, 0.78, 0);   /* accelerate away */
--ease-move:  cubic-bezier(0.83, 0, 0.17, 1);   /* travel across */
```

That is a change to how the sites feel, so it is not made here.

---

## 6. Re-running this

```bash
npm view baseui version license
npm view @material/web version license
npm view open-props version license

# Uber
curl -sL "$(npm view baseui dist.tarball)" | tar xz
cat package/themes/shared/animation.js
cat package/themes/shared/sizing.js

# Material 3
curl -sL "$(npm view @material/web dist.tarball)" | tar xz
cat package/labs/gb/styles/motion/md-motion-tokens-easing.css

# Open Props
curl -sL "$(npm view open-props dist.tarball)" | tar xz
grep -rhoE "\-\-ease-[a-z-]+[0-9]: *cubic-bezier\([^)]*\)" package/ | sort -u
```

Unpack downloads into an empty directory and read them. Do not run anything
from inside one.
