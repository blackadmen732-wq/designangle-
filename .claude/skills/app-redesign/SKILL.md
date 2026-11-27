---
name: app-redesign
description: Redesign an existing app or screen end to end, the way this repo's four redesigns were done (Trac, Kanboard, DokuWiki, and a Chick-fil-A study) - get the real before, its real data, write the brief, build only from app-style, prove it with check.js, slop.js and motion.js at both sizes, record it and watch it, and turn every gap found into a fix in the system. Use when asked to redesign, restyle or "make good" an existing app, site or screen, when asked to redesign a well-known app as a study, or to test what the system can and cannot do.
---

# Redesigning an app

The method is the design skill, the look is the app-style skill, the motion
is the animate skill. This is the order of work that made them hold up on
four real apps, and the traps each one hit.

## 1. Get the real before

- **If it can run here, run it.** Open-source apps start in seconds:
  Python (`pip install trac`), PHP (`php -S 127.0.0.1:8130` in a Kanboard or
  DokuWiki checkout), Node. Fill it with believable data through its own
  API or files, then photograph it at 393 x 852 (at 2x) and 1280 x 900, and
  run check.js's audit on it. Write the failure counts down: that is the
  before.
- **If it cannot (a brand's app, the App Store blocked),** say so and do not
  fake a screenshot. Research what its users and the press reported, and
  let the brief answer each problem by name (the Chick-fil-A study:
  points nobody understood, money loaded before paying, the wrong
  restaurant, checkout errors).

## 2. Get its data, and keep how you got it

Seed through the app (its API, its files), export to `data.js`
(`window.X = {...}`, a script, so the page also opens from disk), and keep
both scripts in `source/` so anyone can rebuild the before and the data.
Invented people and businesses say they are invented, in the files and,
for a real brand, on the screen ("prices here are samples"). Never invent
a client fact.

## 3. Write the brief before any markup

At the top of the page: the job, the one thing, what was cut, the ground,
the accent, what each reported problem becomes, and the motion. Tickets,
Chick-fil-A, Kanboard and DokuWiki each start with one. Find the problems
with the questions in the `redesign-eye` skill, and word each answer as
she does: what changed, then what you get ("you can choose without opening
each one"); if the second half will not come, the change is decoration.

## 4. Build only from the system, and grow the system

`app-style.css`, `app-icons.css`, `app-motion.js`. When a part is missing,
build it once, then move it into the system, not the page. The four tests
added: fields, segmented and chip radios, choice rows, switch, stepper,
tick box, badge, receipt rows, prose, a reading bar, a sheet, a toast, a
meter, view transitions, flyTo, and fifteen icons.

Photos: the subject's own, or stand-ins of the right subject.
`python3 tools/photos.py try <ids>` makes a contact sheet; look at it, then
`fetch` with credits. No other brand's packaging, no newspaper mastheads.

## 5. Wide screens get their own layout

A phone column centred on a desktop wastes it. The four tests used: list
and item side by side (tickets), menu and bag (Chick-fil-A), all the columns
(Kanboard), sidebar, page and contents (DokuWiki). One heading still leads:
the second pane's title steps down.

## 6. Prove it, then look, then watch

```bash
node tools/check.js  <page>      # usable, both sizes
node tools/slop.js   <page>      # not AI-made; add --desktop
node tools/motion.js <page>      # moves well; give the page a motion tour
```

Then open the screenshots and the filmstrips, then record a run-through
(Playwright `recordVideo`, then `ffmpeg` to mp4 or gif) and watch it all the
way through. Then put the before and after side by side, at both sizes,
and cut the story as a reel (`node tools/reel.js <script.json>`, the
`redesign-eye` skill, section 5).

## 7. Then put it beside her

The audits measure AI tells, usability and motion. None of them measures
likeness. Put the screen beside the recreation of her nearest screen on the
same ground (`app-style/screens/`), at the same size, and compare four
things: the ground colour, the title's size and weight, the gaps between
blocks, and how facts are shown (numbers over labels, or sentences). The
first Chick-fil-A study scored 100 on all three audits and missed all four.
`docs/research/her-redesigns.md` has what she changes in each of her
five videos, and why, in her words.

## The traps the four tests hit

Each of these passed some check first; most are now caught by one.

- **A floating button over a control.** On a ticket, the Discussion tab
  sat under "Resolve as fixed": a tap on the tab closed the ticket. Only
  the recording showed it (check.js fails it now). Short phones need the
  layout tightened or the hero dropped.
- **Text over a busy photo.** Put the headline where the fade is solid.
- **A screenshot as a hero** reads as the app's own text. Frame it, at the
  size it was taken, over a blur of itself.
- **Two equal headings in a split view.** One leads; unslop fails a tie.
- **Re-rendering a control kills its motion.** A switch redrawn on toggle
  never slides; update the numbers around it instead.
- **`display` on a `<dialog>`** overrides "closed dialogs are not shown":
  set it on `[open]` only, or the closed sheet sits over the page.
- **A library's defaults.** auto-animate animated height and eased rows in;
  give it your own keyframes.
- **GSAP `from()` beside a CSS transition** on the same property read its
  end value mid-transition: the thumbnails stayed at 60% for good.
  Use `fromTo()`.
- **Scroll-snap ignores padding** unless told `scroll-padding`.
- **Escaping twice** turns "client's" into "client&#039;s".
- **A red that means "late" is a second hue.** Say it in weight.
- **A rule that drifted from her frames.** "A warm off-white page", "36-48pt
  for a title" and a 20pt bold section head were all in the skill or the
  system, and none was hers: her light page is `#f8f8f5`, her titles 29pt
  at 400, her section heads 22pt at 400. Check a rule against the
  recreations before building on it.
- **Website habits in an app.** Sections 40pt apart and a photo across the
  top of a light screen come from the kit's sites. Her light screen keeps
  blocks 16pt apart and the food inside the cards.
- **A picture where she draws an icon.** Categories in photo circles are
  the very thing she replaced in Uber Eats. If the icon is missing, draw it
  in `make-icons.py`.
