# Design rules learned from failures

Every failure a review finds goes through four steps:

1. **Classify it:** layout, type, identity, colour, motion or usability.
2. **Find the root cause:** a missing rule, a weak part, or a wrong decision
   (a decision `tools/decide.js` makes, or one the model made).
3. **Fix it where it belongs:** a decision goes into `tools/decide.js`; a
   part into `app-style/desktop/dark-glass.css`; only judgment that code
   cannot make becomes a written rule here.
4. **Keep it only if `node tools/regress.js` passes.** Then add the row,
   with the next version number.

At most 40 rules stand at once. Before adding the 41st, merge or retire
one. A rule that code now enforces moves to "Enforced by code" in one line.

| v | Class | Failure | Root cause | Fix | Where |
|---|---|---|---|---|---|
| 1 | layout | Button far from the number; a row of three stat cards | Wrong decision by the model | Pattern and order decided by code; `.facts` strip | decide.js, `.figure`, `.facts` |
| 2 | identity | Flower shop looked like the invoicing app recoloured | Missing parts | Brand colour, own photo, world icons; ranked layout candidates differ in structure | `--accent`, `.scene`, decide.js |
| 3 | colour | Terracotta brand next to amber "late" | Rule written but not followed | Status tones move by code when the brand is near them | decide.js (`--late`, `--good`) |
| 4 | usability | Last row cut in half at 900 tall | Weak part | Stage scrolls; six rows, or `.ledger.dense` and "View all" | `.stage`, decide.js |
| 5 | type | Two-word brand name wrapped in the top bar | Weak part | `.brand-word` never wraps | `.brand-word` |
| 6 | usability | Words over a photo under 4.5:1 | Weak part | Words over `.scene` get brighter with a shadow | `.stage:has(> .scene)` |

## Enforced by code

- Desktop screens are checked at 1280 and 1440 only (`<meta name="platform" content="desktop">`).
- Status is a dot and a word, never a pill.
