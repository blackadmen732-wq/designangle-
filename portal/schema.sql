-- MK Admin Portal: one database, every client, permissions by plan.
--
-- Design note: there is ONE portal. A client's plan unlocks sections of it.
-- Nobody is migrated to a different system when they upgrade.
--
-- Tables are prefixed mk_ so this can share a Postgres database with other
-- work without any chance of a name collision. To move it to a dedicated
-- project later: pg_dump the mk_ tables and restore them there.
--
-- Run this in the Supabase SQL editor, or with: supabase db push
-- Every table has row-level security, so a business owner can only ever
-- read their own rows. That is the part you must not weaken.

-- ---------------------------------------------------------------- mk_plans

create table if not exists mk_plans (
  id          text primary key,                 -- 'care' | 'orders' | 'crm' | 'ai'
  name        text not null,
  price_cents integer not null,
  rank        integer not null,                 -- higher unlocks more
  features    text[] not null default '{}'
);

insert into mk_plans (id, name, price_cents, rank, features) values
  ('care',   'Website Care',        15000, 1, '{site,analytics,calls,leads,reports,edits,billing}'),
  ('orders', 'Ordering',            19700, 2, '{site,analytics,calls,leads,reports,edits,billing,menu,orders,payments}'),
  ('crm',    'Customer Management', 29700, 3, '{site,analytics,calls,leads,reports,edits,billing,menu,orders,payments,inbox,contacts,campaigns,automation}'),
  ('ai',     'AI Booking',          39700, 4, '{site,analytics,calls,leads,reports,edits,billing,menu,orders,payments,inbox,contacts,campaigns,automation,assistant,calendar,pipeline,integrations}')
on conflict (id) do update
  set name = excluded.name, price_cents = excluded.price_cents,
      rank = excluded.rank, features = excluded.features;

-- ------------------------------------------------------------- mk_accounts

create table if not exists mk_accounts (
  id            uuid primary key default gen_random_uuid(),
  business_name text not null,
  slug          text not null unique,           -- matches sites/<slug> in the repo
  plan_id       text not null references mk_plans(id) default 'care',
  trade         text,                           -- 'restaurant' | 'hvac' | ...
  phone         text,
  timezone      text not null default 'America/New_York',
  status        text not null default 'active', -- active | paused | cancelled
  term_ends_on  date,                           -- the 12-month commitment date
  created_at    timestamptz not null default now()
);

-- Who may sign in to which account. One row per person.
create table if not exists mk_account_users (
  account_id uuid not null references mk_accounts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null default 'owner',     -- owner | staff | agency
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);
create index if not exists account_users_user_idx on mk_account_users(user_id);

-- ---------------------------------------------------------------- mk_sites

