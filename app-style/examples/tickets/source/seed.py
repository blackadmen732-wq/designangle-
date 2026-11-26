# Fills a fresh Trac 1.6 project with the tickets a small web studio would
# have the week before launching a client site. Everything here is invented:
# the studio, the people (Sam, Priya, Jo) and the client (Northwind Heating &
# Air, the kit's example HVAC site). The rules the tickets argue about are the
# kit's own (CLAUDE.md), and ticket 10 is a real bug in sites/hvac.
#
#   python -m venv venv && . venv/bin/activate
#   pip install trac==1.6 'setuptools<70'
#   trac-admin env initenv "Northwind website" sqlite:db/trac.db
#   python seed.py env
#   tracd --port 8123 env          # the "before": http://127.0.0.1:8123/env/
#   python export.py env > ../data.js
import sys, io, datetime, os
from trac.env import Environment
from trac.ticket.model import Ticket, Milestone, Component
from trac.attachment import Attachment
from trac.util.datefmt import utc

env = Environment(sys.argv[1])
now = datetime.datetime.now(utc)
ago = lambda hours: now - datetime.timedelta(hours=hours)

for name in ('component1', 'component2'):
    try: Component(env, name).delete()
    except Exception: pass
for name in ('Booking form', 'Owner panel', 'Hero and photos', 'Speed', 'Copy'):
    c = Component(env); c.name = name; c.owner = 'sam'; c.insert()
for name in ('milestone1', 'milestone2', 'milestone3', 'milestone4'):
    try: Milestone(env, name).delete()
    except Exception: pass
for name, due, desc in (('Launch', 6, 'The site goes live for Northwind Heating & Air.'),
                        ('Winter care plan', 30, 'The care plan page and its price list.')):
    m = Milestone(env); m.name = name; m.due = now + datetime.timedelta(days=due); m.description = desc; m.insert()

# summary, type, priority, component, owner, milestone, status, description,
# then the conversation: (hours after it was opened, author, comment, new status)
rows = [
 ('Booking form accepts a lead with no phone number', 'defect', 'blocker', 'Booking form', 'sam', 'Launch', 'new',
  'Submitting with the phone field empty still shows "Thanks". A lead needs a name and a phone number, and the collector refuses one without them, so the form must not say thanks first.',
  [(2, 'jo', 'Seen in Safari and Chrome. The thank-you screen shows and nothing reaches the owner\'s list.', None),
   (5, 'sam', 'The collector does refuse it. The form shows Thanks before the reply comes back. Changing it to wait for the reply.', None)]),
 ('Hero photo takes 4 seconds on a phone over 3G', 'defect', 'critical', 'Speed', 'priya', 'Launch', 'new',
  'thermostat.webp is 1.8 MB. Export at quality 74, max 1600px.',
  [(10, 'sam', 'Priya, can you take this one?', 'assigned'),
   (14, 'priya', 'Exported at quality 74 and 1600px wide: 1.8 MB down to 212 KB.', None),
   (15, 'jo', 'Is that enough on a phone?', None),
   (18, 'priya', 'Testing on a throttled 3G profile next, then adding an 800px version for phones.', None)]),
 ('Owner panel: call taps shown as calls', 'defect', 'critical', 'Owner panel', 'sam', 'Launch', 'new',
  'The weekly email says "45 calls". They are taps on the number, not calls.',
  [(6, 'sam', 'Taps live in mk_events and real calls in mk_calls. The email will say "45 taps on your number" and leave calls out until a call line is connected.', 'accepted')]),
 ('Add Saturday hours to the footer', 'enhancement', 'minor', 'Copy', 'jo', 'Launch', 'new', 'Saturday 08:00 to 16:00, as the client wrote.', []),
 ('Distance shows "6.4 mi" with no "about"', 'defect', 'major', 'Booking form', 'priya', 'Launch', 'new',
  'Distances are estimates and must say so.',
  [(3, 'jo', 'Should read "about 6.4 mi". It is a straight line adjusted for roads, not a drive time.', None)]),
 ('Price list: care plan from $19 a month', 'enhancement', 'major', 'Copy', 'jo', 'Winter care plan', 'new', 'The client confirmed the price by email.', []),
 ('Owner panel blank when the client library fails to load', 'defect', 'major', 'Owner panel', 'sam', 'Launch', 'new',
  'With the CDN blocked the panel is an empty page.',
  [(20, 'sam', 'Fixed: the panel now says it could not load, and what to do.', 'closed')]),
 ('Swap the van photo into the story section', 'task', 'trivial', 'Hero and photos', 'jo', 'Winter care plan', 'new', 'The client sent a new photo.', []),
 ('Notice banner for the Thanksgiving closure', 'task', 'minor', 'Owner panel', 'sam', 'Launch', 'new', 'Hide it after Nov 28.',
  [(8, 'sam', 'Picked this up.', 'assigned')]),
 ('Six ways heading touches the left edge on phones', 'defect', 'major', 'Hero and photos', 'priya', 'Launch', 'new',
  'On a phone the "What we fit" label and the "Six ways" heading sit at 0px from the left edge. Screenshot attached.',
  [(1, 'priya', 'When the scroll script does not load, the section falls back to a plain row and loses its padding.', None)]),
 ('Emergency line copy: "24 hours" not "24/7"', 'task', 'minor', 'Copy', 'jo', 'Launch', 'new', 'Use the client\'s own words.',
  [(12, 'jo', 'Done.', 'closed')]),
 ('Reviews section: client has no reviews to show yet', 'enhancement', 'minor', 'Copy', 'jo', 'Winter care plan', 'new',
  'Do not invent any. Hide the section until there are real ones.', []),
]

here = os.path.dirname(os.path.abspath(__file__))
for i, (summary, typ, pri, comp, owner, ms, status, desc, talk) in enumerate(rows):
    opened = ago(64 - i * 4.5)
    t = Ticket(env)
    t['summary'], t['type'], t['priority'], t['component'] = summary, typ, pri, comp
    t['owner'], t['milestone'], t['reporter'], t['description'] = owner, ms, 'jo', desc
    t['status'] = status
    t.insert(when=opened)
    for hours, author, comment, new_status in talk:
        if new_status:
            t['status'] = new_status
            if new_status == 'closed': t['resolution'] = 'fixed'
        t.save_changes(author, comment, when=opened + datetime.timedelta(hours=hours))
    if t.id == 10:
        shot = os.path.join(here, '..', 'img', 'six-ways-phone.webp')
        a = Attachment(env, 'ticket', t.id)
        a.author, a.description = 'priya', 'A phone, 393 wide, with the scroll script blocked.'
        with open(shot, 'rb') as f:
            data = f.read()
        a.insert('six-ways-phone.webp', io.BytesIO(data), len(data), t=opened + datetime.timedelta(minutes=20))
print('seeded', len(rows), 'tickets')
