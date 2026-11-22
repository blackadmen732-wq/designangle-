# MK Admin Portal

One portal, every client, sections unlocked by plan. Upgrading reveals more of
the same dashboard; nobody is migrated to a different system.

## What is built and working

| Piece | State |
|---|---|
| `schema.sql` — database, permissions, compliance tables | **live** |
| `functions/collect/index.ts` — the endpoint websites report to | **deployed** |
| `app/index.html` — the $150 owner panel | **built** |
| Ordering, messaging, AI tiers | not built — see `../OFFER.md` |

Tables are prefixed `mk_` so the portal can share a Postgres database with
other work. To move it to a dedicated project later, `pg_dump` the `mk_` tables
and restore them there.

## How a website reaches the portal

1. `template/track.js` ships with a built site when its `content.js` has a
   `track` block. Without that block the site reports nothing.
2. It posts page views, phone-button taps, form submissions and outbound
   booking clicks to the collector. The booking form posts the enquiry itself.
3. The collector validates everything and writes to `mk_events` and `mk_leads`
   using the service role key, which lives only in the function's environment.
   **Websites never hold a database key.**
4. The owner signs in to the panel and sees only their own rows. That is
   enforced by row-level security in Postgres, not by the application.

Beacons are sent as `text/plain`, which is a CORS-safelisted content type.
With `application/json` the browser sends a preflight first and then silently
drops the beacon, losing taps on outbound links. The collector reads the body
as text and parses it, so the server does not care.

## Privacy

No cookies and no fingerprinting. A visitor is a random id regenerated daily in
session storage, so it cannot follow anyone between days or between sites. The
script does nothing if the browser asks not to be tracked. The only personal
data stored is an enquiry the person typed into the form themselves, and that
lives in `mk_leads`, apart from the anonymous counts.

## The tables

| Table | Holds |
|---|---|
| `mk_plans` | the four packages and which features each unlocks |
| `mk_accounts` | one row per client business, with plan and term date |
| `mk_account_users` | who may sign in to which account |
| `mk_sites` | the websites belonging to an account |
| `mk_events` | views, call taps, form submits, booking clicks |
| `mk_leads` | real enquiries from the website form |
| `mk_edit_requests` | change requests, marked `small` or `quoted` |
| `mk_calls` | real tracked calls. Empty until a tracking number exists |
| `mk_messaging_registration` | A2P 10DLC status per client |
| `mk_message_consent` | consent per person, per purpose |

Two of these exist to prevent a mistake rather than to store data:

- `mk_calls` is separate from `mk_events` so **taps are never reported as calls**.
  The panel labels them "call taps" and says so in plain words on the page.
- `mk_messaging_registration` and `mk_message_consent` must both be satisfied
  before any automated text is sent. See `../OFFER.md` section 5.

## Adding a client

1. **Create the account and site.**

```sql
insert into mk_accounts (business_name, slug, trade, phone, plan_id)
values ('Their Business', 'their-slug', 'hvac', '(555) 000-0000', 'care')
returning id;

insert into mk_sites (account_id, domain, is_live)
values ('<the id above>', 'theirdomain.com', true)
returning id;
```

2. **Invite the owner** from the Supabase dashboard (Authentication → Users →
   Invite), then link them:

```sql
insert into mk_account_users (account_id, user_id, role)
values ('<account id>', '<their auth user id>', 'owner');
```

3. **Point their website at the collector.** In `sites/their-slug/content.js`:

```js
track: {
  endpoint: 'https://<project>.supabase.co/functions/v1/collect',
  siteId: '<the mk_sites.id from step 1>',
},
```

4. **Rebuild**: `node build.js their-slug`.

## Hosting the panel

`app/index.html` is one self-contained file. Put it on any static host
(Vercel, Netlify, Cloudflare Pages) and give each client the URL. The
publishable Supabase key in it is safe in a browser: row-level security decides
what each signed-in person can read, so the key alone shows nobody anything.

## Before a real client is onboarded

- [ ] Delete the demo login `demo-owner@mkwebstudio.test` and the demo account
- [ ] Turn on leaked-password protection in Supabase Auth settings
- [ ] Decide where the panel is hosted and give clients that URL
- [ ] Check the panel in a normal browser on a real phone

## Verified so far

- A business owner sees only their own account, site, enquiries and events.
  Tested with two businesses in one database; each saw only their own rows,
  including through the reporting view.
- An anonymous visitor is denied on every portal table and the view.
- The collector accepts valid events and rejects an unknown site (404), an
  unknown event type (400), a GET (405) and an oversized body (413).
- A real browser loading a built site produced a page view, a call tap, a form
  submission and an enquiry, all of which landed in the database.

**Not yet verified:** signing in to the panel from a normal browser. The
sandbox this was built in rewrites the API key on outbound requests, so
Supabase refused the sign-in there. The panel's own rendering was verified
against fixed data instead. Open the panel once from your own machine and sign
in before giving the URL to a client.
