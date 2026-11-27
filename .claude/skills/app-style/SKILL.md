---
name: app-style
description: Build and check phone app screens, and app-like pages such as the owner panel, in the style measured from the app redesign recordings - large type in regular weight, two-tone headings, one white pill with circles the same height, photos that fade into a dark or light ground, floating docks - with motion that has a job (springs, shared-element transitions, sheets), then prove they do not look AI-made with the unslop audit and move well with the motion audit. Use when designing, redesigning or reviewing any app screen, when adding animation or transitions to one, when recreating a screen from a recording or screenshot, or when asked to make something look premium, less generic or "unslopped".
---

# App style

Read `.claude/skills/design/SKILL.md` first. It is the method: name the job,
find the one thing, make it bigger than feels comfortable, cut what
competes, apply the systems, look. This skill is the style that method is
applied in, and the checks that prove it worked.

## What is in the repo

| Path | What it is |
|---|---|
| `app-style/app-style.css` | The system: tokens, two grounds, the components. Every value measured from the recordings, in iOS points. |
| `app-style/app-icons.css` | 71 icons drawn as CSS masks (`<i class="ic ic-play-fill">`). Generated: edit `app-style/tools/make-icons.py`. |
| `app-style/screens/` | Seven recreations of the redesigns (Netflix x2, Uber Eats, Maps, Airbnb, Starbucks, sign-in). Studies: read them to see the style used. |
| `app-style/examples/podcast/` | Earshot, an original app designed with this skill as its test, and `ai-default.html`, the deliberately bad version both audits are proved on. Start from Earshot's structure, not from a recreation. |
| `app-style/examples/tickets/` | A redesign of a real, ugly app (Trac 1.6) from its own data, light ground, phone and split desktop, with motion. The second test; start here for anything that moves. `img/before-after.webp` is the before and after. |
| `app-style/examples/kanboard/` | Kanboard redesigned from its own data: a board, one column at a time on a phone, drag that springs into place. |
| `app-style/examples/dokuwiki/` | DokuWiki redesigned from its own pages: long-form reading, a reading bar, an editor that says who holds the lock. |
| `app-style/examples/chick-fil-a/` | An unofficial Chick-fil-A study (not affiliated): ordering, a bag that items fly into, rewards in one number. Built where the real app could not be photographed. |
| `app-style/app-motion.js` | The motion CSS cannot do alone: `sheet()` (flick to close), `toast()`, `flyTo()`, `bump()`. Reduced-motion aware. |
| `tools/photos.py` | Photos for a screen: a contact sheet of candidate Unsplash ids to look at, then fetch with credits. |
| `tools/cdn.js` | Where a CDN is blocked, the checks load the same library version from npm, so they test the page visitors get. |
| `.claude/skills/app-redesign/` | The order of work for redesigning an existing app, and the traps four redesigns hit. |
| `.claude/skills/animate/`, `review-animations/` | Emil Kowalski's animation skills (MIT), adapted to this repo's tokens and checks. |
| `app-style/tools/spring.js` | Prints a spring as a CSS `linear()` curve and the duration to pair it with. |
| `app-style/vendor/auto-animate.js` | auto-animate 0.10.2 (MIT), for lists whose rows come and go. Never with its own keyframes: see Motion. |
| `tools/slop.js` | The unslop audit: 18 points, a score, and the one bottleneck to fix first. |
| `tools/check.js` | Usability: contrast, tap size, gutters, 16px fields, sideways scroll, text running into text, controls hidden under a floating action. |
| `tools/motion.js` | The motion audit: presses through the page, measures every animation, fails what moves badly, and writes frame-exact filmstrips. |
| `tools/compare.js` | A render beside a reference frame, with rows in points. Only for recreating. |
| `.claude/agents/design-advisor.md` | A second opinion on Fable 5.2. Needs usage credits on the account. |

## Building a new screen

