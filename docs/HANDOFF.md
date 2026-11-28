# Handoff

Written 28 November 2026, at the end of a long session, so that another Claude
session can carry on without losing anything. Read this, then `CLAUDE.md`.

## The message that starts the next session

Start a new Claude Code session on this repository and paste this:

> You're picking up the Design Angle project in the GitHub repo
> blackadmen732-wq/designangle-. Everything done so far is on the branch
> claude/magical-faraday-3l1bex, and pull request #2 brings it into main.
>
> 1. If pull request #2 has been merged, work from main. If not, fetch
>    claude/magical-faraday-3l1bex and start your branch from it, so you build
>    on top of everything.
> 2. Read docs/HANDOFF.md, then CLAUDE.md, before changing anything.
> 3. Keep everything free: no GitHub Actions and no paid services. Run the
>    checks inside the session instead; they are listed in docs/HANDOFF.md.
> 4. Keep the five rules in CLAUDE.md, above all: never put a fact on a real
>    business's site that they did not give us.
> 5. Keep her app style exactly as it is.
> 6. Explain what you did to me in plain words. I'm not a developer.
>
> Then carry on with "Next, in order" in docs/HANDOFF.md, starting with
> number 1.

## Where everything is

- **Repository:** `blackadmen732-wq/designangle-` on GitHub.
- **The work:** branch `claude/magical-faraday-3l1bex`. Pull request #2 brings
  all of it into `main`:
  https://github.com/blackadmen732-wq/designangle-/pull/2
  Once it is merged, `main` has everything. Until then, work from the branch:

  ```bash
  git fetch origin claude/magical-faraday-3l1bex
  git checkout claude/magical-faraday-3l1bex
  ```

- **The showroom**, a private page where the owner looks at the work:
  https://claude.ai/artifact/1CmAJE1GPijqAr9ABLRMSE
  It holds every app redesign in a live phone, a reel, one screen in two
  styles, and six example websites. To update it, publish the same artifact
  URL again with the changed files.

## What the project is

A kit for making three things from one design system:

1. **Websites** for small businesses, and pages that are not businesses (a
   product, a portfolio). `build.js` turns `sites/<name>/content.js` into a
   site in `dist/<name>/`.
2. **Phone app screens**, in the style of the designer uidesignmahsa, measured
   from her redesign videos (`app-style/`). Her look is the default. A second,
   plain look (`app-style/styles/plain.css`) is for apps people work in.
3. **The owner panel** (`portal/`): what a business owner sees about their
   site: visitors, phone taps, enquiries.

The shared spacing, corners, touch sizes and motion live in one file,
`tokens/tokens.css`, which all three read.

## What the owner wants, in their words and in practice

- **Everything free.** No GitHub Actions, no paid services, nothing that needs
  billing. The checks run inside a Claude session or on any computer with
  Node, at no cost. (A GitHub Actions workflow was added and removed for this
  reason; GitHub refused to run it because of a billing lock on the account.)
- **Her style stays exactly as it is.** "That's the style I want. So don't try
  to change it." Change the plain style or add a new one; do not drift hers.
- **Plain words.** The owner is not a developer and often writes by voice
  ("building" meant billing). Explain results simply: what was done, what it
  means, what they need to do.
- **A link to look at.** They like opening the showroom to see work
  themselves. Keep it updated when something visible changes.
- **The Instagram plan.** Find barbershops (and other shops) without a website
  and show each one a preview of its own site. Instagram cannot be scraped (it
  needs a login and forbids it), so the owner finds the shops; a session makes
  the previews:

  ```bash
  node tools/preview.js --name "Fresh Lines Barbers" --trade barber --city "Dayton, OH"
  ```

  Trades so far: `restaurant`, `hvac`, `barber`.

## The rules that are not style

From `CLAUDE.md`. They protect money and trust; never weaken one.

1. A phone-button tap is not a phone call.
2. No automated text without registration and consent.
3. Never launch a client fact they did not give you. The example sites are
   invented and say so. `node tools/launch-check.js <site>` must pass before
   anything goes live.
4. A lead needs a name and a phone number.
5. Distances are estimates and say so.

## How to check work (all free)

```bash
node build.js                     # every site into dist/
npm test                          # section lists, kinds, tokens
node tools/check.js               # every site, the panel and the docs, at 400x860 and 1280x900
npm run check:app                 # every app page
node tools/audit.js dist/<site>/index.html --width 400   # one page in depth (also --width 1280)
node tools/slop.js <page>         # does it look AI-made? 18 points
node tools/motion.js <page>       # every animation measured
node tools/launch-check.js <site> # may this site go live?
```

Playwright with Chromium must be installed (`npm install`, then
`npx playwright install chromium` if the browser is missing). In this cloud
environment both are already there.

Last full run: every page passes `check.js`, and every website passes
`audit.js` at both widths.

## Done in the last session

- One tokens file for websites, app screens and the panel, guarded by
  `tools/tokens.js`.
- Her look made one swappable style; a plain style added
  (`app-style/styles/`), with a page showing one screen in both.
- The website builder makes non-business pages (`kind: 'product'` and others).
- `CLAUDE.md` rewritten as a short map; the business rules moved next to their
  code (`sites/CLAUDE.md`, `portal/CLAUDE.md`).
- New: Ninefold (a product page), Front desk (an app in the plain style), and
  the barbershop preview base (`tools/preview-bases/barber.js`).
- Fixed: footer names cut off on two sites; the website script crashing without
  a form; faint, small tab buttons; previews carrying an example's address,
  story and promises into a real prospect's page; the launch check missing
  example names; the audit reading a button's fading letters as its background.

## Next, in order

1. **A website for a random business.** Asked for and not built yet. Pick the
   business type at random, build it like `sites/barber/` (invented, labelled
   as invented), and check it at both sizes.
2. **The distance estimate.** Only `portal/functions/collect` is in the repo.
   The deployed `settings`, `service-area` and `load-zips` functions are not,
   so the distance maths cannot be fixed here until the owner exports them
   from Supabase. The review's recommendations:
   - a road factor that shrinks with distance;
   - minutes = 2 + 60 x miles / min(62, 33 + 0.57 x miles), which fits the
     reference data to 1.2% on average and 4% at worst;
   - near the edge of the service area, answer "probably, we'll confirm";
   - store road miles with one decimal, not as a whole number.
3. **More preview trades** (a salon, a nail bar), each as a base in
   `tools/preview-bases/` that says nothing untrue of the trade.
4. **A docs section.** `kind: 'docs'` builds, but there is no section shaped
   for documentation yet.
5. **Photo credits.** Only `sites/barber/img/CREDITS.json` records each
   photo's source; the other sites' photos need the same.
