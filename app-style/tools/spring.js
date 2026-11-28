#!/usr/bin/env node
/**
 * A spring, as a CSS easing.
 *
 * CSS cannot run a spring, but linear() can follow one: sample the spring's
 * path, keep the points that matter, and pair the curve with the time the
 * spring takes to settle. Apple describes springs by two numbers, and so
 * does this:
 *
 *   damping   1 settles without overshoot; 0.8 overshoots by about 1.5%
 *   response  seconds; how quickly it gets there (not the duration)
 *
 *   node app-style/tools/spring.js              the springs tokens/tokens.css uses
 *   node app-style/tools/spring.js 0.8 0.3      any other
 *
 * Prints the linear() curve, the duration to pair it with, and when the
 * motion is 95% done, which is when it reads as finished.
 */

function path(zeta, response) {
  const w0 = (2 * Math.PI) / response;
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return (t) => 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  if (zeta === 1) return (t) => 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const s = w0 * Math.sqrt(zeta * zeta - 1), r1 = -zeta * w0 + s, r2 = -zeta * w0 - s;
  const a = -r2 / (r2 - r1), b = -1 - a;
  return (t) => 1 + a * Math.exp(r1 * t) + b * Math.exp(r2 * t);
}

// Keep only the points a straight line between neighbours cannot stand in
// for (Ramer-Douglas-Peucker), so the curve stays short.
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let worst = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const y = a[1] + ((b[1] - a[1]) * (p[0] - a[0])) / (b[0] - a[0]);
    const d = Math.abs(p[1] - y);
    if (d > worst) { worst = d; at = i; }
  }
  if (worst <= tol) return [a, b];
  return [...simplify(pts.slice(0, at + 1), tol).slice(0, -1), ...simplify(pts.slice(at), tol)];
}

function spring(zeta, response, { settle = 0.001, tol = 0.002 } = {}) {
  const x = path(zeta, response);
  let end = 0;
  for (let t = 0; t <= 5; t += 0.001) if (Math.abs(x(t) - 1) >= settle) end = t;
  const ms = Math.ceil((end * 1000) / 10) * 10;
  let done95 = 0;
  for (let t = 0; t <= end; t += 0.001) if (x(t) >= 0.95) { done95 = t; break; }
  const pts = [];
  for (let i = 0; i <= 1000; i++) { const f = i / 1000; pts.push([f, f === 1 ? 1 : x(f * ms / 1000)]); }
  const kept = simplify(pts, tol);
  const n = (v) => +v.toFixed(4);
  const css = 'linear(' + kept.map(([f, v], i) => (i === 0 || i === kept.length - 1) ? String(n(v)) : `${n(v)} ${+(f * 100).toFixed(2)}%`).join(', ') + ')';
  return { css, ms, done95: Math.round(done95 * 1000), points: kept.length };
}

module.exports = { spring };

if (require.main === module) {
  const [d, r] = process.argv.slice(2).map(Number);
  const list = d ? [[`damping ${d}, response ${r}`, d, r]] : [
    ['--spring       moves: a screen pushed in, a shared element, a bar filling', 1, 0.3],
    ['--spring-sheet sheets: a little overshoot, as a thrown sheet has', 0.8, 0.3],
  ];
  for (const [label, zeta, response] of list) {
    const s = spring(zeta, response);
    console.log(`${label}\n  ${s.ms}ms, reads as done at ${s.done95}ms, ${s.points} points\n  ${s.css}\n`);
  }
}
