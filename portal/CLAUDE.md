# Portal

The owner panel (`app/index.html`), the database (`schema.sql`) and the edge
functions (`functions/`). What is deployed and what is not: `README.md`.

## The rules this code keeps

These are why an owner can trust the panel with their business. Do not weaken
one to make a feature easier, a test pass or a demo look better.

- **A phone-button tap is not a phone call.** Taps live in `mk_events`, real
  calls in `mk_calls`. Never report one as the other, and the panel says on the
  page which one it is counting. (`OFFER.md` section 1)
- **No automated text without registration and consent.** Both
  `mk_messaging_registration` and a matching `mk_message_consent` row must
  exist first. Do not add a bypass. (`OFFER.md` section 5)
- **A lead needs a name and a phone number.** The collector
  (`functions/collect`) refuses one without them, so a miswired form fails
  loudly instead of filling the owner's list with enquiries nobody can answer.
- **Distances are estimates and say so.** A straight line adjusted for roads,
  not a routed drive time. Wherever a distance or a time is shown, the words
  say it is approximate.

Only `functions/collect` is in this repo. `settings`, `service-area` and
`load-zips` are deployed, but their source is not here yet, so a change to the
distance maths cannot be reviewed or tested from this repo until it is.

## The panel

- It is one self-contained file because it is deployed as one. It copies the
  parts of `app-style/` it uses: change them there first, then here.
- Its tokens are a copy of `tokens/tokens.css` between two marker comments.
  `node tools/tokens.js --sync` rewrites the copy; `node tools/tokens.js`
  fails if it drifts.
- It needs a login, so the checks fill it with invented sample data
  (`tools/panel-sample.js`) and never touch the real database.

```bash
node tools/check.js portal/app
node tools/slop.js portal/app
node tools/motion.js portal/app
```
