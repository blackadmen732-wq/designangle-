# Writes a DokuWiki's pages as data.js for the redesign: window.WIKI = {...}.
# Each page's HTML is DokuWiki's own rendering (do=export_xhtmlbody), so the
# redesign shows exactly what the wiki shows; the source (do=export_raw) is
# what the editor edits.
#   python3 export.py http://127.0.0.1:8140 > ../data.js
import sys, re, json, urllib.request, datetime, html

BASE = sys.argv[1].rstrip('/') + '/doku.php?id='
PAGES = ['start', 'client_rules', 'launch_checklist', 'checking', 'photos']
get = lambda q: urllib.request.urlopen(BASE + q).read().decode('utf-8')

pages = []
for pid in PAGES:
    body = get(pid + '&do=export_xhtmlbody')
    body = re.sub(r'<!-- EDIT\{.*?\} -->', '', body)                 # section-edit markers
    body = re.sub(r'\s*class="(sectionedit\d+|level\d)"', '', body)  # DokuWiki's layout classes
    body = re.sub(r'<div class="li">\s*(.*?)\s*</div>', r'\1', body, flags=re.S)
    body = re.sub(r'href="[^"]*?doku\.php\?id=([a-z_]+)"[^>]*', r'href="#/\1" data-page="\1"', body)
    body = re.sub(r'\n\s*\n+', '\n', body).strip()
    title = html.unescape(re.search(r'<h1[^>]*>(.*?)</h1>', body).group(1))
    body = re.sub(r'<h1[^>]*>.*?</h1>\s*', '', body, count=1)         # the title is set apart
    raw = get(pid + '&do=export_raw')
    heads = [(m.group(2), html.unescape(m.group(3))) for m in re.finditer(r'<h(2)[^>]*id="([^"]+)"[^>]*>(.*?)</h2>', body)]
    words = len(re.sub(r'<[^>]+>', ' ', body).split())
    pages.append({'id': pid, 'title': title, 'html': body, 'raw': raw, 'toc': [{'id': i, 'text': t} for i, t in heads], 'words': words})

out = {'wiki': 'Studio handbook', 'exported': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='minutes'),
       'source': 'DokuWiki stable (2026-07-14c), seeded by seed.sh with the kit\'s own rules. The studio is invented.', 'pages': pages}
print('// Exported from a DokuWiki by source/export.py. The rules are the kit\'s; the studio is invented.')
print('window.WIKI = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';')