create table if not exists mk_sites (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references mk_accounts(id) on delete cascade,
  domain      text not null,
  is_live     boolean not null default false,
  last_build  timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists sites_account_idx on mk_sites(account_id);

-- --------------------------------------------------------------- mk_events
-- What the website reports. No cookies and no personal data: a visitor is a
-- random id that changes every day, so this cannot follow anyone around.

create table if not exists mk_events (
  id         bigint generated always as identity primary key,
  site_id    uuid not null references mk_sites(id) on delete cascade,
  kind       text not null,                     -- view | call_tap | form_submit | book_click | menu_view
  path       text,
  referrer   text,
  device     text,                              -- phone | desktop
  visitor    text,                              -- rotating daily hash, not an identity
  meta       jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists events_site_time_idx on mk_events(site_id, created_at desc);
create index if not exists events_site_kind_idx on mk_events(site_id, kind, created_at desc);

-- ---------------------------------------------------------------- mk_leads
-- A real enquiry from the website form. This is the number that matters.

create table if not exists mk_leads (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references mk_sites(id) on delete cascade,
  name       text not null,
  contact    text,
  requested  text,                              -- 'Repair', 'Table for 2'
  preferred  text,                              -- date and time they asked for
  message    text,
  status     text not null default 'new',       -- new | contacted | won | lost
  created_at timestamptz not null default now()
);
create index if not exists leads_site_idx on mk_leads(site_id, created_at desc);

-- -------------------------------------------------------- edit requests
-- The owner asks for a change. Scope is written down so "unlimited small
-- edits" cannot turn into an unpaid redesign.

create table if not exists mk_edit_requests (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references mk_accounts(id) on delete cascade,
  body        text not null,
  scope       text not null default 'small',    -- small | quoted
  status      text not null default 'open',     -- open | doing | done | quoted
  quote_cents integer,
  created_at  timestamptz not null default now(),
  done_at     timestamptz
);
create index if not exists edit_requests_account_idx on mk_edit_requests(account_id, created_at desc);

-- ------------------------------------------------------- call tracking
-- A tap on a phone button is NOT a phone call. Taps live in mk_events.
-- This table holds real calls from a tracking number, and stays empty
-- until that number is set up. Never report taps as calls.

create table if not exists mk_calls (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references mk_accounts(id) on delete cascade,
  from_number text,                             -- store masked, e.g. (555) ***-4470
  answered    boolean not null default false,
  seconds     integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists calls_account_idx on mk_calls(account_id, created_at desc);

-- ------------------------------------------------- messaging compliance
-- Before ANY automated text goes out for a client, these must be true.
-- The portal refuses to send while a row is missing or unapproved.

create table if not exists mk_messaging_registration (
  account_id       uuid primary key references mk_accounts(id) on delete cascade,
  brand_status     text not null default 'none',   -- none | pending | approved | rejected
  campaign_status  text not null default 'none',   -- none | pending | approved | rejected
  campaign_use     text,                           -- the registered use case
  submitted_on     date,
  approved_on      date,
  opt_in_proof_url text,                           -- must be publicly reachable
  notes            text
);

-- Consent, per person, per purpose. Consent to a booking confirmation is
-- NOT consent to a review request. Keep them separate or do not send.
create table if not exists mk_message_consent (
  id          uuid primary key default gen_random_uuid(),
  account_id  uuid not null references mk_accounts(id) on delete cascade,
  phone       text not null,
  purpose     text not null,                    -- transactional | marketing
  source      text not null,                    -- how it was given, in words
  granted_at  timestamptz not null default now(),
  revoked_at  timestamptz,
  unique (account_id, phone, purpose)
);

-- ------------------------------------------------------------------ RLS

alter table mk_accounts               enable row level security;
alter table mk_account_users          enable row level security;
alter table mk_sites                  enable row level security;
alter table mk_events                 enable row level security;
alter table mk_leads                  enable row level security;
alter table mk_edit_requests          enable row level security;
alter table mk_calls                  enable row level security;
alter table mk_messaging_registration enable row level security;
alter table mk_message_consent        enable row level security;
alter table mk_plans                  enable row level security;

-- Which accounts may the signed-in person see?
create or replace function mk_my_account_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select account_id from mk_account_users where user_id = auth.uid()
$$;

create policy plans_read on mk_plans for select to authenticated using (true);

create policy accounts_read on mk_accounts for select to authenticated
  using (id in (select mk_my_account_ids()));

create policy account_users_read on mk_account_users for select to authenticated
  using (account_id in (select mk_my_account_ids()));

create policy sites_read on mk_sites for select to authenticated
  using (account_id in (select mk_my_account_ids()));

create policy events_read on mk_events for select to authenticated
  using (site_id in (select id from mk_sites where account_id in (select mk_my_account_ids())));

create policy leads_read on mk_leads for select to authenticated
  using (site_id in (select id from mk_sites where account_id in (select mk_my_account_ids())));

create policy leads_update on mk_leads for update to authenticated
  using (site_id in (select id from mk_sites where account_id in (select mk_my_account_ids())));

create policy edits_read on mk_edit_requests for select to authenticated
  using (account_id in (select mk_my_account_ids()));

create policy edits_insert on mk_edit_requests for insert to authenticated
  with check (account_id in (select mk_my_account_ids()));

create policy calls_read on mk_calls for select to authenticated
  using (account_id in (select mk_my_account_ids()));

create policy reg_read on mk_messaging_registration for select to authenticated
  using (account_id in (select mk_my_account_ids()));

create policy consent_read on mk_message_consent for select to authenticated
  using (account_id in (select mk_my_account_ids()));

-- Websites write events and leads through an edge function using the service
-- role, never from the browser, so no anonymous insert policy exists here.

-- ------------------------------------------------------------- reporting

-- security_invoker makes this view run as the person querying it, so the
-- row-level security above still applies. Without it a view bypasses RLS
-- and one client could read another's numbers.
create or replace view mk_site_daily with (security_invoker = true) as
  select site_id,
         date_trunc('day', created_at) as day,
         count(*) filter (where kind = 'view')        as views,
         count(*) filter (where kind = 'call_tap')    as call_taps,
         count(*) filter (where kind = 'form_submit') as form_submits,
         count(*) filter (where kind = 'book_click')  as book_clicks,
         count(distinct visitor)                      as visitors
  from mk_events group by 1, 2;