1. **Write the brief at the top of the file**, five lines: the job, the one
   thing, what was cut, the ground, the accent. Earshot's header comment is
   the model. If you cannot write the job in one sentence, stop.
2. **Choose the ground by the product.** Dark (`.ui-dark`) when people use
   it at night or the content carries the colour: media, maps, rewards,
   anything photographic. Light (`.ui-light`) for shopping, food delivery,
   documents, daylight work. Never by habit.
3. **One accent, spent on what is live or primary.** The progress, the
   current tab, the main circle. The main button is a white pill on dark and
   a dark pill on light, not the accent. Never purple or indigo.
4. **Compose from the parts**, in this order of importance:
   - the hero: `.hero` (photo, graded and faded) or blurred real artwork
     behind the top; one huge thing (`.t-mega` for a number, 36-48pt for a
     title)
   - `.actions` with one `.pill` and `.circle.lg` beside it, same height
   - `.sec-head`, `.list` and `.list-row`, `.cover.sm/.md/.lg`, `.rail`
   - `.card`, `.stats`, `.tags`/`.tag` (information), `.chips`/`.chip`
     (filters; the selected one inverts), `.segmented`, `.tabs-line`
   - `.dock` with `.dock-bar` and `.dock-fab`, or `.thumb-cta` for one
     floating action
   - forms and choices: `.field`, `.seg-radio`, `.chip-radio`, `.choices`
     and `.choice`, `.switch`, `.tick`, `.stepper`; and `.badge`, `.sum`
   - reading: `.prose` for any long text, `.read-bar` for how far through
   If a part is missing, build it in the page, then move it into
   `app-style.css` once it works, so the next screen has it.
5. **Type**: 13, 15, 17, 20-22, 29, 36-48, and 132 for one number. Six sizes
   at most on a screen. 400 and 500 for anything large, 600 for buttons and
   short labels, 200 only for the one huge number. Headings in two tones:
   the same size and weight, the second half in `.dim`.
6. **Spacing on the 4pt grid. Three radii** from 12, 16, 20, 24, plus round.
7. **Real imagery.** The product's own photos or artwork. On dark, graded to
   about 70% brightness; on light, lifted a little (`brightness(1.1)`) so it
   fades into the page. Behind a hero, a blurred copy of the real image,
   never a coloured CSS glow. A screenshot is not a photo: its own text reads
   as the app's, so frame it, at the size it was taken, over a blur of
   itself (tickets example, ticket 10).
8. **Motion last, and only where it has a job.** Below.
9. **Check, then look, then watch.** Below.

## Motion

The rules are Emil Kowalski's animation standards (github.com/emilkowalski/
skills), Apple's "Designing Fluid Interfaces", ibelick's
fixing-motion-performance and Vercel's web interface guidelines, kept to the
ones that held up on a real app. `docs/research/motion-sources.md` has what
was read and what was left.

1. **Should it move at all?** Pressed all day (tabs, filters toggled, the
   dock): instantly, or a quick slide of what changed. Occasional (opening a
   ticket, a sheet, a toast): a standard move. Rare (a first run, a launch
   done): the only place for delight. A keyboard shortcut never animates.
2. **Name its job** in one word: feedback, where it came from, what changed,
   or bridging a jump. "It looks nice" is not a job.
3. **The cheapest tool:** a CSS transition; `@starting-style` for things
   arriving; a view transition (`document.startViewTransition`) between
   screens; the Web Animations API for anything else. A library only for
   what those cannot do (rows of a list moving: auto-animate).
4. **Only `transform` and `opacity`** (and `translate`, `scale`). Never
   width, height, top, left, margin or padding. Never from `scale(0)`: start
   at .95 to .98 with opacity 0.
5. **One tempo, from the tokens in app-style.css:** `--ease-out` for what
   enters, leaves or is pressed; `--spring` with `--t-spring` for what
   travels; `--spring-sheet` with `--t-sheet` for sheets. Never ease-in.
   Done to the eye (95% of the way) within 300ms. `tools/spring.js` makes
   another spring when one is needed.
