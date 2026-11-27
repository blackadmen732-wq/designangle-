---
name: redesign-eye
description: See a screen the way the reference designer (uidesignmahsa) does, change it one move at a time with one reason each in the user's own words, and show it as a before-and-after story with her camera and timing. Use before redesigning or critiquing any app screen, when writing a redesign's brief or narration, when presenting a redesign (a before-and-after, a reel, a walkthrough), when watching a new redesign video to learn from it, or when asked to think, design or present "like her" or "her way".
---

# The redesign eye

Six redesigns by uidesignmahsa, read word by word and frame by frame:
Google Maps, Airbnb, Uber Eats, Starbucks, Netflix and Gmail
(`docs/research/her-redesigns.md`). This skill is how she thinks. The
`app-style` skill is how it looks, `app-redesign` is the order of work in
this repo, and `tools/watch.py` reads her next video the same way.

## 1. Look at it as the person using it

Open the screen and ask these, in order. Each one is a change she made.

1. **What did they come here for, and is it the biggest thing?** The star
   balance was a small line (Starbucks); the trailer a small box (Netflix).
2. **What sits in the way of it?** Promotions between the real emails
   (Gmail); "Saved to Menlo Park" under the title (Airbnb).
3. **Does every row look the same?** Can you tell what each one is before
   you open it? A photo shown as a file name; a delivery date as a line of
   small text (Gmail).
4. **Can you choose without opening each one?** Rating, reviews and time on
   the card (Uber Eats); what is free and what you pay (Maps).
5. **Is a fact written as a sentence, or hidden behind a tap,** when it
   could be a number in plain sight? How far to the next reward
   (Starbucks); a 4.93 with its badge and reviews (Airbnb).
6. **Are the controls big enough, and is the main one under the thumb?**
   Bigger pill tabs (Maps); Directions, Check availability, Play, Search at
   the bottom (every video).
7. **How much of the screen is chrome, not content?** The tab bar took the
   whole strip (Gmail); the title and trailer took half the page (Netflix).
8. **What makes noise?** Pictures for categories (Uber Eats), a star on
   every row, logos of every colour (Gmail).

Write the answers as pains, in the words of someone who uses it, the way she
says them on screen: "Promotions sit right between your real emails." Not
"the information architecture lacks prioritisation."

## 2. Change one thing at a time, with one reason

Every change is one sentence in two halves: **what changed, then what you
get,** with "you" in the second half.

- "The tabs became bigger pills that are easy to tap."
- "Featured restaurants show rating, reviews and delivery time right on the
  card: you can choose without opening each one."
- "Promotions move out of the list into their own stacked card. They never
  push your real mail down, and you still see how many are new."
- "The tab bar becomes a small floating glass pill: it takes less space,
  you see more emails every time you open it."

If the second half will not come, the change is decoration: drop it. Her
benefits are always one of a few: you see it at once ("in one look", "at a
glance", "right away"), you do it in one tap, you choose without opening,
it is under your thumb, you see more of what matters. No design words:
never "hierarchy", "affordance", "whitespace", "visual noise", "clean" on
its own.

Work from the top of the screen down and save the main action for last; it
is the payoff ("always under your thumb"). Four to seven changes. One
screen, not the app.

## 3. Her moves

What the changes turn into, every time (the research doc has all eighteen,
with the video each came from):

- The thing they came for is the headline, in regular weight, two tones.
- Dark screens open with the photo edge to edge; light screens stay white,
  with the photos inside cards (Uber Eats) or flat white panels on a cool
  grey for a long list (Gmail).
- Facts as numbers over small labels, side by side, in one card.
- One card per thing; a row you swipe when there are several.
- Noise out of the way: low-value items into one stacked card with a count.
- Group by what people scan for (by time: "This evening", "Afternoon").
- Show what it is before it is opened: a badge on the avatar for the kind,
  a thumbnail with a count, a date tile.
- Icons for categories, never pictures; chips, never a line of text.
- One bar becomes circle, pill, circle; the main action is a pill with
  circles of the same height, at the bottom.
- Chrome shrinks and floats so the content runs under it.
- Calm what repeats: letters for logos, no star on every row, read grey,
  unread in ink with a dot.

The numbers for each are in the `app-style` skill and `app-style.css`;
her Gmail moves are parts there (`.list-panel`, `.group-label`, `.mono`
with `.mono-kind`, `.thumb-n`, `.tile-date`, `.stacked`, `.pill-bar`), and
`app-style/screens/` holds a measured rebuild of each of her screens.

## 4. Motion, the way she uses it

**In the app,** motion always has a job: the page slides over the trailer
and blurs it (Netflix); the chrome floats so the content shows through; the
photo opens the page. Build these with the `animate` skill and the tokens
in `app-style.css`: a blurred page behind every sheet is already there.

**In the video** (measured, Gmail): the camera holds the whole screen while
she names it, then moves in on each part as she talks about it, to 1.2
times, in 600ms on an S-curve (slow, fast, slow), and holds 3.5 to 6
seconds. A thin selection box and the cursor mark the part first. The
change dissolves in place in 250 to 300ms: the old fades as the new appears
where it was; nothing slides. Words come one at a time in a white pill
beside the phone, never over the part that changes, 3 to 4 a second. A
countdown sits top right.

## 5. Tell it the way she does

Every video is the same six beats, 36 to 58 seconds:

1. **Hook (0 to 3s):** "redesigning" over the app's name and icon. An app
   everyone has an opinion about.
2. **Problem (3 to 10s):** "This is it right now," and one or two pains,
   the camera on each.
3. **Promise:** "Let's fix it, step by step."
4. **Changes:** one every 4 to 6 seconds, top down, main action last, each
   in the two-half sentence.
5. **Payoff:** "Before": the old screen whole. "And after": the new whole.
   A reaction for a laugh.
6. **Ask:** "Which app next?" The comments choose the next one: a series.

In this repo: the brief at the top of a redesigned page is written as these
beats (problem, changes as two-half sentences, main action last); the
before-and-after sheet shows the old screen whole and the new whole; a
walkthrough to a client follows the same order and the same timing.

The reel itself is `node tools/reel.js <script.json>`: a script names the
old and new screens (a page, a URL, or `git:<rev>:<path>` for the page as
it was) and the beats, one sentence each, with the part each one is about.
It photographs the screens, moves the camera her way, marks the part,
dissolves the change in place, sets the words one at a time and writes a
1080 x 1920 video and a contact sheet to `.check/reel/`. The Chick-fil-A
study's `reel.json` is the example. Measured with `watch.py`, its camera
matches hers: 1.2 times, half-second S-curves, a 300ms dissolve. It uses
our title card, mark and captions, not hers, and has no voice: the words
are on screen, as most people watch.

## 6. Watching her next video

```bash
python3 -m venv .venv-watch && .venv-watch/bin/pip install rapidocr-onnxruntime numpy pillow
.venv-watch/bin/python -I tools/watch.py all video.mp4
```

It writes her words, a storyboard (each sentence beside three frames) and
the camera's moves to `.refs/<video>/`, which git ignores. Read the
transcript once by eye and clean it; then add the video to the research doc
in the same form (time, her words, what changes on screen), and any new move
to section 3 here.

## 7. Take the method, not the person

Her face, her handle, her title card and her captions as a whole are her
identity: our work never wears them. The apps she redesigns belong to their
owners; a study of one says it is unofficial. Take the eye, the grammar,
the moves and the timing.
