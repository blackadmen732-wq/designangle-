# MK Admin Portal

One portal, every client, sections unlocked by plan. Upgrading reveals more of
the same dashboard; nobody is migrated to a different system.

## Status

- `schema.sql` — the full database, ready to run. **Built and ready.**
- The dashboard application — **not built yet.** Next piece of work.

## How a website reaches the portal

1. `template/track.js` ships with a built site when `content.js` includes a
   `track` block. Without that block the site reports nothing.
2. It posts page views, phone-button taps, form submissions and outbound
   booking clicks to a collector endpoint.
3. The collector writes to `events` and `leads` using the service role key.
   **Websites never hold that key and never write to the database directly.**
4. The owner signs in and sees only their own rows, enforced by row-level
   security in Postgres, not by the application.

## Privacy

No cookies and no personal data. A visitor is a random id regenerated daily and
kept in session storage, so it cannot follow anyone between days or sites. The
script does nothing if the browser sends Do Not Track.

## Reading the schema

| Table | Holds |
|---|---|
| `plans` | the four packages and which features each unlocks |
| `accounts` | one row per client business, with their plan and term date |
| `account_users` | who may sign in to which account |
| `sites` | the websites belonging to an account |
| `events` | views, call taps, form submits, booking clicks |
| `leads` | real enquiries from the website form |
| `edit_requests` | change requests, marked `small` or `quoted` |
| `calls` | real tracked calls. Stays empty until a tracking number exists |
| `messaging_registration` | A2P 10DLC status per client |
| `message_consent` | consent per person per purpose |

Two of these exist to stop a mistake rather than to store data:

- `calls` is separate from `events` so that **taps are never reported as calls**.
- `messaging_registration` and `message_consent` must both be satisfied before
  any automated text is sent. See `OFFER.md` section 5.

## Setting it up

1. Create a Supabase project for this. Do not share one with other work.
2. Run `schema.sql` in the SQL editor.
3. Add each client: a row in `accounts`, a row in `sites`, and invite the owner
   so they get a row in `account_users`.
4. Put the site's id and the collector URL into that client's `content.js`:

```js
track: { endpoint: 'https://<project>.supabase.co/functions/v1/collect',
         siteId: '<the sites.id uuid>' }
```

5. Rebuild: `node build.js clientname`.