6. **A shared element travels over an empty page.** When an element moves
   between screens, the old screen fades at once and the new one arrives
   110ms behind it (`data-nav="morph"`), or the traveller runs through the
   new screen's text. Text that changes size is named `vt-text-a` with
   `--vt-k` set, so its glyphs grow instead of the snapshot stretching.
7. **Reduced motion is fewer and gentler, not none:** fades stay, movement
   goes. The system does this for its own parts; a library usually needs
   telling (a plugin bypasses auto-animate's own check).
8. **Libraries are checked like our own code.** auto-animate's defaults
   animate `height` and ease new rows in; the motion audit caught both, and
   its plugin hook takes our keyframes instead (tickets example).

The parts: `.meter` (a fill that slides on the spring), `.sheet` on a
`<dialog>` (rises on the sheet spring, leaves on the ease-out; the tickets
example adds the flick to dismiss), `.toast`, press feedback on every
pressable part, and the view transitions (`data-nav` = `push`, `pop`,
`morph`, `morph-back` on `<html>`).

## The check loop

```bash
node tools/slop.js path/to/screen.html        # score, and the BOTTLENECK
node tools/check.js path/to/screen.html       # usability, both sizes, screenshots in .check/
node tools/motion.js path/to/screen.html      # every animation measured; filmstrips in .check/motion/
```

Fix only the bottleneck slop.js names, run it again, repeat. When nothing
fails, look at the screenshots: the audits cannot see a broken layout, an
image of the wrong subject, or a weak idea. A test on Earshot found two
things only looking caught (an image blown up to full size, and the show's
name said twice); the second is now measured.

For motion, give the page a tour: what to press, in order, as JSON in
`<script type="application/json" id="motion-tour">` (the tickets example has
one). The audit presses through it at both sizes, with and without reduced
motion, and fails layout animation, slow or eased-in motion, movement under
reduced motion, and presses that answer late. Then open the filmstrips: each
step paused and photographed at 0, 40, 80, 120, 180, 240, 320 and 450ms.
They showed the title running through the new screen's text before the
choreography in Motion rule 6 fixed it.

Then record it and watch it (Playwright's `recordVideo`, then `ffmpeg` to mp4
or gif). The tickets recording caught what no audit had: a tab sitting under
the floating "Resolve as fixed" button, so a tap meant for the tab closed the
ticket. check.js fails that now.

## The 18 tells, and how the style answers them

From "18 things to give to Claude to unslop your website" (@julianxuofficial).
slop.js measures 15; three need a person.

| # | Tell | The rule here | How it is checked |
|---|---|---|---|
| 1 | Purple gradient | No purple or indigo, ever; no decorative gradients | gradient stops by hue |
| 2 | Radial glows | Glow comes from a blurred real image, not a coloured CSS radial | saturated radial gradients, blurred blobs |
| 3 | Gradient text | Never | `background-clip: text` |
| 4 | Extra badges | Tags only for information; no SALE / NEW / HOT piles | small pills, promotional words |
| 5 | Two CTAs max | One pill per screen; per-item actions and filters do not count | distinct actions on the first screen |
| 6 | Emoji overload | None in headings or buttons; never as art | emoji in text |
| 7 | Readable type | Body 15px or more, line height 1.3 or more, under 90 characters | every paragraph of 8+ words |
| 8 | Benefits first | The headline says what the person gets | flags self-talk ("Welcome", "Introducing"); a person judges |
| 9 | Specific copy | Names, numbers, places; no hype | hype words, "!", Title Case Headings |
| 10 | One accent colour | One hue, spent once or twice | saturated hues by area |
| 11 | 4-point spacing | Every margin, padding and gap | share on the grid |
| 12 | Type hierarchy | Six sizes at most, a real jump at the top | sizes, ratio, 1px neighbours |
| 13 | Visual priority | One thing clearly first; nothing said twice | biggest text against the next; repeats |
| 14 | Corner radius | Three radii plus round | distinct radii |
| 15 | Selective glass | Blur only where a control floats over a photo | blurred elements |
| 16 | Scannable cards | A heading and a number or a short line, not a paragraph | words per card |
| 17 | Interaction cues | Pressed, hover and keyboard-focus states | rules in the stylesheets |
| 18 | Premium assets | Real, sharp imagery of the subject | image resolution, emoji art; a person judges |

## Recreating a screen from a recording

When the job is "the same exact thing" as a reference:

1. Extract the frame where the finished design shows whole, without caption
   bubbles: `ffmpeg -ss <t> -i video.mp4 -frames:v 1 frame.png`.
2. Find the screen's edges from pixel brightness, crop to that box and scale
   to 786 x 1704 (393 x 852 at 2x). For the uidesignmahsa videos the box is
   (255.5, 297.5)-(823.5, 1525.5) in a 1080 x 1920 frame. Keep references in
   `.refs/`, which git ignores; they are other people's work.
3. Measure before writing: rows of content, widths of text, colours sampled
   as a median of a fill region (text samples read too light).
4. Calibrate type by width. Inter at the display optical size matches SF Pro
   Display widths; `app-style.css` pins that (`font-variation-settings:
   "opsz" 32`). Never put `-apple-system` first unconditionally: Chromium
   reads it as the system UI font on every platform.
5. `node tools/compare.js screen.html .refs/ref.png`, then fix the rows
   that differ by more than 1pt, then look at the overlay.

## What the tests found

Earshot was the system's first original screen (the app was picked at
random from 24). What got in the way, and what changed:

