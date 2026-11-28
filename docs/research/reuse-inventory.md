# Reuse inventory: what Design Angel uses instead of building

November 2026. The owner's rule: reuse first, integrate second, write code
only when nothing suitable exists. This repo is plain HTML, CSS and
JavaScript with no build step, so a library is used only if it runs as a
plain script. React libraries are listed as the choice for React projects,
not as dependencies of this repo. Every licence below was read from the
package itself or the project's own licence page.

The order of preference for each job:
1. a native browser feature;
2. a small, maintained, MIT or Apache library that runs without a framework;
3. code of our own, only where 1 and 2 have nothing.

## What each interaction is built on now

| Job | Uses | Our code left | Why |
|---|---|---|---|
| Product opens into its detail and back | Native View Transitions | names the two images, restores focus and scroll | Supported in Chrome, Safari 18 and Firefox 144 and later. The old FLIP fallback was removed; a browser without it changes at once. |
| Dropdown | Native `popover` (top layer, Escape, click outside) and **Floating UI** (placement, flip at the edge) | arrow keys, focus, the personality | Native popover has no placement fallback in every browser yet; Floating UI is the standard for it. Our click-outside and Escape code was removed. |
| Modal | Native `<dialog>` | the open and close motion | `<dialog>` already gives focus trapping, Escape and the backdrop. |
| Remove with undo | **AutoAnimate** | the toast with Undo, focus | Our hand-written FLIP for the rows was removed. |
| Filter and sort | **AutoAnimate** | none | Our FLIP was removed. The page now adds and removes items, which AutoAnimate watches. |
| Bottom sheet, drag or flick to dismiss | **pure-web-bottom-sheet** on native `<dialog>` | one CSS line for reduced motion | **Corrected.** The first version of this list said no framework-free draggable sheet existed. That was wrong; the owner found several (below). This one moves the sheet with the browser's own scrolling, so it follows the finger with native momentum, has snap points (half and full height) and drags from anywhere on the sheet. Ours only dragged from a 24px grip, had no snap points, and with real touch it never closed: the browser took the drag as a page scroll. That bug is fixed in `AppMotion.sheet` for the examples still using it. |
| Steps forward and back | Web Animations API | about 15 lines | Swup is for moving between pages, not steps inside one page. |
| Add to cart | Web Animations API | `AppMotion.flyTo` | CartFlow was checked and is weaker; see below. |
| Loading, success, error, empty | `aria-busy` and a live region | about 6 lines | TanStack Query fetches data; it does not show the states. |
| Toast | our `AppMotion.toast` | kept | Checked against ToastKit, Toastify and Notyf (below). None beats it for one Undo toast enough to add a dependency. ToastKit is the one to use if a project needs stacked toasts. |

