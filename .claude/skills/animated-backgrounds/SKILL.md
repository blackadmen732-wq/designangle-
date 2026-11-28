---
name: animated-backgrounds
description: Make and animate a background - drifting light streaks, a slow sweep of light, a glow behind glass, a still photo that pushes in - for a dark or cinematic screen, with reduced motion handled. Use when asked for a background, an animated background, "make it feel alive", light effects behind glass, or when a reference shows streaks, beams or glows behind the UI.
---

# Animated backgrounds

A background is lighting, not decoration. It has one job: give the glass
something to blur and put light where the screen's one thing is. Build it
from these four recipes in `app-style/desktop/art.js`, in this order of
use, and stop at the first that does the job.

| Recipe | Call | Use for | Motion |
|---|---|---|---|
| Glow | `DG.glow(el, x, y, size, .03 to .08)` | light behind a glass card so it reads as glass | none |
| Streaks | `DG.streaks(el, [lines])` | the cinematic look: lit edges sweeping out of the corners | drift 24 to 36s, a glint along the core |
| Sweep | `DG.sweep(el, { strength: .04 to .06, seconds: 14 to 18 })` | a band of light that crosses and rests | once per cycle, then a long rest |
| Photo push | `.billboard img` | a still that carries the screen (media, a hero) | scale 1 to 1.05 over 24s |

`el` is a `.dg-art` layer: fixed, behind everything, never clickable.

## Placing streaks

- Coordinates are the reference's pixels on a 1672 x 941 canvas; the SVG
  covers the screen, so they keep their place at other sizes.
- Two or three streaks, never across text you have to read. Corners, and
  behind the one thing (a welcome, a card's edge).
- Each streak is three strokes on one path (a wide blurred glow, a soft
  core, a thin hot core) plus an optional soft sheet beside it. Set `hot`
  to where along the line the light peaks. A real lit edge is brightest
  near one end, not in the middle.
- Copying a reference: trace the line's start, end and the two points
  where it bends most, then `C` through them.

## Rules

- Nothing in the background moves faster than 14 seconds a cycle. A
  background people can see moving is a distraction.
- `prefers-reduced-motion`: streaks and glints stop, the sweep rests half
  way, the photo stays still. The CSS already does this; do not add motion
  outside it.
- Code draws light well and pictures badly. A photographed or 3D-rendered
  background (lit glass, smoke, metal) is art: render it in an image tool
  and put it in `.dg-art` as an `<img>`, then keep these recipes for the
  motion on top.
- Score with `tools/match.js` when there is a reference, and check the
  filmstrips with `tools/motion.js` when there is motion.