- The audits measured usability, not the AI look. Now `slop.js`, proved on
  `ai-default.html` (18/100) before it was trusted.
- The system put glass behind every circle and had a 9px rail gap and other
  off-grid values. Glass is now opt-in (`.glass`, or inside `.topbar`);
  the grid is 4pt.
- There was no keyboard focus style. There is now.
- Missing parts: cover art, list rows, section heads, pause and library
  icons. All in the system now.
- No palette method for a new brand. Steps 2 and 3 above.
- The advisor could not run: Fable 5.2 needs usage credits, and the
  fallback hit the account's usage limit. The checks above do not depend
  on it.

The third test redesigned three more, with only what the repo had: a
Chick-fil-A study (the real app could not be photographed here), Kanboard
and DokuWiki (both run, photographed and audited). Each passes all three
audits at both sizes. What they lacked went into the system (the parts
above, `app-motion.js`, fifteen icons, a photo tool), and what they taught
is the app-redesign skill. The checks themselves were wrong in places and
were fixed: they now test pages with their CDN libraries, wait for a page
to settle, and stop counting pickers, list rows, centring margins,
decorative text and blurred images against a screen.

The second test redesigned a real app instead of inventing one: Trac 1.6, an
open-source issue tracker, picked as the ugliest app that would run here,
from its own data (53 and 38 usability failures before, none after). What
was missing, and what was found or built:

- **No motion system and no way to check motion.** Found Emil Kowalski's
  animation skills, ibelick's ui-skills, Vercel's interface guidelines and
  LottieFiles' motion-design skill (all MIT); took their measurable rules
  into the tokens, the parts and `tools/motion.js`, proved on
  `ai-default.html` (0/100) before it was trusted.
- **The library found for lists broke the rules** (height, ease-in). Kept,
  with our keyframes.
- **The light ground had never carried an original screen.** It works with
  a warm off-white page, a photo lifted to fade into it, and white cards
  with a soft shadow; the accent becomes urgency, so focus is drawn in ink.
- **Only phone layouts.** The tickets example is a split view from 1024px:
  list and ticket side by side, one headline leading (the unslop audit
  failed two equal 36px headings).
- **A screenshot used as a hero read as the app's own text.** Framed now.
- **Icons:** check, chev-left, chat, link, flag, clip, undo were missing.
