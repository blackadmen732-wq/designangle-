# Which rules apply where

Some of what makes a web page look good makes a phone screen look wrong, and
the other way round. This folder is split so it is never a guess which you are
reading.

```
docs/
  phone/     screens inside an app: thumbs, not pointers
  web/       pages in a browser: a viewport that resizes, a mouse, scroll
  research/  where the numbers came from, with sources and licences
```

---

## The rules that hold in both places

Do not re-derive these per platform. They are the method.

- **Name the one job** the screen does, in a sentence, before anything else.
- **Hierarchy by value and weight before size.** Three greys beats three sizes.
- **Exactly one filled primary button.** Two filled buttons means none.
- **One spacing scale**, and gaps come from the layout, not per-element margins.
- **Two typefaces at most**, three or four sizes.
- **Two colours plus one accent**, neutrals tinted toward the accent.
- **Body text passes 4.5:1.** Measured, never eyeballed.
- **Nothing frequent is animated.** Navigation and the main button are instant.
- **Never ship an invented client fact.**

---

## Phone only

| Rule | Why it does not apply to the web |
|---|---|
| **44px minimum touch target** | A mouse pointer is one pixel and lands where you aim it. A thumb is about 10mm across and arrives roughly. |
| **Primary actions belong in the bottom third** | There is no reach problem on a desktop. A button at the top of a browser window is not a two-handed operation. |
| **Inputs must be 16px or larger** | Below 16px iOS zooms the page on focus and the layout jumps. No desktop browser does this. |
| **Safe-area insets** | `env(safe-area-inset-*)` exists because of notches and home indicators. A browser window has no notch. |
| **Full-bleed media, inset text** | Edge-to-edge images with a 16–20px text gutter is most of what makes a screen read as native. On a wide page it just looks unfinished. |
| **One screen, one job, strictly** | A phone has no room to hedge. A 1280px page can carry a second idea below the fold. |

## Web only

| Rule | Why it does not apply to a phone |
|---|---|
| **Hover states** | There is no hover on a touch screen. Anything only reachable by hover is unreachable. |
| **Line length caps** (`max-width`) | A phone is already narrower than the cap. The constraint is the device. |
| **Breakpoints and fluid type** | An app screen is one width. A page is every width between 320 and 2560. |
| **Scroll-linked motion** | Pinning and parallax are page techniques. On a phone they fight the system's own scrolling. |
| **Focus-visible outlines** | Keyboard navigation is a browser concern. Worth keeping anyway, but it is not what a phone design is judged on. |
| **The fold is negotiable** | On a page people scroll by habit. On a phone screen, below the fold is often never seen. |

---

## Phone references

| File | What it is |
|---|---|
| `phone/app-patterns-dark.html` | Eight patterns from two dark media apps. One thing dominates the screen. |
| `phone/light-dense-patterns.html` | Seven patterns for the opposite case: light ground, several things that matter at once. Values read from Material 3, Base Web and Carbon. |
| `phone/reviewboost-screens.html` | A worked example: four screens of a real light, dense product. |

**Read both pattern files, not one.** The dark set says make one thing huge
and cut the rest. On an owner's dashboard that is wrong, and the light set
says why. Neither is the whole method.

## Web references

The web rules live in `DESIGN.md` and in `template/` — the shared CSS and the
motion, which every client site inherits. There is no separate pattern page
because the kit itself is the reference: `node build.js` and look at it.

---

## Checking either

```bash
node tools/audit.js <file> --width 400     # phone
node tools/audit.js <file> --width 1280    # web
```

Both, every time. Several faults in this repo only appeared at one width:
a flex item that shrank below its touch target at 1280 but not at 400, and
a table that overflowed at 400 but not at 1280.
