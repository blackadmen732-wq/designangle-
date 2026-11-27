# Motion: what was found, what was kept

November 2026. Searched for anything an agent could use to make app screens
move well: skills, rules, libraries. Everything below is public and MIT
licensed, and was read from its source (cloned from GitHub, or the npm
package), not from a summary. Tags: **KEPT** went into `app-style.css`, the
app-style skill or `tools/motion.js`; **CHECKED** is measured by
`tools/motion.js`; **LEFT** was read and not used, with the reason.

## Sources

| Source | What it is |
|---|---|
| github.com/emilkowalski/skills | Emil Kowalski's agent skills: animate, review-animations (with STANDARDS.md), improve-animations, animation-performance, apple-design, choreograph, gestures. The most useful by far. |
| github.com/ibelick/ui-skills | Interface skills; fixing-motion-performance is a rule list by rendering cost. |
| github.com/vercel-labs/web-interface-guidelines | Vercel's interface rules for agents (AGENTS.md); one short Animation section. |
| github.com/lottiefiles/motion-design-skill | A motion-design skill aimed at Lottie and explainer animation: choreography, Disney principles, emotion. |
| github.com/Owl-Listener/designer-skills | Broad designer skills, including animation-principles and a motion-system skill. |
| npm @formkit/auto-animate 0.10.2 | FLIP animation for lists whose children come, go and move. Vendored as `app-style/vendor/auto-animate.js`. |

## Rules

- **KEPT, CHECKED. Only transform and opacity.** Width, height, top, left,
  margin and padding make the browser lay the page out again every frame.
  All four rule sets agree. View-transition pseudo-elements are exempt (the
  browser animates their size itself).
- **KEPT, CHECKED. Never ease-in on interface motion.** It starts slowly, so
  the moment being watched arrives late. Ease-out for entering and leaving;
  a stronger curve than the CSS keyword: `cubic-bezier(.23, 1, .32, 1)`
  (Kowalski). Kept as `--ease-out`.
- **KEPT, CHECKED. Under 300ms.** Kowalski: interface animation under 300ms,
  sheets and drawers up to 500. The audit measures when the motion is 95%
  done rather than the declared duration, so a spring with a long, invisible
  tail is judged by what the eye sees: `--spring` lasts 450ms and is done to
  the eye at 230.
- **KEPT. Springs, in Apple's two numbers.** Damping 1 and response .3 for
  things that move; .8 and .3 for sheets ("Designing Fluid Interfaces", via
  Kowalski's apple-design skill). CSS cannot run a spring, so
  `app-style/tools/spring.js` samples one into a `linear()` curve.
- **KEPT. Should it animate at all?** By how often it happens: hundreds of
  times a day never, tens of times barely, occasionally a standard move,
  rarely the only place for delight (Kowalski). The tickets example's tabs
  change instantly for this reason.
- **KEPT, CHECKED. Never from scale(0).** Start at .95 to .98, with opacity.
- **KEPT, CHECKED. Reduced motion means fewer and gentler, not none.** Fades
  stay, movement goes (Kowalski, Apple). The old app-style rule turned every
  transition off; it now keeps opacity and colour.
- **KEPT, CHECKED. Hover motion only for a mouse.** `@media (hover: hover)
  and (pointer: fine)`, because a tap fires hover on a phone.
- **KEPT, CHECKED. No `transition: all`** (Vercel): name the properties.
- **KEPT. View transitions are for moving between screens**
  (ibelick): the page ignores input while one runs, so not for filters. The
  tickets example uses one to open a ticket, and auto-animate for filters.
- **KEPT. Interruptible:** CSS transitions, not keyframes, for anything that
  can be pressed twice quickly (toasts, toggles), because a transition
  retargets from where it is (Kowalski).
- **KEPT. A flick is enough** to throw a sheet away: dismiss above about
  0.11px per millisecond, not only past a distance (Kowalski's gestures).
- **CHECKED. Presses answer within 100ms**; the audit warns above 100 and
  fails above 300 (Apple: respond on touch-down).
- **KEPT, as skills.** `animate` and `review-animations` are in
  `.claude/skills/`, from commit 64eb3de with his MIT licence, adapted: the
  greeting removed, and a section pointing at this repo's tokens, parts and
  `tools/motion.js`. His other skills are not copied; the rest can be
  installed with `npx skills add emilkowalski/skills`.
- **LEFT. LottieFiles' skill:** it is for authored animation (Lottie files,
  explainers, Disney principles), not interface motion.
- **LEFT. A motion library (Motion, GSAP) for the app style.** CSS, the Web
  Animations API and view transitions covered everything the tickets example
  needed; the rule is the cheapest tool that works.

## What the audit found in a library

auto-animate, with its defaults, failed the audit twice on its first use:
it animates `height` (on the list and every row whose size changes), and it
eases new rows in (`ease-in`, at 1.5 times the duration). Its plugin hook
accepts keyframes instead, so the tickets example passes it
`transform`/`opacity` keyframes on the house curve. A plugin also bypasses
its own reduced-motion check, so the example checks that itself.

## What the audit cannot see

Choreography. The first version of the ticket transition passed every rule
and still looked wrong frame by frame: the travelling title ran through the
new screen's text. The fix (the new screen arrives 110ms behind) came from
the filmstrips, not a number. And a recording caught a tab hidden under a
floating button, which no audit had flagged; `tools/check.js` now does.
