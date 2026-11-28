# Design sources: what to take from each

An index, not a copy. Design Angel takes a few things from each system and
makes its own language from them; it does not recreate any of them. Read a
source when a task needs it, not by default. Licences checked 28 November
2026; the rules for copying anything are in
`docs/research/design-system-licences.md`.

Guideline sites (Apple, Material, Fluent, Spectrum, NN/g) are not open
licence: restate their principles in your own words, never copy their text,
images, fonts or icons. Apple's SF fonts and SF Symbols are for Apple
platforms only.

| Source | Take from it | Licence | Where |
|---|---|---|---|
| Apple Human Interface Guidelines | The main craftsmanship reference: materials that separate controls from content (glass for the control layer, not every card), depth, gestures that can be interrupted and follow the finger, semantic colour that adapts to light, dark and user settings, legibility. | Apple documentation, no reuse licence | developer.apple.com/design/human-interface-guidelines; values already read: `docs/research/apple-hig-values.md` |
| Anthropic frontend-design | Committing to one distinct direction per product and naming the looks that read as generic. | Apache-2.0 (claude-plugins-official) | `/plugin install frontend-design@claude-plugins-official`; summary in `docs/research/01-how-pros-build-animated-websites.md` |
| Google Material Design 3 | How components behave and change state; semantic colour roles; adaptive layouts across window sizes. | Code Apache-2.0 (`@material/web`); site text not copied | m3.material.io |
| Microsoft Fluent 2 | Desktop productivity: navigation, toolbars, dense but calm layouts. | Code MIT (`@fluentui/web-components` 3.2.5) | fluent2.microsoft.design |
| Adobe Spectrum | Creative-tool workspaces (panels, tool rails, properties): the closest match to CINEVORA. | Code Apache-2.0 (`@spectrum-web-components` 1.12.6) | spectrum.adobe.com |
| IBM Carbon | Productive versus expressive motion and type (already in `tokens/tokens.css`), data density, dashboards. | Apache-2.0 | carbondesignsystem.com |
| GitHub Primer | Developer tools: forms, navigation, technical density. | MIT (`@primer/css`) | primer.style |
| USWDS | Accessible forms and information-heavy public websites. | Public domain (CC0) for its own code; bundled fonts and icons keep their licences | designsystem.digital.gov |
| Nielsen Norman Group | Usability heuristics and progressive disclosure, as reasons. | Copyrighted articles; principles only | nngroup.com/articles |
| W3C WAI ARIA patterns | The correct keyboard and screen-reader behaviour of menus, dialogs, tabs. | W3C licences; restate, cite | w3.org/WAI/ARIA/apg |
| Google modern-web-guidance | Native browser features with support data. The first skill to install. | Apache-2.0 | `npx modern-web-guidance@latest install` |
| Emil Kowalski skills | Interface motion. Two are already adapted in `.claude/skills/`. | MIT | `npx skills add emilkowalski/skills` |

## Code candidates, evaluated, not installed

| Package | Licence | Decision |
|---|---|---|
| Open Props 1.7.23 | MIT | Already read for easing values (`design-system-licences.md`). Its tokens overlap `tokens/tokens.css`; no reason to add it whole. |
| Style Dictionary 5.8.0 | Apache-2.0 | Worth it only if the tokens need to go to iOS, Android or Figma. Today `tools/tokens.js` covers the one copy that exists. |
| Spectrum Web Components 1.12.6 | Apache-2.0 | The best fit if CINEVORA becomes a real web app with panels and tool rails. Heavy (Lit, many packages); bring in per project, not into the toolkit. |
| Fluent web components 3.2.5 | MIT | Same: per project, for desktop productivity apps. |
| modern-web-guidance 1.0.2 | Apache-2.0 | A skill, not code. Install it in a project; nothing to copy here. |

See `docs/research/reuse-inventory.md` for the interaction libraries in use.
