# Scale, money, and what is not built

Four questions answered with measured numbers, not estimates. Measured
24 November 2026 against the live database and a real built site.

---

## 1. Do they pay before or after?

**Before. And the preview is the only reason you can ask.**

Look at where your exposure actually sits:

| | |
|---|---|
| Your work per client | about 2.5 hours |
| Time from "yes" to live | days to weeks |
| What causes the gap | **their photographs** |

That gap is the problem. It is not two hours of risk, it is two or three
weeks of chasing somebody for pictures while having already done the work.
If they pay at the end, every one of those weeks is unpaid and they can walk
at any point in it, after you have built the thing.

`OFFER.md` already says this: *"Free build, cancel anytime with no term loses
money on anyone who leaves early. A build is real hours. Either run a
12-month term, or charge a setup fee."*

**The structure:**

1. **Preview — free, 2 minutes, no commitment.** They see their own name on a
   real page. Costs you almost nothing, so give it away without hesitation.
2. **Setup fee on signing, before you start the build.** This covers the 2.5
   hours and the photo chasing. Non-refundable, and say so in writing.
3. **Subscription starts at launch**, not at signing. They should not pay a
   monthly fee for a site that is not up yet.
4. **12-month term**, or a higher setup fee if they want month-to-month.

**Why the preview makes the up-front fee sellable.** Without it you are asking
a small business to pay for a promise. With it you are asking them to pay for
something they have already looked at, with their name on it. That is a
completely different conversation, and it is the entire commercial argument
for the two minutes `tools/preview.js` takes.

**What to say, roughly:** *"The preview is free and yours to keep looking at.
If you want it built properly — your photos, your prices, your phone number,
on your domain — that's £X to build and £Y a month from the day it goes live.
The build fee covers the work and it's due before I start, because the part
that takes longest is waiting on your photographs."*

---

## 2. Will one system run 500 sites?

**Yes, for about $45 a month — but only if you add event retention.** Without
it, the database fills up and stops.

Measured inputs: **551 bytes per event row** including indexes, and a real
built site at **275 KB first view, 70 KB repeat**. Assumed: 500 sites at 800
page views a month, 2.5 events per view, 35% repeat visitors.

| | Per month at 500 sites |
|---|---|
| Events written | 1.00 M |
| Database growth | 0.6 GB → **6.6 GB a year** |
| Edge function calls | 1.00 M |
| Site bandwidth | 81 GB |

### Against the plans

| | Plan | Headroom |
|---|---|---|
| **Supabase Pro** $25/mo | 8 GB db | ⛔ **full in 14.5 months** |
| | 2 M edge calls | ⚠ you use **50%** |
| | 250 GB egress | fine |
| **Vercel Pro** $20/mo | 1 TB bandwidth | ✅ you use **8%** |

### The fix, and it is not optional

Keep raw events for 90 days, roll everything older into daily per-site counts,
delete the raw rows.

| | Steady state |
|---|---|
| Raw, 90 days | 1.65 GB |
| Daily rollups, forever | 0.11 GB |
| **Total, flat** | **1.76 GB** |
| Headroom on Pro | **4.5×** |

Flat, not growing. The panel keeps showing full history because the rollups
carry the daily numbers; only the individual rows go.

**The tightest constraint is edge invocations, not storage.** At 50% of the 2M
included you have room, but a single client with a popular site moves that
number faster than anything else. Watch it before you watch disk.

### The constraint that is not technical

500 clients × 2.5 hours = **1,250 hours of build time.** That is 31 weeks of
full-time work before anyone has asked for a change.

The system scales to 500. One person does not. Somewhere around 40 to 60
clients you are choosing between hiring, raising prices, or cutting what a
build includes — and the photo-chasing is the first thing to hand off, because
it needs no design judgement.

---

## 3. The booking algorithm does not exist

This one matters because it is sold.

**What exists today:** a request form. The customer picks a service from a
dropdown, picks a preferred date and a rough time window, and presses send.
That arrives in the owner's panel as an enquiry. The owner rings them back.

**What does not exist, anywhere in this repository:**

- availability — nothing knows which slots are free
- double-booking prevention — two people can request the same morning
- travel time between jobs
- staff or resource rules
- holidays and closures
- any confirmation back to the customer beyond "we got it"

`OFFER.md` line 148 lists *"build a slot engine on the portal database"* as an
option to be chosen, not as something built. Cal.com was evaluated and ruled
out there, correctly: its Platform API requires an organisation, which is
enterprise-only, so a self-serve plan cannot use it.

**Where this bites:** the **$397 tier promises "AI Booking — assistant
settings, booking calendar, conversation history."** None of that is built. Do
not sell that tier until it is, or sell it as explicitly coming later with a
date you can meet.

The $150 and $197 tiers are honest today. They promise a request form, and a
request form is what they get.

---

## 4. ReviewBoost free in every plan

Three things to think about before this goes in writing.

**It is not a $49 giveaway, it is a hosting cost.** It is your product, so the
marginal cost is infrastructure, not revenue forgone. But 500 clients on
ReviewBoost is a second set of events, a second database footprint and a
second set of edge calls, on top of the numbers above. Size it the same way
before promising it, because "free" at 500 clients is not free.

**"Free when it launches" is a promise with a date in it.** A client who signs
in January expecting it is a client with an unmet expectation every month
until it ships. Either give a date you will hit, or say "included at no extra
cost when it's ready" and do not name a month.

**It changes what the subscription is.** Right now you sell a website. With
ReviewBoost bundled you sell a website plus a review system, and that is a
stronger offer — but it also means a client who stops paying loses both, and
their Google reviews are arguably more valuable to them than the site. Decide
now whether that is leverage you want, and make sure the agreement says what
happens to their review data when they leave.

---

## What to do next, in order

1. **Host the panel.** Until there is a URL, you can sell a website but not the
   panel. One static file, Vercel or Cloudflare Pages, 20 minutes.
2. **Delete the demo login.** `demo-owner@mkwebstudio.test` is live with a
   known password in the database that will hold real client leads.
3. **Add the retention job.** Not urgent at 5 clients, mandatory before 200.
4. **Fix the $397 tier**, or stop selling it, until booking exists.
