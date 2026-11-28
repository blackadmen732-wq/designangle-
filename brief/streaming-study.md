# Brief: streaming home (private study)

An internal test of the system on a screen it was not built for: a
Netflix-style home, redesigned. **A private study: not affiliated with
Netflix, not for clients, not for a portfolio.** No Netflix name, logo,
titles or artwork: the wordmark is "REEL", the shows are invented, and the
stills are photographs already in this repo.

1. **What it is:** a streaming service's home on a desktop or TV-size
   browser window.
2. **Who it is for:** someone on the sofa or at a desk in the evening,
   deciding what to watch in under a minute.
3. **The screen's job:** get them watching. The one thing: the featured
   show, with Play.
4. **Platform:** desktop web, 1672 x 941 (the same frame as the Cinema
   screens, so the scores sit side by side).
5. **Mood:** dark, cinematic, calm. Netflix's own home is loud: a wall of
   equal posters and three competing rows of buttons. This one is quieter.
6. **References:** none. Scored on the system's own checks instead
   (`tools/slop.js --desktop`, `tools/check.js`), not on a match.
7. **Brand:** wordmark REEL; one accent, a cinema red (#e50914), spent only
   on "new" and on how far into a show you are.
8. **Content:** invented titles. Stills from `sites/meditation`,
   `sites/barber` and `sites/restaurant` (Unsplash licence, see their
   CREDITS.json where present).
9. **Motion:** calm. The featured still pushes in slowly; rows rise in on
   arrival; a card lifts, its still zooms a little and a play button
   appears on hover.
10. **Art:** photographs only. The light comes from the still, so the
    streaks stay off.
11. **Done means:** passes the checks at desktop size and reads, at a
    glance, as made by a designer rather than generated.

## What the redesign changes from the usual streaming home

- One billboard, not a carousel: one decision at the top.
- Two buttons and a circle, not four controls. "Play" is the one solid
  thing.
- "Continue watching" comes first and shows time left, not a bare bar.
- Fewer, larger cards per row, with the title under the still instead of
  baked into it.
