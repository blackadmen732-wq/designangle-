# Interaction recipes

Small, isolated mechanisms for how things move when people act. They carry
no look: any product's colour, type and imagery go on top. Try them all on
one page: `app-style/recipes/index.html` (Calm and Lively switch).

| Recipe | Page | Code |
|---|---|---|
| Product opens into its detail, and returns | `product-expand` | `Interact.expand` (View Transitions where supported, else FLIP) |
| Menu opens from its trigger | `dropdown` | `Interact.dropdown` |
| Bottom sheet, flick or drag to dismiss | `bottom-sheet` | `AppMotion.sheet` |
| Modal | `modal` | `Interact.modal` |
| Steps forward and back | `steps` | `Interact.steps` |
| Add to cart | `add-to-cart` | `AppMotion.flyTo` |
| Remove with undo | `remove-undo` | `Interact.removeWithUndo` |
| Filter and sort reflow | `filter-reflow` | `Interact.reflow` |
| Loading, success, error, empty | `states` | `Interact.state` |

**Personality.** One mechanism, two characters, set with
`Interact.personality('calm' | 'lively')` or `?motion=lively`. Calm is a
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

**Sources.** No outside code is used. The ideas: the View Transitions API
(a web standard); the FLIP technique (first, last, invert, play); the
sheet's flick velocity and the motion values already credited in
`docs/research/motion-sources.md`.
