// AI を使わない「更新監視」スクリプト（GITHUB_TOKEN だけで動く）。
// 公式ドキュメントのシグネチャ（ETag / Last-Modified / 本文ハッシュ）を記録し、
// 前回から変化したページを検知する。中身の書き換えはしない。
//
//   node build/watch-docs.mjs
//
// 出力:
//   - data/sources.lock.json を更新（ベースライン）
//   - 変化があれば .github/watch-changed.md（Issue本文）を生成
//   - GITHUB_OUTPUT に changed=true|false を書き出す（CI用）
//
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const LOCK = join(ROOT, 'data', 'sources.lock.json');

// 監視対象（公式ドキュメント）
const WATCH = [
  'https://code.claude.com/docs/en/skills',
  'https://code.claude.com/docs/en/best-practices',
  'https://claude.com/blog/subagents-in-claude-code',
  'https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills',
];

// 揮発しやすい部分（script/style）を除いて安定したハッシュにする
function stripVolatile(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function signatureOf(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': 'docs-watch-bot' },
    });
    const etag = r.headers.get('etag');
    const lastmod = r.headers.get('last-modified');
    if (etag) return { method: 'etag', value: etag.replace(/"/g, ''), status: r.status };
    if (lastmod) return { method: 'last-modified', value: lastmod, status: r.status };
    const body = await r.text();
    const hash = createHash('sha256').update(stripVolatile(body)).digest('hex').slice(0, 16);
    return { method: 'hash', value: hash, status: r.status };
  } finally {
    clearTimeout(timer);
  }
}

const lock = existsSync(LOCK) ? JSON.parse(readFileSync(LOCK, 'utf8')) : {};
const baselineMode = Object.keys(lock).length === 0;
const next = {};
const changes = [];

for (const url of WATCH) {
  let sig;
  try {
    sig = await signatureOf(url);
  } catch (e) {
    console.warn(`fetch failed: ${url} (${e.message}) — keep previous signature`);
    next[url] = lock[url] || null;
    continue;
  }
  next[url] = sig;
  const prev = lock[url];
  if (prev && prev.value !== sig.value) {
    changes.push({ url, prev: prev.value, now: sig.value, method: sig.method });
  }
}

writeFileSync(LOCK, JSON.stringify(next, null, 2) + '\n');

const changed = changes.length > 0;
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
}

if (baselineMode) {
  console.log(`Baseline established for ${WATCH.length} sources (no notification).`);
} else if (changed) {
  const body =
    [
      '公式ドキュメントに変更が検知されました。手元の Claude Code で `/update-guide` を実行し、`data/guide.json` を更新してください。',
      '',
      '## 変更されたページ',
      ...changes.map((c) => `- ${c.url}  （検知方法: ${c.method}）`),
      '',
      '_docs-watch ワークフローによる自動検知です。中身の自動書き換えは行っていません。_',
    ].join('\n') + '\n';
  writeFileSync(join(ROOT, '.github', 'watch-changed.md'), body);
  console.log(`CHANGED: ${changes.length} source(s)`);
  for (const c of changes) console.log(` - ${c.url}`);
} else {
  console.log('No changes detected.');
}
