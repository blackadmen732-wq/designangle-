# Writes a Kanboard project as data.js for the redesign: window.KB = {...}.
#   python3 export.py http://127.0.0.1:8130 > ../data.js
import sys, json, base64, urllib.request, datetime

URL = sys.argv[1].rstrip('/') + '/jsonrpc.php'
AUTH = 'Basic ' + base64.b64encode(b'admin:admin').decode()
_id = 0
def call(method, **params):
    global _id; _id += 1
    req = urllib.request.Request(URL, json.dumps({'jsonrpc': '2.0', 'method': method, 'id': _id, 'params': params}).encode(),
                                 {'Content-Type': 'application/json', 'Authorization': AUTH})
    return json.load(urllib.request.urlopen(req))['result']
iso = lambda ts: datetime.datetime.fromtimestamp(int(ts), datetime.timezone.utc).isoformat(timespec='minutes') if ts and int(ts) else None

pid = 1
project = call('getProjectById', project_id=pid)
users = {int(u['id']): u['name'] or u['username'] for u in call('getAllUsers')}
cats = {int(c['id']): c['name'] for c in call('getAllCategories', project_id=pid)}
cols = [{'id': int(c['id']), 'title': c['title']} for c in call('getColumns', project_id=pid)]
tasks = []
for status in (1, 0):
    for t in call('getAllTasks', project_id=pid, status_id=status):
        tid = int(t['id'])
        tasks.append({
            'id': tid, 'title': t['title'], 'description': t['description'], 'column': int(t['column_id']), 'position': int(t['position']),
            'owner': users.get(int(t['owner_id'] or 0)), 'category': cats.get(int(t['category_id'] or 0)), 'color': t['color_id'],
            'score': int(t['score'] or 0), 'due': iso(t['date_due']), 'created': iso(t['date_creation']), 'open': status == 1,
            # Kanboard's subtask status: 0 to do, 1 in progress, 2 done.
            'subtasks': [{'title': s['title'], 'status': int(s['status'])} for s in call('getAllSubtasks', task_id=tid)],
            'comments': [{'who': users.get(int(c['user_id'])), 'text': c['comment'], 'at': iso(c['date_creation'])} for c in call('getAllComments', task_id=tid)],
        })
out = {'project': project['name'], 'description': project['description'], 'exported': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='minutes'),
       'source': 'Kanboard 1.2.57, seeded by seed.py. Invented studio, people and tasks.', 'columns': cols, 'tasks': sorted(tasks, key=lambda t: (t['column'], t['position'])),
       'people': sorted({t['owner'] for t in tasks if t['owner']})}
print('// Exported from a Kanboard 1.2.57 project by source/export.py. Invented data; see source/seed.py.')
print('window.KB = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';')
