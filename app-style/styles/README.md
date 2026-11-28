# Styles

The parts in `app-style.css` draw her look by default. A style is one small
file that gives the same parts, and the same markup, another look.

| Style | File | For |
|---|---|---|
| hers (default) | none: `app-style.css` alone | a brand people browse: large regular-weight type, two-tone headings, capsules, glass over photos |
| plain | `plain.css` | an app people work in: semibold one-tone headings, 12pt corners, solid surfaces, hairline cards |

`index.html` here is the proof: one screen, the second copy made by cloning
the first and adding one class.

## Using one

```html
<link rel="stylesheet" href="app-style.css">
<link rel="stylesheet" href="styles/plain.css">
<div class="ui ui-light style-plain"> ... </div>
```

## Adding one

1. Copy `plain.css` to `styles/<name>.css` and scope it to `.ui.style-<name>`.
2. Change only the values listed in `app-style.css` under "the look, as
   values a style can swap", plus the card and tile corners. Reach for a rule
   override only where no value covers it, and say why next to it.
3. Leave the grounds, the spacing, the touch sizes, the motion and the
   markup alone. Those belong to `tokens/tokens.css` and to the screen. A
   style that needs different markup is a different design, not a style.
4. Add it to the sampler (`index.html`), then run the checks on it:

```bash
node tools/check.js app-style/styles
node tools/slop.js app-style/styles/index.html
```

Every style has to pass the same contrast, tap-size and unslop checks as hers.
