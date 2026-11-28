# Interaction recipes

Small, isolated mechanisms for how things move when people act. They carry
no look: any product's colour, type and imagery go on top. Try them all on
one page: `app-style/recipes/index.html` (Calm and Lively switch).

| Recipe | Page | Code |
|---|---|---|
| Product opens into its detail, and returns | `product-expand` | `Interact.expand` on native View Transitions |
| Menu opens from its trigger | `dropdown` | `Interact.dropdown` on the native popover, placed by Floating UI |
| Bottom sheet, flick or drag to dismiss | `bottom-sheet` | `AppMotion.sheet` |
| Modal | `modal` | `Interact.modal` on the native `<dialog>` |
| Steps forward and back | `steps` | `Interact.steps` |
| Add to cart | `add-to-cart` | `AppMotion.flyTo` |
| Remove with undo | `remove-undo` | `Interact.removeWithUndo` on AutoAnimate |
| Filter and sort reflow | `filter-reflow` | `Interact.reflow` on AutoAnimate |
| Loading, success, error, empty | `states` | `Interact.state` |

**Personality.** One mechanism, two characters, set with
`Interact.personality('calm' | 'lively')`, `?motion=lively` or `#lively`. Calm is a
little slower, travels less and never overshoots; lively is quicker,
travels further and settles with a slight spring. The more often an action
happens, the calmer it should be. Timings are the tokens in
`tokens/tokens.css` (`--t-dropdown`, `--t-modal`, `--t-page`,
`--t-expand`...).

**Tests.** `node tools/recipes-test.js` checks each recipe on its own: it
answers within 100ms, survives repeated presses with nothing left half-way,
works from the keyboard with focus where expected, keeps still under
reduced motion, and keeps frames smooth. `--video` records them all, calm
and lively, into `.check/recipes/`. These checks catch breakage only.
Whether a recipe feels right is judged by trying it.

**Reuse first.** The browser and two small MIT libraries do the heavy work;
`interactions.js` only joins them up and adds the personality. Pages that
use the dropdown or lists load, before it:

    <script src="../../vendor/floating-ui.core.umd.min.js"></script>
    <script src="../../vendor/floating-ui.dom.umd.min.js"></script>
    <script src="../../vendor/auto-animate.js"></script>

What was checked, what was used and what was left, with licences:
`docs/research/reuse-inventory.md`.
