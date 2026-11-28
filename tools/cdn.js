/*
 * A CDN mirror for the checks. The sites load GSAP and Lenis from cdnjs and
 * jsDelivr; where a sandbox blocks those hosts, a check would test a page no
 * visitor sees. This serves the same file, same version, from the npm package
 * instead (npm is almost always reachable), cached in .check/cdn/.
 *
 *   const { mirror } = require('./cdn');
 *   await mirror(page);        // before page.goto
 *
 * The live CDN is tried first; npm only stands in when it fails. Each file
 * served from npm is listed in mirror.served, so a check can say so.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CACHE = path.join(__dirname, '..', '.check', 'cdn');
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com\/ajax\/libs\/([^/]+)\/([^/]+)\/(.+)|cdn\.jsdelivr\.net\/npm\/((?:@[^/]+\/)?[^@/]+)@([^/]+)\/(.+)|unpkg\.com\/((?:@[^/]+\/)?[^@/]+)@([^/]+)\/(.+))$/;

function unpack(name, version) {
  const dir = path.join(CACHE, `${name.replace('/', '__')}@${version}`);
  if (fs.existsSync(path.join(dir, 'package', 'package.json'))) return path.join(dir, 'package');
  fs.mkdirSync(dir, { recursive: true });
  const tgz = execFileSync('npm', ['pack', `${name}@${version}`, '--silent'], { cwd: dir, encoding: 'utf8' }).trim().split('\n').pop();
  execFileSync('tar', ['xzf', tgz], { cwd: dir });
  return path.join(dir, 'package');
}

// cdnjs names the file, not its place in the package: look for it, dist first.
function find(root, rel) {
  const direct = path.join(root, rel);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  const base = path.basename(rel), hits = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === base) hits.push(p); } };
  walk(root);
  return hits.sort((a, b) => (a.includes(`${path.sep}dist${path.sep}`) ? 0 : 1) - (b.includes(`${path.sep}dist${path.sep}`) ? 0 : 1) || a.length - b.length)[0];
}

async function mirror(page) {
  mirror.served = mirror.served || new Set();
  await page.route(CDN, async (route) => {
    const url = route.request().url();
    try { return await route.fulfill({ response: await route.fetch({ timeout: 4000 }) }); } catch {}
    const m = url.match(CDN);
    const [name, version, rel] = m[2] ? [m[2], m[3], m[4]] : m[5] ? [m[5], m[6], m[7]] : [m[8], m[9], m[10]];
    try {
      const file = find(unpack(name, version), rel.split('?')[0]);
      if (!file) throw new Error('not in package');
      mirror.served.add(`${name}@${version}`);
      const type = file.endsWith('.css') ? 'text/css' : 'application/javascript';
      return route.fulfill({ status: 200, contentType: type, body: fs.readFileSync(file) });
    } catch {
      return route.abort();
    }
  });
}

module.exports = { mirror };
