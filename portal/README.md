# MK Admin Portal

One portal, every client, sections unlocked by plan. Upgrading reveals more of
the same dashboard; nobody is migrated to a different system.

## What is built and working

| Piece | State |
|---|---|
| `schema.sql` — database, permissions, compliance tables | **live** |
| `functions/collect/index.ts` — the endpoint websites report to | **deployed** |
| `app/index.html` — the $150 owner panel | **built** |
| `functions/settings/index.ts` — owner-editable details, read by websites | **deployed** |
| `functions/service-area/index.ts` — "do you come out to me, and how far?" | **deployed** |
| `functions/load-zips/index.ts` — one-off Census ZIP centroid loader | **deployed, already run** |
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
| `mk_leads` | real enquiries: name, phone, email, address, what they need |
| `mk_edit_requests` | change requests, marked `small` or `quoted` |
| `mk_calls` | real tracked calls. Empty until a tracking number exists |
| `mk_messaging_registration` | A2P 10DLC status per client |
| `mk_message_consent` | consent per person, per purpose |
| `mk_site_settings` | phone, hours and notice the owner edits themselves |
| `mk_settings_log` | who changed those details, and what they were before |
| `mk_zip_points` | 33,791 US ZIP centroids from the Census Bureau (public domain) |

Two of these exist to prevent a mistake rather than to store data:

- `mk_calls` is separate from `mk_events` so **taps are never reported as calls**.
  The panel labels them "call taps" and says so in plain words on the page.
- `mk_messaging_registration` and `mk_message_consent` must both be satisfied
  before any automated text is sent. See `../OFFER.md` section 5.

## What the system does not do: dispatch

A lead is an **enquiry, not an appointment.** The customer picks a service, a
preferred date and a rough time window, and presses send. `preferred` is free
text like "Tuesday, 25 November, 10:00 – 12:00". It is what they asked for.
Nothing has agreed to it.

The owner opens the panel, reads the list, and **rings them back.**

What exists, per lead: who they are, phone and email, the address with a maps
link, what they asked for, their message, how far it is and roughly how long
to drive, and when the enquiry came in.

What does **not** exist anywhere in this system:

- availability — nothing knows which slots are free
- double-booking prevention — two people can ask for the same morning
- travel time between jobs, or route order
- staff, vehicle or resource rules
- holidays and closures
- any confirmation back to the customer beyond "we got it"
- a notification — the owner finds out by opening the panel

That is a **request form**, and for the $150 and $197 tiers that is exactly
what is sold and it is honest. The **$397 tier promises "AI Booking:
assistant settings, booking calendar, conversation history"** and none of it
is built. Do not sell that tier yet.

### The three columns that close most of the gap

`status`, `scheduled_at` and `owner_note` turn a list of enquiries into a day
plan without building a scheduler:

| Column | Meaning |
|---|---|
| `preferred` | what the customer asked for. Free text. Not an appointment. |
| `scheduled_at` | what the owner actually arranged after ringing. Null until then. |
| `status` | new → contacted → booked → done, or lost |
| `owner_note` | what the owner wants to remember |

An owner may write **only those three.** The customer's name, phone, address
and request are not writable by anyone through the API, because the enquiry
as submitted is evidence — if it could be edited, a disputed job would come
down to a record only one side can change.

Verified against the live database: an owner scheduling a stranger's lead is
denied, scheduling their own is allowed, rewriting the customer's phone is
denied at the column grant, and anonymous is denied outright.

**The panel does not yet render any of this.** It still lists enquiries newest
first. A "today" view ordered by `scheduled_at`, with the maps link and the
status buttons, is the next piece of work and it is what makes the panel feel
like a tool rather than an inbox.

### This shape is for trades, not restaurants

Travel time, route order and "where am I going at 10am" are problems for a
business that **drives to the customer**: HVAC, plumbing, electrical. A
restaurant has the opposite shape — the customer travels, there is no
distance to compute, and the scarce resource is tables at a sitting. The
distance fields are meaningless for them and the panel should not show them.

## Details the owner changes themselves

Hours, phone number and a notice banner are editable in the panel, with no
request to the studio. The website reads them on load and falls back to the
values built into the page, so a failed or slow request never leaves a visitor
looking at a blank hours table.

Two safeguards:

- **A notice must have an end date.** The panel refuses to save one without it,
  and the endpoint stops sending a notice whose date has passed, so a holiday
  banner cannot be left up until March.
- **Every change is logged** to `mk_settings_log` with who made it and the
  previous values, so an unexpected change on a live site can be traced.

Adding more editable fields means three steps: a column on `mk_site_settings`,
a line in the `settings` function's response, and a field in the panel. The
website side needs a `data-live="<name>"` marker in `build.js` and a branch in
the `liveDetails` function in `template/site.js`.

## Service area and travel distance

Before a visitor picks a time, the form answers two questions the owner would
otherwise discover at 8am: **do we come out there, and how far is it?**

This costs nothing to run. Distance between two points is arithmetic, and the
ZIP coordinates are public Census data held in your own database. No maps key,
no per-lookup fee, no rate limit.

Set it up per client:

```sql
update mk_accounts a set
  base_zip = '43215', base_lat = z.lat, base_lon = z.lon,
  service_radius = 25        -- miles; null means no limit
from mk_zip_points z
where z.zip = '43215' and a.slug = 'their-slug';
```

Then switch it on in their `content.js`:

```js
form: { ..., serviceArea: true, zipLabel: 'Your ZIP code' }
```

The distance is stored on the lead, so the owner sees "47 mi, about 90 min,
outside area" on the enquiry without looking anything up.

**It is an estimate and is labelled as one.** Straight-line distance multiplied
by the account's `road_factor` (1.30 by default) at `avg_speed_mph` (32). That
is honest for "can we come?" but nobody should plan a tight day around it. For
real routed drive times, put a routing engine behind the same response shape;
nothing else changes. Self-hosted OSRM is the usual free choice.

Accuracy check against reality: Columbus to Cleveland comes out at 128 straight-line
miles against about 142 by road, and New York to Los Angeles at 2,448 miles
against a true great-circle distance of roughly 2,446.

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
- Changing the hours, phone and notice in the database changed what the built
  website showed. Blocking the settings request left the built-in hours and
  phone in place, with no banner and no error.
- The panel's editor loads current values, adds and removes hours lines, sends
  the correct row, and refuses a notice with no end date.
- The service-area check answers correctly for nearby ZIPs, distant ZIPs, an
  unknown ZIP and a malformed one, and rejects an unknown site. A real browser
  typing a ZIP on the built site saw the right answer, and the distance arrived
  on the lead in the database.
- The form asks for its fields in order and names the first one missing:
  name, then phone, then address, then date. A browser reporting coordinates
  in Dublin, Ohio had its ZIP filled in by the location button and was told
  the right distance. The full enquiry, including address and the problem
  description, reached the database.

**Not yet verified:** signing in to the panel from a normal browser. The
sandbox this was built in rewrites the API key on outbound requests, so
Supabase refused the sign-in there. The panel's own rendering was verified
against fixed data instead. Open the panel once from your own machine and sign
in before giving the URL to a client.
