# Copies the icons a standalone page uses from app-style/app-icons.css into the
# page itself, between the markers /*ICONS*/ and /*/ICONS*/ in its <style>.
# For pages deployed on their own, such as the owner panel:
#
#   python3 app-style/tools/inline-icons.py portal/app/index.html
#
# Run it again after adding an icon to the page or changing one in the set.
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
css = open(os.path.join(here, '..', 'app-icons.css')).read()
page_path = sys.argv[1]
page = open(page_path).read()
used = sorted(set(re.findall(r'\bic-([a-z0-9-]+)', page)) | set(re.findall(r"ICON\('([a-z0-9-]+)'\)", page)))
base = re.search(r'^\.ic \{.*?\}\s*$', css, re.S | re.M).group(0)
rules = [base.strip()]
missing = []
for name in used:
    m = re.search(r'^\.ic-' + re.escape(name) + r' \{.*\}$', css, re.M)
    if m: rules.append(m.group(0))
    else: missing.append(name)
block = '/*ICONS*/\n/* Copied from app-style/app-icons.css by app-style/tools/inline-icons.py. */\n' + '\n'.join(rules) + '\n/*/ICONS*/'
if '/*/ICONS*/' in page:
    page = re.sub(r'/\*ICONS\*/.*?/\*/ICONS\*/', lambda _: block, page, flags=re.S)
else:
    page = page.replace('/*ICONS*/', block, 1)
open(page_path, 'w').write(page)
print(f'{len(rules) - 1} icons copied into {page_path}' + (f'; not in the set: {", ".join(missing)}' if missing else ''))
