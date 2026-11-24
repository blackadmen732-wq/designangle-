# The motion spec

Twenty rules for interface animation, with the seven that a machine can check
marked and wired into `tools/audit.js --motion`.

**Where these came from.** They are one practitioner's demonstrated
recommendations, relayed through a review of reference videos. They are not a
standard, and nobody has published them as one. That matters, so each rule
below says whether anything independent backs it. Where a published design
system agrees, it is cited; where nothing does, the rule says so and stays a
default you may override.

Three of them conflict with values already measured out of shipped systems.
Those conflicts are resolved here rather than left for someone to trip over.

---

## The seven the audit checks

| # | Rule | How it is checked |
|---|---|---|
| 1 | Entrances ease out | `transition-timing-function` / `animation-timing-function` on an entering element must decelerate: the bezier's second control point y ≥ 0.9 |
| 2 | Dropdowns and popovers: 150–250ms | duration read from computed style |
| 3 | List stagger: ~30ms per row | `animation-delay` difference between siblings |
| 4 | Button press: scale to 0.97 | `:active` transform |
| 5 | Exits are ~20% shorter than entrances | both durations present on the same element |
| 6 | No bounce on everyday controls | bezier y > 1.0 (overshoot) on a button, tab or input is a fault |
| 7 | `prefers-reduced-motion` is honoured | the media query exists and disables motion |

```bash
node tools/audit.js <page> --motion
```

---

## 1. Entrances ease out ✅ checked

A thing arriving should start fast and settle. Accelerating into place reads
as the element being pushed rather than landing.

**Independently backed.** Uber Base Web ships `easeDecelerate:
cubic-bezier(0.22, 1, 0.36, 1)` with the comment *"commonly used for entering
elements"*. Material 3 ships `easing-standard-decelerate: cubic-bezier(0, 0,
0, 1)` for the same purpose. Two systems, same instruction.

## 2. Dropdowns: 150–250ms ✅ checked

**Backed, and it narrows an existing rule.** Material's `short3` is 150ms and
`short4` is 200ms; Uber has `timing150`, `timing200` and `timing250`. The band
is real.

Note this sits *above* the 200ms interface-feedback ceiling in
`.claude/skills/design/SKILL.md`. Both are right: a dropdown is not a button
press. 200ms is the ceiling for a control answering you; a panel opening may
take to 250ms because it is travelling further.

## 3. List stagger: 30ms per row ✅ checked

**Nothing published backs the exact number**, and it is the rule most likely
to be wrong at scale. 30ms × 20 rows is 600ms before the last row appears,
which is longer than most people will wait to see a list.

Treat 30ms as correct for **up to about eight rows** and cap the total:

```css
animation-delay: min(calc(var(--i) * 30ms), 240ms);
```

The kit currently uses 55ms in `template/site.css`, which is nearly double.
That is defensible on a marketing page, where the stagger is the effect. On a
dense list it is too slow. This is the clearest case of a web rule and a phone
rule genuinely differing.

## 4. Button press: scale to 0.97 ✅ checked

**Already what this kit does.** `template/site.css` has
`.btn:active { transform: scale(.97) }` and the dark pattern page uses `.97`
and `.94`. Independent arrival at the same number is worth something.

## 5. Exits are ~20% shorter than entrances ✅ checked

**Backed by structure if not by number.** Both Material and Uber ship separate
accelerate and decelerate curves rather than one reversed curve, which is the
same claim: entering and exiting are not mirror images. Nobody waits to watch
a thing leave.

## 6. No bounce on everyday controls ✅ checked

Overshoot on a button you press forty times a day is a cost, not a delight.
This is the skill's existing *"never animate frequent actions"* rule with a
sharper edge, and it is checkable: a bezier whose second y is above 1.0
overshoots.

The kit has exactly one spring, `back.out(1.6)` on the locate button, which is
pressed once per visit. That is the correct place for the only bounce.

## 7. Reduced motion ✅ checked

Not negotiable, and not from these rules — it is WCAG 2.3.3 and a system
setting people turn on because motion makes them ill. The page must still be
complete and readable with motion off.

---

## The thirteen that need a person

Checkable means measurable, not important. These are the harder half.

**8. Switch knobs stretch ~12% while moving.** Squash and stretch, borrowed
from character animation. Nothing published backs 12%; it is a feel number.

**9. Detail reveals stagger as elements settle.** The stagger should follow
the layout's reading order, which a machine cannot infer.

**10. Objects follow curved paths.** Straight-line movement reads mechanical.
Real motion arcs. Needs `offset-path` or a two-axis animation with different
easing per axis.

**11. Success feedback is a brief pulse.** Brief being the operative word.

**12. Position changes ease in and out.** Something already on screen moving
to a new place is not an entrance, so it should not use the entrance curve.
Material's `easing-standard` and Uber's `easeAccelerateDecelerate` are both
for exactly this.

**13. Popovers start at 95% scale.** Not 0, not 80%. A small scale-up reads as
the thing coming forward; a large one reads as it being thrown at you.

**14. Open from the trigger, 15. close back toward it.** A menu that appears
centred has no relationship to the button that opened it. This is the
cheapest version of shared-element continuity and it is worth more than most
of the expensive versions.

**16. Dragging tracks the pointer with no easing.** Any lag between finger and
object breaks the illusion that you are holding it. The one place where
animation is wrong.

**17. Overlap outgoing and incoming states.** A gap where neither is shown
reads as a stall.

**18. Reveal with masks, not by moving containers.** Moving a container moves
everything in it. A mask reveals content in place.

**19. Crossfade icon transitions with a slight blur.** Hard-swapping two
glyphs reads as a bug.

**20. Overscroll rubber-bands.** Resistance at the end of a list tells you it
is the end. A hard stop tells you nothing.

---

## Where these conflict with what this kit already measured

Three disagreements, each resolved toward the measured value:

| Conflict | Resolution |
|---|---|
| 200ms interface ceiling vs 150–250ms dropdowns | Both. 200ms for a control answering a press; up to 250ms for a panel travelling. Different events. |
| 30ms stagger vs this kit's 55ms | Platform split. 55ms stays on marketing pages where the stagger is the effect; 30ms with a 240ms cap on dense lists. |
| "Entrances ease out" vs the kit's single `cubic-bezier(.65, 0, .2, 1)` | The rule is right and the kit is wrong. One ease-in-out is currently doing entering, moving and exiting. Changing it alters how two live sites feel, so it is recorded as a decision, not taken. See `docs/research/motion-values-from-shipped-systems.md`. |

---

## What this spec deliberately does not do

It does not reconstruct reference animations. Measuring a recorded animation
frame by frame and rebuilding its curve mathematically is a real capability
and this kit does not have it.

It also should not build it. `NiazMorshed2007/reanimate` is MIT and does
exactly that, and it is a Claude Code skill, so it plugs into this setup
directly. Reimplementing it would cost weeks and lose every upstream fix.

Adopt, do not rebuild. The same goes for `howseen-ai/claude-motion-design`
(MIT) for rendering motion from code. Both are recorded in
`docs/research/design-system-licences.md` once adopted — not before.
