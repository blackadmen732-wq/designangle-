/*
 * Stand-in for the Supabase client, so the owner panel can be seen and
 * checked without a login. tools/check.js swaps it in for the panel's
 * import of supabase-js; it is never served to a real browser.
 *
 * Every name, number and address here is invented. The pattern is fixed
 * rather than random, so two screenshots of the same code look the same.
 *
 * Set these before the panel loads (Playwright: page.addInitScript):
 *   globalThis.PANEL_SAMPLE_SIGNED_IN = false    to see the sign-in screen
 *   globalThis.PANEL_SAMPLE_FAIL_WRITES = true   to see what a failed save looks like
 */
const DAY = 864e5;
const now = Date.now();
const iso = (ms) => new Date(ms).toISOString();
const utcDay = (i) => new Date(now - i * DAY).toISOString().slice(0, 10) + 'T00:00:00+00:00';

// Sixty days, so the panel has a previous period to compare with. This
// month runs a little busier than last.
const daily = Array.from({ length: 60 }, (_, i) => {
  const visitors = Math.round(24 + 11 * Math.sin(i / 4) + (i % 7 === 2 ? 9 : 0) + (i < 30 ? 5 : 0));
  return {
    site_id: 's1', day: utcDay(i), visitors,
    views: Math.round(visitors * 2.4), call_taps: (i * 7) % 4,
    form_submits: i % 4 === 0 ? 1 : 0, book_clicks: 0,
  };
}).reverse();

const lead = (o) => ({ site_id: 's1', status: 'new', ...o });
const leads = [
  lead({ name: 'Dana Ortiz', phone: '(555) 010-2231', email: 'dana@example.com',
    address: '18 Foundry Lane', city: 'Your City', zip: '43215', requested: 'Repair',
    message: 'Furnace clicks but no heat. Carrier 59SC, about 12 years old.',
    road_miles: 6.4, drive_minutes: 14, in_area: true, preferred: 'Nov 27, 10:00–12:00',
    created_at: iso(now - 2.2 * 36e5) }),
  lead({ name: 'Sam Lee', phone: '(555) 010-9981', address: '4 Elm Road', zip: '43001',
    requested: 'Install', road_miles: 31, drive_minutes: 42, in_area: false,
    preferred: 'Dec 2, 13:00–15:00', created_at: iso(now - 1.4 * DAY) }),
  lead({ name: 'Priya Natarajan', phone: '(555) 010-4410', email: 'priya@example.com',
    address: '220 Mill Street', city: 'Your City', zip: '43210', requested: 'Care plan',
    message: 'Two units. Would like both serviced before the cold weather.',
    road_miles: 3.1, drive_minutes: 9, in_area: true, preferred: 'Any weekday morning',
    created_at: iso(now - 4 * DAY) }),
  lead({ name: 'Marcus Webb', phone: '(555) 010-7702', address: '9 Orchard Court', zip: '43215',
    requested: 'Repair', road_miles: 8.2, drive_minutes: 17, in_area: true,
    preferred: 'Nov 29, 08:00–10:00', created_at: iso(now - 9 * DAY) }),
  lead({ name: 'Elena Ruiz', contact: 'elena@example.com', requested: 'Install',
    message: 'Quote for a heat pump, three-bedroom house.', created_at: iso(now - 16 * DAY) }),
  // The 30 days before, for the comparison.
  ...[33, 38, 44, 51].map((d, i) => lead({ name: `Earlier enquiry ${i + 1}`, phone: '(555) 010-0000',
    requested: 'Repair', created_at: iso(now - d * DAY) })),
];

const TABLES = {
  mk_accounts: [{ id: 'a1', business_name: 'Northwind Heating & Air', plan_id: 'starter',
    mk_plans: { name: 'Starter', features: ['inbox'] } }],
  mk_sites: [{ id: 's1', account_id: 'a1', domain: 'northwind.example', is_live: true }],
  mk_site_daily: daily,
  mk_leads: leads,
  mk_edit_requests: [
    { account_id: 'a1', body: 'Swap the hero photo for the one of the van', scope: 'small', status: 'done', created_at: iso(now - 5 * DAY) },
    { account_id: 'a1', body: 'Add a page for commercial work', scope: 'quoted', status: 'quoted', created_at: iso(now - 12 * DAY) },
  ],
  mk_site_settings: [{ site_id: 's1', phone: '(555) 010-4470',
    hours: [['Monday to Friday', '07:00 - 19:00'], ['Saturday', '08:00 - 16:00']], notice: null, notice_until: null }],
};

// Enough of the query builder for the panel: select, eq, gte, lt, order,
// limit, maybeSingle, insert, upsert, and { count, head } for counting.
function query(table) {
  let rows = (TABLES[table] ?? []).slice();
  let head = false, single = false, lim = Infinity, write = false;
  const cmp = (a, b) => (Number.isNaN(Date.parse(a)) ? (a < b ? -1 : a > b ? 1 : 0) : Date.parse(a) - Date.parse(b));
  const q = {
    select(_cols, opts) { head = Boolean(opts && opts.head); return q; },
    eq(col, v) { rows = rows.filter((r) => !(col in r) || r[col] === v); return q; },
    gte(col, v) { rows = rows.filter((r) => !(col in r) || cmp(r[col], v) >= 0); return q; },
    lt(col, v) { rows = rows.filter((r) => !(col in r) || cmp(r[col], v) < 0); return q; },
    order(col, o = {}) { const dir = o.ascending === false ? -1 : 1; rows.sort((a, b) => dir * cmp(a[col], b[col])); return q; },
    limit(n) { lim = n; return q; },
    maybeSingle() { single = true; return q; },
    insert(row) {
      write = true;
      if (!globalThis.PANEL_SAMPLE_FAIL_WRITES) TABLES[table]?.unshift({ scope: 'small', status: 'open', created_at: iso(Date.now()), ...row });
      return q;
    },
    upsert(row) {
      write = true;
      if (!globalThis.PANEL_SAMPLE_FAIL_WRITES && table === 'mk_site_settings') TABLES[table] = [row];
      return q;
    },
    then(resolve, reject) {
      if (write && globalThis.PANEL_SAMPLE_FAIL_WRITES) {
        return Promise.resolve({ data: null, error: { message: 'Sample data: this write was set to fail' } }).then(resolve, reject);
      }
      const out = rows.slice(0, lim);
      const data = head ? null : single ? (out[0] ?? null) : out;
      return Promise.resolve({ data, count: rows.length, error: null }).then(resolve, reject);
    },
  };
  return q;
}

export function createClient() {
  const signedIn = globalThis.PANEL_SAMPLE_SIGNED_IN !== false;
  return {
    auth: {
      getSession: async () => ({ data: { session: signedIn ? { user: { email: 'owner@example.com' } } : null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithPassword: async () => ({ error: { message: 'Sample data: there is no real account' } }),
      signOut: async () => ({ error: null }),
    },
    from: query,
  };
}
