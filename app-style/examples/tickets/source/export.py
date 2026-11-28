# Writes a Trac project's tickets, conversations, attachments and milestones
# as data.js for the redesign to read: window.TRAC = {...}. A script, not
# JSON, so the page also works opened straight from disk.
#
#   python export.py path/to/env > ../data.js
import sys, json, sqlite3, datetime, os

env = sys.argv[1]
db = sqlite3.connect(os.path.join(env, 'db', 'trac.db'))
db.row_factory = sqlite3.Row
iso = lambda us: datetime.datetime.fromtimestamp(us / 1e6, datetime.timezone.utc).isoformat(timespec='seconds') if us else None

tickets = []
for r in db.execute('select * from ticket order by id'):
    t = {k: r[k] for k in ('id', 'summary', 'type', 'priority', 'component', 'owner', 'reporter',
                           'milestone', 'status', 'resolution', 'description')}
    t['opened'], t['changed'] = iso(r['time']), iso(r['changetime'])
    events = {}
    for c in db.execute('select * from ticket_change where ticket = ? order by time', (r['id'],)):
        e = events.setdefault(c['time'], {'at': iso(c['time']), 'author': c['author'], 'comment': '', 'changes': []})
        if c['field'] == 'comment': e['comment'] = c['newvalue'] or ''
        else: e['changes'].append({'field': c['field'], 'from': c['oldvalue'], 'to': c['newvalue']})
    t['events'] = list(events.values())
    t['attachments'] = [{'name': a['filename'], 'size': a['size'], 'at': iso(a['time']), 'author': a['author'],
                         'note': a['description']}
                        for a in db.execute("select * from attachment where type = 'ticket' and id = ?", (str(r['id']),))]
    tickets.append(t)

milestones = [{'name': m['name'], 'due': iso(m['due']), 'completed': iso(m['completed']), 'description': m['description']}
              for m in db.execute('select * from milestone order by due')]

out = {
    'project': 'Northwind website',
    'exported': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
    'source': 'Trac 1.6, seeded by seed.py. Invented studio, people and tickets.',
    'milestones': milestones,
    'components': [c[0] for c in db.execute('select name from component order by name')],
    'people': sorted({t['owner'] for t in tickets} | {t['reporter'] for t in tickets}),
    'tickets': tickets,
}
print('// Exported from a Trac 1.6 project by source/export.py. Invented data; see source/seed.py.')
print('window.TRAC = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';')
