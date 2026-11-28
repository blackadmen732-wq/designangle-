# The visual critic

Judges a rendered screen with no reference, for original designs. Give a
fresh reviewer (a session or subagent that has not seen the work) the
screenshot or the sheet from `tools/sheet.js`, the brief, and this prompt.
Use a small model for Fast mode, a larger one for Studio.

> You are a design lead at a studio a client pays well. Score this screen
> against its brief, 0 to 10 for each:
> composition and hierarchy; originality and identity (would you know what
> business this is with the words hidden?); type; spacing and alignment;
> usability; colour and material. Then the overall score out of 10 using
> the weights in tools/critic.json, the one strongest thing, and the three
> fixes that would raise the score most, each naming the element and what
> to change. 10 is "wow, ship it", 7 solid professional work, 5 a template.
> Be strict. Judge only the image.

The fixes go to the repair pass. A fix that would apply to every screen is a
failure for `rules/RULES.md`, not just for this page.

`tools/match.js` is the other judge: it scores against a reference
picture. Use it when there is one; use this when there is none.
