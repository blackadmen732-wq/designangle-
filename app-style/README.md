# App style

The look of the app redesigns, as a system, and the checks that prove a
screen does not look AI-made. Built from frame-by-frame measurement of six
screen recordings: Netflix, Uber Eats, Google Maps, Airbnb and Starbucks
redesigns by uidesignmahsa, and a sign-in screen by nuhushaik.

The how-to is the skill: `.claude/skills/app-style/SKILL.md`.

```
app-style.css         tokens, two grounds (.ui-dark, .ui-light), the parts
app-icons.css         71 icons as CSS masks; edit tools/make-icons.py, not this
screens/              seven recreations that line up with their reference frames
examples/podcast/     Earshot: an original app built with the system as its test
tools/                make-icons.py, inline-icons.py (copies icons into a standalone page)
```

## Checking

```bash
node tools/slop.js app-style/examples/podcast/index.html    # unslop: 18 points and the bottleneck
node tools/check.js app-style/examples/podcast/index.html   # usability, both sizes
node tools/compare.js app-style/screens/maps-place.html .refs/maps.png   # only when recreating
```

## Scores, 26 November 2026

| Screen | Unslop | Bottleneck |
|---|---|---|
| `examples/podcast/ai-default.html` (deliberately bad) | 18 | purple gradient |
| `examples/podcast/index.html` (Earshot) | 100 | none |
| `portal/app` (owner panel) | 100 | none |
| `screens/` (recreations) | 74 to 92 | spacing off the 4pt grid, measured from the originals |

The recreations keep the originals' own spacing, so they score lower on the
grid: they are measurements, not new work. New work should score 100 and
then be looked at, because the audit cannot see everything.