Tests: `node tools/recipes-test.js` now runs every recipe in Chromium,
Firefox and WebKit, at desktop size and at phone size with touch, and
fails on: no answer within 100ms, a second press in the middle of the
motion not winning, a press that cannot land, keyboard, reduced motion, a
frame over 50ms, or any script error. The sheet also gets real finger
drags in Chromium. The stricter test found four real bugs, now fixed: Undo
pressed during the row's exit lost the row; a filter changed twice quickly
lost items; Escape did nothing while the product was still opening; a slow
load could overwrite a newer state. Firefox and WebKit cannot be installed
in the environment these were built in, so they run in GitHub's free check
(`.github/workflows/recipes.yml`) on every change. **Firefox and WebKit are
unverified:** GitHub will not start the check while the owner's account is
locked over billing ("The job was not started because your account is
locked due to a billing issue", 28 November 2026). Only Chromium has
passed so far. Checked by hand as well: the dropdown
flips above its button near the bottom of the screen, and the list
animations run on transform and opacity only.

The tickets and front-desk examples were already on AutoAnimate; the
update to 0.11.0 left the tickets motion audit at 100/100 and
`tools/regress.js` found no screen worse.

## Libraries checked

| Library | Licence | Plain HTML? | Size (gzip) | Decision |
|---|---|---|---|---|
| Floating UI (`@floating-ui/dom` 1.8.0) | MIT | yes | about 9 KB with core | **Used** for menus, tooltips and popovers. |
| AutoAnimate 0.11.0 | MIT | yes, wrapped as a classic script | about 4 KB | **Used** for lists. Already in the repo at 0.10.2; updated. |
| Motion 14.14.0 | MIT | yes, but the full script is about 65 KB | 65 KB | **Left for now.** Its one clear win over the browser is a spring that keeps the finger's speed when a sheet is let go. Use it in a project that needs that; for React projects it is the first choice for layout animation. |
| GSAP 3.15.1 | GSAP Standard "no charge" licence, not open source | yes | | **Not bundled.** The licence bars its use in tools that let people build animations without code in competition with Webflow. Design Angel is a design tool, so bundling it is a risk. A finished website built with Design Angel may use GSAP itself. |
| Swup 4.10.0 | MIT | yes | about 8 KB | **Not needed here.** For multi-page sites, native cross-document view transitions (`@view-transition { navigation: auto }`) do the same job in Chrome and Safari; Swup is the choice where every browser must animate page changes. |
| CartFlow 3.0.1 | MIT | yes | about 1.4 KB | **Rejected.** It queues every press (six quick taps take six seconds), animates `top`, `left`, `width` and `height` instead of transform, ignores reduced motion and leaves a 70% opaque copy on screen. Our `flyTo` already does better on each. 5 stars, last change April 2025. |
| Web Awesome 3.15.0 | MIT | yes, web components | needs Lit | **Option, not a dependency.** A full component set; good for a project that wants ready-made controls. Too heavy to add for one dropdown. |
| Base UI, Radix, React Aria, shadcn/ui, Magic UI, Motion Primitives, Sonner | MIT (Apache for React Aria) | React only | | **For React projects.** Base UI or Radix for drawers, menus and dialogs; Sonner for toasts; shadcn/ui for blocks. |
| TanStack Query | MIT | core runs without React | | **For apps that fetch data.** It handles caching and retries; it does not draw states. |

### Sheets and toasts, checked after the owner's correction

| Library | Licence | Activity, stars | Size (gzip) | Decision |
|---|---|---|---|---|
| pure-web-bottom-sheet 1.1.1 | MIT | active (Nov 2026), 233 | about 4.3 KB, no dependencies | **Used** for the bottom sheet. Tested by its author on Chrome, Safari and Firefox, desktop and phone. Its only gap here: it slides in under reduced motion; one CSS line in the recipe stops that. |
| @plainsheet/core 1.0.1 | MIT | Mar 2026, 70 | about 7.7 KB | Left: larger, JavaScript-driven drag, no reduced-motion handling found. |
| timelessco/js-bottomsheet | MIT on GitHub, no licence field on npm | Apr 2025, 42 | | Left: unclear licence on npm and quiet for a year and a half. |
| @magic-spells/sheet 0.2.0 | MIT | Sep 2026, 3 | about 23 KB plus three engines of its own | Left: spring physics and velocity like ours, at five times the size. |
| ToastKit (`@mrcs/toastkit` 0.2.0) | MIT | Sep 2026, 0 | about 4.7 KB with CSS | **Option.** Undo actions, stacking, swipe to dismiss, pauses on hover and focus, `role="status"` and reduced motion. But it is new (no users yet), animates with keyframes that ease in on exit, and ships its own look. Not worth a dependency for one Undo toast. |
| Toastify 1.12.0 | MIT | last release Jul 2022 | about 4 KB | Left: unmaintained, no action button, no reduced motion. |
| Notyf 3.10.0 | MIT | last release Jun 2022 | about 3.7 KB | Left: unmaintained, no action button, no reduced motion. |

## Agent skills checked

None of these is copied into the repo, so they add nothing to every
session's context. Install the one a project needs.

| Skill | Licence | What it is good for | Decision |
|---|---|---|---|
| GoogleChrome/modern-web-guidance | Apache-2.0 | Native web features with browser support data: same-document and cross-document view transitions (product thumbnail to hero), dialog, popover, animating in and out of the top layer, anchor positioning. | **Recommended first.** It matches the native-first rule. `npx modern-web-guidance@latest install` |
| emilkowalski/skills | MIT | Interface motion and design engineering. | **Already in.** `animate` and `review-animations` were adapted into `.claude/skills/` earlier, with his licence. The rest: `npx skills add emilkowalski/skills` |
| pbakaus/impeccable | Apache-2.0 | Design vocabulary for agents: polish, bolder, critique, audit, catching AI-looking design. | **Optional, for review.** Use it to critique a finished screen, not to set its look. |
| nextlevelbuilder/ui-ux-pro-max-skill | MIT | 80 UI styles, 194 palettes, 74 font pairings with a reasoning step. | **Optional, with care.** Our benchmarks found that styles handed to the model made screens worse than the model's own judgment, so this is for ideas, not a default. |
| Motion's agent skill (`npx motion-ai`) | MIT | How to use Motion. | **Only with Motion.** Install it in a project that uses Motion. |

## What stays ours, and why

- `interactions.js`: about 230 lines that join the native features and the
  two libraries, give every recipe the same calm or lively timing, and put
  focus where people expect it.
- `AppMotion.sheet`: kept only for the four examples built on it (now
  fixed for touch). New work uses pure-web-bottom-sheet.
- `AppMotion.flyTo` and `AppMotion.toast`: the checked alternatives are
  worse (CartFlow, Toastify, Notyf), need React (Sonner), or are too new
  to depend on (ToastKit).
- `tools/recipes-test.js`, `tools/motion.js`, `tools/check.js`: the tests.
  No library checks repeated presses, keyboard and reduced motion together
  on a plain page.
