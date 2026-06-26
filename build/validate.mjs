// Validates that data/guide.json is well-formed and that the generated
// index.html / artifact contain the expected structure. Run AFTER build.mjs.
// Exits non-zero on a fatal problem. External link check is non-fatal (warnings).
//
//   node build/validate.mjs
//
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const errors = [];

// 1. guide.json must be valid JSON with required fields
let data;
try {
  data = JSON.parse(readFileSync(join(ROOT, 'data', 'guide.json'), 'utf8'));
} catch (e) {
  console.error('FATAL: data/guide.json is not valid JSON:', e.message);
  process.exit(1);
}
for (const f of ['meta', 'hero', 'mentalModel', 'sections', 'recipes', 'reference', 'footer']) {
  if (!data[f]) errors.push(`missing field: ${f}`);
}

const cardCount = (data.sections || []).reduce((n, s) => n + (s.cards ? s.cards.length : 0), 0);
if (cardCount === 0) errors.push('no cards found in sections');

// 2. generated files must exist and contain key markers
let index = '';
let artifact = '';
try {
  index = readFileSync(join(ROOT, 'index.html'), 'utf8');
  artifact = readFileSync(join(ROOT, 'claude-guide', 'skills-agents-guide.html'), 'utf8');
} catch (e) {
  console.error('FATAL: generated files missing. Run `node build/build.mjs` first. ' + e.message);
  process.exit(1);
}

const markers = ['id="q"', 'id="updated"', 'id="count"', 'id="noresults"', 'class="update-btn"', '<script>', '</script>'];
for (const m of markers) if (!index.includes(m)) errors.push(`index.html missing marker: ${m}`);
if (!index.trimStart().startsWith('<!doctype html>')) errors.push('index.html missing <!doctype html>');
if (!index.includes('</html>')) errors.push('index.html missing </html>');

// 3. rendered card count must match the data
const cardOccur = (index.match(/class="card"/g) || []).length;
if (cardOccur !== cardCount) errors.push(`card count mismatch: json=${cardCount}, html=${cardOccur}`);

// 4. every card title and source URL must appear in the output
for (const s of data.sections) for (const c of s.cards) {
  if (!index.includes(c.title)) errors.push(`card title not rendered: ${c.title}`);
}
for (const src of data.footer.sources) {
  if (!index.includes(src.url)) errors.push(`source url missing from index.html: ${src.url}`);
}

// 5. artifact fragment sanity
if (!artifact.includes('<title>')) errors.push('artifact missing <title>');
if (!artifact.includes('class="page"')) errors.push('artifact missing .page');

if (errors.length) {
  console.error('Validation FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(`Validation OK  (cards=${cardCount}, sources=${data.footer.sources.length})`);

// 6. external doc links — non-fatal, warnings only
const urls = [...new Set(data.footer.sources.map((s) => s.url))];
const results = await Promise.allSettled(
  urls.map(async (u) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    try {
      const r = await fetch(u, { method: 'GET', redirect: 'follow', signal: ctrl.signal });
      return { u, status: r.status };
    } finally {
      clearTimeout(timer);
    }
  })
);
for (const r of results) {
  if (r.status === 'fulfilled') {
    if (r.value.status >= 400) console.warn(`::warning::link ${r.value.u} -> HTTP ${r.value.status}`);
    else console.log(`  link OK ${r.value.status}  ${r.value.u}`);
  } else {
    console.warn(`::warning::link fetch failed: ${r.reason}`);
  }
}
