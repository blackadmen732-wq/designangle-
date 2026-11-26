---
name: app-style
description: Build and check phone app screens, and app-like pages such as the owner panel, in the style measured from the app redesign recordings - large type in regular weight, two-tone headings, one white pill with circles the same height, photos that fade into a dark or light ground, floating docks - then prove they do not look AI-made with the unslop audit. Use when designing, redesigning or reviewing any app screen, when recreating a screen from a recording or screenshot, or when asked to make something look premium, less generic or "unslopped".
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
| `app-style/examples/podcast/` | Earshot, an original app designed with this skill as its test, and `ai-default.html`, the deliberately bad version the audit is proved on. Start from Earshot's structure, not from a recreation. |
| `tools/slop.js` | The unslop audit: 18 points, a score, and the one bottleneck to fix first. |
| `tools/check.js` | Usability: contrast, tap size, gutters, 16px fields, sideways scroll. |
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
   If a part is missing, build it in the page, then move it into
   `app-style.css` once it works, so the next screen has it.
5. **Type**: 13, 15, 17, 20-22, 29, 36-48, and 132 for one number. Six sizes
   at most on a screen. 400 and 500 for anything large, 600 for buttons and
   short labels, 200 only for the one huge number. Headings in two tones:
   the same size and weight, the second half in `.dim`.
6. **Spacing on the 4pt grid. Three radii** from 12, 16, 20, 24, plus round.
7. **Real imagery.** The product's own photos or artwork. On dark, graded to
   about 70% brightness. Behind a hero, a blurred copy of the real image,
   never a coloured CSS glow.
8. **Check, then look.** Below.

## The check loop

```bash
node tools/slop.js path/to/screen.html        # score, and the BOTTLENECK
node tools/check.js path/to/screen.html       # usability, both sizes, screenshots in .check/
```

Fix only the bottleneck slop.js names, run it again, repeat. When nothing
fails, look at the screenshots: the audits cannot see a broken layout, an
image of the wrong subject, a weak idea, or motion. A test on Earshot found
two things only looking caught (an image blown up to full size, and the
show's name said twice); the second is now measured.

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

## What the first test found

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
