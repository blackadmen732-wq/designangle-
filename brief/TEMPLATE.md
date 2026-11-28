# Design brief

Fill this in before designing anything. Copy it to `brief/<project>.md`.

AI design comes out generic mostly because it is asked to guess: who the
screen is for, what it should feel like, what it is allowed to look like.
A guessed answer is the average answer, and the average answer is the
generic look. So the rule is:

**Ask, do not guess.** If a line marked *needed* is empty, ask the person
before designing, in one message, at most five short questions, each with
a suggested answer they can accept with one word. Lines not marked needed
can be decided by the designer; say what was decided and why, in one line
each, at the top of the screen's file.

---

## 1. What it is *(needed)*
One sentence: what the product does.

## 2. Who it is for *(needed)*
Who uses it, how often, and where (at a desk for hours, on a phone in a
queue, once a month).

## 3. The screen's job *(needed)*
What this one screen is for, in one sentence. Then the one thing on it
that matters most.

## 4. Platform *(needed)*
Website, phone app, desktop app, or more than one. Window size if known.

## 5. Mood *(needed)*
Three words, and one product or film it should feel like. ("Dark, sharp,
cinematic. Like a high-end video editor.")

## 6. References
Screenshots or links of what it should look like, or what it must not
look like. **This is the most useful line on the page.** With a reference,
the screen is built to match it and scored with `tools/match.js`. Without
one, the designer picks the nearest style in `app-style/` or the websites'
layouts and says which.

## 7. Brand
Name, logo file, colours, fonts. "None yet" is a fine answer: the style
then decides, and says so.

## 8. Content
The real words, names and numbers, or "invent them and label them as
invented". Never real-looking prices, reviews or guarantees nobody gave.

## 9. Motion
None, calm, or lively. What should move: arrivals, hovers, the background,
transitions between screens. Reduced motion is always respected.

## 10. Art
Anything that is a picture rather than a shape: photos, 3D logos, light
effects, illustrations. Say whether they exist, should be drawn in code
(good for streaks, glows, gradients, simple marks), or need making in an
image tool (needed for photographs, chrome or 3D renders, textures).

## 11. Done means
How the person will judge it. ("Looks like my reference." "Passes the
checks and I like it." "Ready to hand to a developer.")
