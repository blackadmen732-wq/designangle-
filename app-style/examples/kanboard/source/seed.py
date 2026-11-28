# Fills a fresh Kanboard (1.2.57) with the board a small web studio would keep
# for one client: the kit's invented restaurant, Pomelo Kitchen. Everything is
# invented: the studio, Sam, Priya and Jo, and the tasks.
#
#   git clone --depth 1 --branch v1.2.57 https://github.com/kanboard/kanboard
#   cd kanboard && php -S 127.0.0.1:8130          # admin / admin
#   python3 seed.py http://127.0.0.1:8130          # the "before": the board
#   python3 export.py http://127.0.0.1:8130 > ../data.js
import sys, json, base64, urllib.request, datetime

URL = sys.argv[1].rstrip('/') + '/jsonrpc.php'
AUTH = 'Basic ' + base64.b64encode(b'admin:admin').decode()
_id = 0
def call(method, **params):
    global _id; _id += 1
    req = urllib.request.Request(URL, json.dumps({'jsonrpc': '2.0', 'method': method, 'id': _id, 'params': params}).encode(),
                                 {'Content-Type': 'application/json', 'Authorization': AUTH})
    r = json.load(urllib.request.urlopen(req))
    if 'error' in r: raise SystemExit(f'{method}: {r["error"]}')
    return r['result']

people = {}
for u, name in (('sam', 'Sam'), ('priya', 'Priya'), ('jo', 'Jo')):
    people[u] = call('createUser', username=u, password='pomelo-kitchen', name=name, email=f'{u}@example.com')
pid = call('createProject', name='Pomelo Kitchen website', description='The restaurant site: menu, bookings, the story, the photos.')
for uid in people.values(): call('addProjectUser', project_id=pid, user_id=uid, role='project-member')
cols = {c['title']: int(c['id']) for c in call('getColumns', project_id=pid)}
cats = {n: call('createCategory', project_id=pid, name=n) for n in ('Menu', 'Bookings', 'Photos', 'Copy', 'Speed')}
day = lambda d: (datetime.date.today() + datetime.timedelta(days=d)).isoformat() + ' 17:00'

# title, column, owner, category, colour, due in days, score, description, subtasks, comments
tasks = [
 ('Winter menu: add the six new plates', 'Work in progress', 'jo', 'Menu', 'orange', 2, 3,
  'Six plates from the chef\'s note, with prices as she sent them.', ['Names and descriptions', 'Prices', 'Photos from Thursday\'s shoot'],
  [('jo', 'Prices are in. Waiting for two photos.')]),
 ('Booking form: party size above 8 goes to a call', 'Work in progress', 'sam', 'Bookings', 'red', 1, 5,
  'Groups of nine or more cannot book online. Show the phone number instead of the form.', ['Limit the field', 'Message with the number', 'Test on a phone'],
  [('sam', 'The collector refuses it already. The form needs to say why.')]),
 ('Photograph the dining room at dusk', 'Ready', 'priya', 'Photos', 'blue', 5, 2,
  'The story section needs the room with the lights on. Thursday, 4pm.', [], []),
 ('Hours: Sunday closes at 9, not 10', 'Ready', 'jo', 'Copy', 'yellow', 0, 1,
  'Owner\'s email of the 20th.', [], [('priya', 'Is the footer updated too?')]),
 ('Hero image: 1.6 MB on a phone', 'Ready', 'priya', 'Speed', 'red', 3, 3,
  'pizza.webp loads first on a phone over 3G. Export at 1200 wide, quality 74.', [], []),
 ('Gift cards page', 'Backlog', 'jo', 'Copy', 'green', None, 5, 'The owner wants to sell gift cards before December.', [], []),
 ('Private dining: a page and a form', 'Backlog', 'sam', 'Bookings', 'purple', None, 8, 'For parties of 12 to 30. Needs the owner\'s prices first.', [], []),
 ('Allergen notes on every dish', 'Backlog', 'priya', 'Menu', 'grey', None, 3, 'Only the ones the kitchen confirms. No guesses.', [], []),
 ('Reviews: the owner has none to show yet', 'Backlog', 'jo', 'Copy', 'grey', None, 1, 'Hide the section until there are real ones. Do not write any.', [], []),
 ('Wine list as a page, not a PDF', 'Done', 'sam', 'Menu', 'teal', -3, 3, 'Was a 4 MB PDF. Now a page.', [], [('jo', 'Owner is happy with it.')]),
 ('Map pin on the wrong street', 'Done', 'priya', 'Copy', 'red', -5, 1, 'Fixed: Calle del Pez, not Calle del Pino.', [], []),
 ('Swap stock photos for the owner\'s', 'Done', 'jo', 'Photos', 'blue', -8, 2, 'Every plate photo is now from the kitchen.', [], []),
]
for (title, col, owner, cat, color, due, score, desc, subs, comments) in tasks:
    tid = call('createTask', project_id=pid, title=title, column_id=cols[col], owner_id=people[owner], category_id=cats[cat],
               color_id=color, score=score, description=desc, creator_id=people['jo'], **({'date_due': day(due)} if due is not None else {}))
    for s in subs: call('createSubtask', task_id=tid, title=s, user_id=people[owner], status=1 if s.startswith('Prices') or s.startswith('Limit') else 0)
    for who, text in comments: call('createComment', task_id=tid, user_id=people[who], content=text)
    if col == 'Done': call('closeTask', task_id=tid)
print('seeded project', pid, 'with', len(tasks), 'tasks')
