---
name: logo-recreate
description: Recreate a logo, wordmark or emblem from a reference picture so it looks exactly like the original - a 3D chrome mark, a glowing wordmark, a lockup - instead of a hand-drawn imitation. Use whenever a screen being built or matched has a logo in its reference image, or when asked to copy, trace, vectorise or redraw a logo.
---

# Recreating a logo from a picture

A logo drawn by hand in SVG next to the real one looks cheap at once: the
proportions drift, the bevels flatten, the glow is wrong. Do not draw it.
Take it from the picture.

## Steps

1. **Find its box.** Open the reference and read off the logo's pixel box
   (x, y, w, h). Leave 6 to 10px of black around it so the glow comes too.
   Do one box per piece: the mark, the wordmark, a small lockup.
2. **Run the tool:**
   ```bash
   python3 tools/trace-logo.py .refs/<ref>.png <x> <y> <w> <h> <out-dir> --name mark
   ```
   It writes `mark-cut.webp` (the picture with the black taken out, glow
   and reflections kept), `mark.svg` (traced paths in brightness layers
   with chrome gradients) and `mark-sheet.png` (look at it, then delete).
   `--levels 1` for a flat wordmark, `3` for a bevelled 3D mark. Dark logo
   on a light ground: `--invert`.
3. **Use the cutout where the logo is big** (a splash, a sign-in, a hero):
   `<img src="art/mark-cut.webp" width="262" height="200" alt="">`, at its
   own pixel size or smaller, never larger. **Use the SVG where it is small**
   (a window bar, a tab icon), or where it must scale.
4. **Place it by its box,** not by eye: the logo's centre in the reference
   is where it goes. Nudge with `position: relative; left/top`, not with
   margins, which push everything after it.
5. **Score it:** `node tools/match.js <page> <ref>`. A correct logo moves
   the structure score by several points on a splash screen.

## Rules

- Only recreate a logo the person owns or has the right to use. A brand's
  logo in a private study stays out of anything a client sees.
- Never upscale a cutout. If the reference is too small, use the SVG, or
  ask for the logo file.
- If the logo file exists (SVG, PNG with transparency), use that instead.
  This tool is for when all you have is a screenshot.
