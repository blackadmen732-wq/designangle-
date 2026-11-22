# MK Web Studio: the offer, and the rules behind it

A managed business website. The customer pays monthly, gets a site they never
have to touch, and an owner panel that shows what the site is doing for them.
Upgrading unlocks more of the same panel. Nobody is moved to another system.

---

## The packages

| | $150 | $197 | $297 | $397 |
|---|---|---|---|---|
| Custom 5-page website | ● | ● | ● | ● |
| Hosting, security, backups | ● | ● | ● | ● |
| Google listing management | ● | ● | ● | ● |
| **Owner admin panel** | Basic | + Orders | + Automation | + AI & CRM |
| Traffic and call-click reports | ● | ● | ● | ● |
| Online ordering and payments | — | ● | ● | ● |
| Menu and inventory controls | — | ● | ● | ● |
| Direct-order promo cards | — | ● | ● | ● |
| Missed-call and form auto-texts | — | — | ● | ● |
| Review and reactivation messages | — | — | ● | ● |
| Unified customer inbox | — | — | ● | ● |
| AI text/chat booking assistant | — | — | — | ● |
| AI lead follow-up | — | — | — | ● |
| Advanced integrations | — | — | — | Setup fee |

**Every paying customer gets a panel.** The dashboard is the reason the monthly
fee makes sense. A website alone does not justify a subscription; a website that
reports what it did this month does.

## What each panel shows

**$150 — Website Control Panel.** Site status, visitors, taps on the phone
button, form enquiries, booking-link clicks, Google listing details, the monthly
report, an edit request box, billing and support.

**$197 — adds Ordering.** Live orders, menu editor, item availability,
pickup and delivery settings, order alerts, payment history, refunds, sales.

**$297 — adds Customer Management.** One inbox, customer records, missed-call
recovery, review campaigns, message templates, automation switches, opt-outs,
and a weekly recovered-lead report.

**$397 — adds AI Booking.** Assistant settings, booking calendar, conversation
history, the approved knowledge the AI may use, lead pipeline, follow-up rules,
staff access and integrations.

---

## Rules that protect the business

These exist because each one is a way to lose money or get sued. They are built
into the schema in `portal/schema.sql`, not left to memory.

### 1. A tap is not a call

The website can count taps on a phone button. It cannot know whether the call
connected, how long it lasted, or whether anyone answered. **Never tell an owner
the site produced 23 calls when what you measured was 23 taps.** The panel labels
it "call taps" for this reason.

Real call counts need a tracking number that forwards to their line. That gives
genuine counts, durations and missed calls, and it is worth charging for. Until
that number exists, the `calls` table stays empty and the panel shows taps only.

### 2. "Unlimited small edits" needs a definition

Written into the agreement, not left vague:

- **A small edit** is text changes, swapping a photo, prices, hours, staff
  names, adding or removing a list item, a new section built from existing
  blocks. Up to about 30 minutes. Done within two business days.
- **Not a small edit**: a new page type, a redesign, a logo, new photography,
  a new integration, anything needing a new build. These get a written quote.

The panel's edit box marks each request `small` or `quoted` so the record is
kept and there is no argument later.

### 3. Ordering has costs that cannot be absorbed

At $197/month you cannot silently cover card fees. Spell out, in writing:

- **Card processing** is the client's cost, passed straight through
  (roughly 2.9% + 30¢ on a typical processor; confirm current rates).
- **Who fulfils delivery**, and that delivery fees are theirs.
- **Who issues refunds**, and from whose balance.
- **Any ordering software fee** and who pays it.

**Recommendation: do not build an ordering system.** Live orders, menus,
inventory and refunds is the exact product Toast and Square already sell with
hundreds of engineers behind it. Set up and manage theirs, and charge for that.
Building it means competing with a payments company on their own ground.

### 4. Cancellation terms, in writing

Say all of this before the first payment:

- **The domain is the client's**, in their name, and they keep it.
- **The site goes offline** at the end of the paid period unless they buy it out.
- **Their data** (leads, customers, menu) is exported to them on request.
- **A buyout price** for the finished site, if they want to take it elsewhere.

"Free build, cancel anytime" with no term loses money on anyone who leaves
early. A build is real hours. Either run a **12-month term**, or charge a setup
fee and waive it on a 12-month commitment.

### 5. Texting is a compliance wall, not a feature switch

This is the single biggest risk in the plan, and it lands on the $297 tier.

Automated texts to US numbers require **A2P 10DLC registration**, per client:

- Each client needs their **own brand** registered with their EIN, legal name,
  address and website.
- Each needs a **campaign**, which takes **10 to 15 business days** to review.
- Each needs a **privacy policy and terms** containing the SMS clauses, with
  HELP and STOP instructions, publicly reachable.
- Each needs **documented opt-in** with a publicly reachable link or screenshot.
- Public link shorteners are forbidden in the messages.

So a $297 client cannot send a single automated text for roughly three weeks
after signing, and only after paperwork you collect from them.

**Consent is per purpose.** Someone who gave their number to book a table has
not consented to a review request. Review and reactivation messages are
marketing, which needs express written consent. Sending without it is a TCPA
problem, and damages are counted per message.

The schema enforces the order of operations: `messaging_registration` must be
`approved` and a matching `message_consent` row must exist before the portal
sends anything. Do not add a bypass.

### 6. Delivery-app promo cards

Promo cards in DoorDash and Uber Eats bags point to **the restaurant's own
ordering page or QR code**. Never use the apps' names, logos or colours in a way
that suggests they endorse the promotion.

### 7. Never invent a client fact

No guarantee, response time, certification, years in business, review count or
price goes on a site unless the client gave it to you. The example sites in
`sites/` are invented and labelled as such in every file.

---

## Build order

The website is days of work. The panel is the real product, and tiers 2 to 4 are
each a separate piece of software with their own compliance and support load.

**Sell the $150 tier only until you have 10 paying clients.**

Reasons: it is deliverable now, it proves the monthly fee, and it needs no
payment processing, no carrier registration and no AI. Launching four tiers at
once means one customer in each and four half-finished products.

| Order | Build | Blocked by |
|---|---|---|
| 1 | Website kit | done |
| 2 | $150 panel: analytics, leads, edit requests, reports | a database and a host |
| 3 | Call tracking numbers | a Twilio account |
| 4 | $197: integrate an existing ordering system | a processor account per client |
| 5 | $297: messaging | A2P registration per client, consent capture |
| 6 | $397: AI booking | everything above |
