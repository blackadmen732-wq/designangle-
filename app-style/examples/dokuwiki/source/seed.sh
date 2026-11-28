#!/bin/sh
# Fills a fresh DokuWiki (stable, 2026-07-14c "Mort") with a studio handbook
# written from this repo's own rules (CLAUDE.md, DESIGN.md, the skills). The
# studio is invented; the rules and the commands are the kit's.
#
#   git clone --depth 1 --branch stable https://github.com/dokuwiki/dokuwiki
#   sh seed.sh dokuwiki && php -S 127.0.0.1:8140 -t dokuwiki   # the "before"
#   python3 export.py http://127.0.0.1:8140 > ../data.js
set -e
W="$1"; P="$W/data/pages"
mkdir -p "$P"
printf '<?php\n$conf["title"] = "Studio handbook";\n$conf["lang"] = "en";\n$conf["breadcrumbs"] = 5;\n' > "$W/conf/local.php"

cat > "$P/start.txt" <<'TXT'
====== Studio handbook ======

How we build, check and launch a client's site. Start with the rules: they are the ones that cost money or trust when they break.

  * [[client_rules|The rules that are not style preferences]]
  * [[launch_checklist|Launch checklist]]
  * [[checking|How we check a page]]
  * [[photos|Photos: where they come from]]
TXT

cat > "$P/client_rules.txt" <<'TXT'
====== The rules that are not style preferences ======

These exist because breaking them loses money or breaks trust. A redesign never relaxes one.

===== A tap is not a call =====

A tap on the phone number is not a phone call. Taps live in ''mk_events'', real calls in ''mk_calls''. Never report one as the other. The owner's panel says so on the page.

===== No text without consent =====

No automated text message goes out without both a messaging registration and a matching consent row. There is no bypass, not even for a test.

===== Never invent a client fact =====

No guarantee, response time, price, review count or certification that the client did not give us. If a section needs a fact we do not have, the section waits.

===== A lead needs a name and a phone number =====

The collector refuses one without them, so a miswired form fails loudly instead of filling the owner's list with enquiries nobody can answer.

===== Distances are estimates =====

A straight line adjusted for roads, not a routed drive time, and the page says so: "about 6.4 mi".
TXT

cat > "$P/launch_checklist.txt" <<'TXT'
====== Launch checklist ======

Run it top to bottom the day before a site goes live. Anything that fails waits for the next day.

===== The page =====

  * Build every site: ''node build.js''
  * Check both sizes, 400 by 860 and 1280 by 900: ''node tools/check.js''
  * Open the screenshots in ''.check/'' and look at them. A pass is not the end.
  * Run the unslop audit on the home page: ''node tools/slop.js dist/<site>''

===== The facts =====

  * Every price, hour and promise on the page came from the client, in writing.
  * The phone number calls the client, and the form reaches the owner's list.
  * Distances say "about".

===== The owner =====

  * The owner can sign in to the panel and change their hours and notice banner.
  * They know a tap on their number is counted as a tap, not a call.

> If something on this list cannot be ticked, the launch moves. The client hears it from us first.
TXT

cat > "$P/checking.txt" <<'TXT'
====== How we check a page ======

Three audits, each answering one question. Run all three; then look, because none of them can see everything.

===== Is it usable? =====

<code>
node tools/check.js dist/hvac
</code>

Contrast, tap size, gutters, 16px fields, sideways scroll, broken images, text running into text, a control hidden under a floating button. Both sizes, every time.

===== Does it look made by someone? =====

<code>
node tools/slop.js dist/hvac
</code>

The 18 tells of a page an AI made by default, a score, and the one thing to fix first.

===== Does it move well? =====

<code>
node tools/motion.js app-style/examples/tickets
</code>

It presses through the page, measures every animation, and photographs each one frame by frame.
TXT

cat > "$P/photos.txt" <<'TXT'
====== Photos: where they come from ======

The client's own photos first. Until they arrive, free-licence stand-ins, credited, and never of the wrong thing.

  - Look at a contact sheet before using anything: ''python3 tools/photos.py try <ids>''
  - Fetch the ones that fit, with credits: ''python3 tools/photos.py fetch <folder> name=<id>''
  - No other brand's packaging in a stand-in.
  - On a dark screen, grade the photo to about 70% brightness.
TXT
echo "seeded $(ls "$P" | wc -l) pages"
