// Exported from a DokuWiki by source/export.py. The rules are the kit's; the studio is invented.
window.WIKI = {
 "wiki": "Studio handbook",
 "exported": "2026-11-27T01:13+00:00",
 "source": "DokuWiki stable (2026-07-14c), seeded by seed.sh with the kit's own rules. The studio is invented.",
 "pages": [
  {
   "id": "start",
   "title": "Studio handbook",
   "html": "<div>\n<p>\nHow we build, check and launch a client&#039;s site. Start with the rules: they are the ones that cost money or trust when they break.\n</p>\n<ul>\n<li><a href=\"#/client_rules\" data-page=\"client_rules\">The rules that are not style preferences</a>\n</li>\n<li><a href=\"#/launch_checklist\" data-page=\"launch_checklist\">Launch checklist</a>\n</li>\n<li><a href=\"#/checking\" data-page=\"checking\">How we check a page</a>\n</li>\n<li><a href=\"#/photos\" data-page=\"photos\">Photos: where they come from</a>\n</li>\n</ul>\n</div>",
   "raw": "====== Studio handbook ======\n\nHow we build, check and launch a client's site. Start with the rules: they are the ones that cost money or trust when they break.\n\n  * [[client_rules|The rules that are not style preferences]]\n  * [[launch_checklist|Launch checklist]]\n  * [[checking|How we check a page]]\n  * [[photos|Photos: where they come from]]\n",
   "toc": [],
   "words": 44
  },
  {
   "id": "client_rules",
   "title": "The rules that are not style preferences",
   "html": "<div>\n<p>\nThese exist because breaking them loses money or breaks trust. A redesign never relaxes one.\n</p>\n</div>\n<h2 id=\"a_tap_is_not_a_call\">A tap is not a call</h2>\n<div>\n<p>\nA tap on the phone number is not a phone call. Taps live in <code>mk_events</code>, real calls in <code>mk_calls</code>. Never report one as the other. The owner&#039;s panel says so on the page.\n</p>\n</div>\n<h2 id=\"no_text_without_consent\">No text without consent</h2>\n<div>\n<p>\nNo automated text message goes out without both a messaging registration and a matching consent row. There is no bypass, not even for a test.\n</p>\n</div>\n<h2 id=\"never_invent_a_client_fact\">Never invent a client fact</h2>\n<div>\n<p>\nNo guarantee, response time, price, review count or certification that the client did not give us. If a section needs a fact we do not have, the section waits.\n</p>\n</div>\n<h2 id=\"a_lead_needs_a_name_and_a_phone_number\">A lead needs a name and a phone number</h2>\n<div>\n<p>\nThe collector refuses one without them, so a miswired form fails loudly instead of filling the owner&#039;s list with enquiries nobody can answer.\n</p>\n</div>\n<h2 id=\"distances_are_estimates\">Distances are estimates</h2>\n<div>\n<p>\nA straight line adjusted for roads, not a routed drive time, and the page says so: “about 6.4 mi”.\n</p>\n</div>",
   "raw": "====== The rules that are not style preferences ======\n\nThese exist because breaking them loses money or breaks trust. A redesign never relaxes one.\n\n===== A tap is not a call =====\n\nA tap on the phone number is not a phone call. Taps live in ''mk_events'', real calls in ''mk_calls''. Never report one as the other. The owner's panel says so on the page.\n\n===== No text without consent =====\n\nNo automated text message goes out without both a messaging registration and a matching consent row. There is no bypass, not even for a test.\n\n===== Never invent a client fact =====\n\nNo guarantee, response time, price, review count or certification that the client did not give us. If a section needs a fact we do not have, the section waits.\n\n===== A lead needs a name and a phone number =====\n\nThe collector refuses one without them, so a miswired form fails loudly instead of filling the owner's list with enquiries nobody can answer.\n\n===== Distances are estimates =====\n\nA straight line adjusted for roads, not a routed drive time, and the page says so: \"about 6.4 mi\".\n",
   "toc": [
    {
     "id": "a_tap_is_not_a_call",
     "text": "A tap is not a call"
    },
    {
     "id": "no_text_without_consent",
     "text": "No text without consent"
    },
    {
     "id": "never_invent_a_client_fact",
     "text": "Never invent a client fact"
    },
    {
     "id": "a_lead_needs_a_name_and_a_phone_number",
     "text": "A lead needs a name and a phone number"
    },
    {
     "id": "distances_are_estimates",
     "text": "Distances are estimates"
    }
   ],
   "words": 173
  },
  {
   "id": "launch_checklist",
   "title": "Launch checklist",
   "html": "<div>\n<p>\nRun it top to bottom the day before a site goes live. Anything that fails waits for the next day.\n</p>\n</div>\n<h2 id=\"the_page\">The page</h2>\n<div>\n<ul>\n<li>Build every site: <code>node build.js</code>\n</li>\n<li>Check both sizes, 400 by 860 and 1280 by 900: <code>node tools/check.js</code>\n</li>\n<li>Open the screenshots in <code>.check/</code> and look at them. A pass is not the end.\n</li>\n<li>Run the unslop audit on the home page: <code>node tools/slop.js dist/&lt;site&gt;</code>\n</li>\n</ul>\n</div>\n<h2 id=\"the_facts\">The facts</h2>\n<div>\n<ul>\n<li>Every price, hour and promise on the page came from the client, in writing.\n</li>\n<li>The phone number calls the client, and the form reaches the owner&#039;s list.\n</li>\n<li>Distances say “about”.\n</li>\n</ul>\n</div>\n<h2 id=\"the_owner\">The owner</h2>\n<div>\n<ul>\n<li>The owner can sign in to the panel and change their hours and notice banner.\n</li>\n<li>They know a tap on their number is counted as a tap, not a call.\n</li>\n</ul>\n<blockquote><div class=\"no\">\nIf something on this list cannot be ticked, the launch moves. The client hears it from us first.</div></blockquote>\n</div>",
   "raw": "====== Launch checklist ======\n\nRun it top to bottom the day before a site goes live. Anything that fails waits for the next day.\n\n===== The page =====\n\n  * Build every site: ''node build.js''\n  * Check both sizes, 400 by 860 and 1280 by 900: ''node tools/check.js''\n  * Open the screenshots in ''.check/'' and look at them. A pass is not the end.\n  * Run the unslop audit on the home page: ''node tools/slop.js dist/<site>''\n\n===== The facts =====\n\n  * Every price, hour and promise on the page came from the client, in writing.\n  * The phone number calls the client, and the form reaches the owner's list.\n  * Distances say \"about\".\n\n===== The owner =====\n\n  * The owner can sign in to the panel and change their hours and notice banner.\n  * They know a tap on their number is counted as a tap, not a call.\n\n> If something on this list cannot be ticked, the launch moves. The client hears it from us first.\n",
   "toc": [
    {
     "id": "the_page",
     "text": "The page"
    },
    {
     "id": "the_facts",
     "text": "The facts"
    },
    {
     "id": "the_owner",
     "text": "The owner"
    }
   ],
   "words": 147
  },
  {
   "id": "checking",
   "title": "How we check a page",
   "html": "<div>\n<p>\nThree audits, each answering one question. Run all three; then look, because none of them can see everything.\n</p>\n</div>\n<h2 id=\"is_it_usable\">Is it usable?</h2>\n<div>\n<pre class=\"code\">node tools/check.js dist/hvac</pre>\n<p>\nContrast, tap size, gutters, 16px fields, sideways scroll, broken images, text running into text, a control hidden under a floating button. Both sizes, every time.\n</p>\n</div>\n<h2 id=\"does_it_look_made_by_someone\">Does it look made by someone?</h2>\n<div>\n<pre class=\"code\">node tools/slop.js dist/hvac</pre>\n<p>\nThe 18 tells of a page an AI made by default, a score, and the one thing to fix first.\n</p>\n</div>\n<h2 id=\"does_it_move_well\">Does it move well?</h2>\n<div>\n<pre class=\"code\">node tools/motion.js app-style/examples/tickets</pre>\n<p>\nIt presses through the page, measures every animation, and photographs each one frame by frame.\n</p>\n</div>",
   "raw": "====== How we check a page ======\n\nThree audits, each answering one question. Run all three; then look, because none of them can see everything.\n\n===== Is it usable? =====\n\n<code>\nnode tools/check.js dist/hvac\n</code>\n\nContrast, tap size, gutters, 16px fields, sideways scroll, broken images, text running into text, a control hidden under a floating button. Both sizes, every time.\n\n===== Does it look made by someone? =====\n\n<code>\nnode tools/slop.js dist/hvac\n</code>\n\nThe 18 tells of a page an AI made by default, a score, and the one thing to fix first.\n\n===== Does it move well? =====\n\n<code>\nnode tools/motion.js app-style/examples/tickets\n</code>\n\nIt presses through the page, measures every animation, and photographs each one frame by frame.\n",
   "toc": [
    {
     "id": "is_it_usable",
     "text": "Is it usable?"
    },
    {
     "id": "does_it_look_made_by_someone",
     "text": "Does it look made by someone?"
    },
    {
     "id": "does_it_move_well",
     "text": "Does it move well?"
    }
   ],
   "words": 100
  },
  {
   "id": "photos",
   "title": "Photos: where they come from",
   "html": "<div>\n<p>\nThe client&#039;s own photos first. Until they arrive, free-licence stand-ins, credited, and never of the wrong thing.\n</p>\n<ol>\n<li>Look at a contact sheet before using anything: <code>python3 tools/photos.py try &lt;ids&gt;</code>\n</li>\n<li>Fetch the ones that fit, with credits: <code>python3 tools/photos.py fetch &lt;folder&gt; name=&lt;id&gt;</code>\n</li>\n<li>No other brand&#039;s packaging in a stand-in.\n</li>\n<li>On a dark screen, grade the photo to about 70% brightness.\n</li>\n</ol>\n</div>",
   "raw": "====== Photos: where they come from ======\n\nThe client's own photos first. Until they arrive, free-licence stand-ins, credited, and never of the wrong thing.\n\n  - Look at a contact sheet before using anything: ''python3 tools/photos.py try <ids>''\n  - Fetch the ones that fit, with credits: ''python3 tools/photos.py fetch <folder> name=<id>''\n  - No other brand's packaging in a stand-in.\n  - On a dark screen, grade the photo to about 70% brightness.\n",
   "toc": [],
   "words": 59
  }
 ]
};
