# App style

The look of the app redesigns, as a system, and the checks that prove a
screen does not look AI-made. Built from frame-by-frame measurement of six
screen recordings: Netflix, Uber Eats, Google Maps, Airbnb and Starbucks
redesigns by uidesignmahsa, and a sign-in screen by nuhushaik.

The how-to is the skill: `.claude/skills/app-style/SKILL.md`.

```
app-style.css         two grounds (.ui-dark, .ui-light) and the parts; it imports
                      ../tokens/tokens.css, the space, corners, sizes and motion it
                      shares with the websites (check: node tools/tokens.js)
app-icons.css         91 icons as CSS masks; edit tools/make-icons.py, not this
styles/               other looks for the same parts: plain.css, and a page showing one
                      screen in both (styles/README.md says how to add one)
screens/              eight recreations that line up with their reference frames
examples/podcast/     Earshot: an original app built with the system as its test
examples/tickets/     Trac 1.6 redesigned from its own data, with motion: the second test
examples/kanboard/    Kanboard redesigned from its own data: a board, drag that springs
examples/dokuwiki/    DokuWiki redesigned from its own pages: reading, editing, locks
examples/chick-fil-a/ an unofficial Chick-fil-A study (not affiliated), Unsplash stand-ins
app-motion.js         sheet(), toast(), flyTo(), bump(): the motion CSS cannot do alone
vendor/               auto-animate 0.10.2 (MIT) as a classic script
tools/                make-icons.py, inline-icons.py, spring.js (a spring as a CSS curve)
```

## Checking

```bash
node tools/slop.js app-style/examples/tickets      # unslop: 18 points and the bottleneck
node tools/check.js app-style/examples/tickets     # usability, both sizes
node tools/motion.js app-style/examples/tickets    # every animation measured, filmstrips in .check/motion/
node tools/compare.js app-style/screens/maps-place.html .refs/maps.png   # only when recreating
```

## Scores, 26 November 2026

| Screen | Unslop | Usability (check.js) | Motion |
|---|---|---|---|
| `examples/podcast/ai-default.html` (deliberately bad) | 18 | | 0: slow, ease-in, animates height and left, moves under reduced motion |
| Trac 1.6 as it ships (the tickets "before", live) | 77 and 83 | 53 and 38 failures | nothing moves |
| `examples/tickets/` (Trac redesigned) | 100, both sizes | pass; 60 ticket screens at five phone sizes | 100, both sizes |
| Kanboard 1.2.57 as it ships (live) | | 35 and 44 failures on a phone | nothing moves |
| `examples/kanboard/` (Kanboard redesigned) | 100, both sizes | pass | 100, both sizes |
| DokuWiki as it ships (live) | | 11, 9 and 10 failures on a phone | nothing moves |
| `examples/dokuwiki/` (DokuWiki redesigned) | 100, both sizes | pass, reading pages too | 100, both sizes |
| `examples/chick-fil-a/` (study, rebuilt to her light screen; the real app could not be photographed) | 100, both sizes | pass | 100, both sizes |
| `dist/hvac`, `dist/restaurant` (the kit's client sites) | 100 phone, 98 desktop (one photo too small for 2x) | pass, with GSAP and Lenis loaded | |
| `examples/podcast/index.html` (Earshot) | 100 | pass | |
| `portal/app` (owner panel) | 100 | pass | |
| `screens/` (recreations) | 64 to 92 (Gmail has no headline: her list starts at the search) | pass | |

Trac scores well on unslop because it does not look AI-made; it looks old,
and that is what the usability check fails it on.

The recreations keep the originals' own spacing, so they score lower on the
grid: they are measurements, not new work. New work should score 100 and
then be looked at, because the audit cannot see everything. And it should be
put beside her nearest screen: the first Chick-fil-A study scored 100 on all
three and still was not her style (`docs/research/her-redesigns.md`).
