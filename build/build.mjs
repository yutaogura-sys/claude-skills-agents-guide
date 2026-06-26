// Builds index.html (standalone, for GitHub Pages) and
// claude-guide/skills-agents-guide.html (artifact fragment) from data/guide.json.
// Also refreshes CHANGELOG.md. Single source of truth = data/guide.json.
//
//   node build/build.mjs
//
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'guide.json'), 'utf8'));

// "最終更新" = the most recent changelog date (= when content last changed),
// falling back to today's build date.
const updated =
  (data.changelog && data.changelog[0] && data.changelog[0].date) ||
  new Date().toISOString().slice(0, 10);

const repo = data.meta.repo;
// 更新は手元の Claude Code で /update-guide を実行する運用。
// ボタンは「公式docsの更新通知(Issue)」を確認する導線にする。
const updatesUrl = `https://github.com/${repo}/issues?q=is%3Aissue+is%3Aopen+label%3Adocs-update`;

const STYLE = `<style>
  :root {
    --paper: #F4F6F8;
    --surface: #FFFFFF;
    --ink: #16202E;
    --muted: #59636F;
    --faint: #8A93A0;
    --line: #E3E7EC;
    --line-soft: #EEF1F4;
    --teal: #0F766E;
    --teal-deep: #0A5852;
    --teal-soft: #E2EFED;
    --amber: #9A6B12;
    --amber-soft: #FAF1DC;
    --rust: #A2452A;
    --rust-soft: #F6E7E0;
    --good: #2E7048;
    --shadow: 0 1px 2px rgba(22,32,46,.04), 0 6px 20px rgba(22,32,46,.05);
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic UI", "Yu Gothic", "Meiryo", system-ui, sans-serif;
    --mono: ui-monospace, "SF Mono", "Cascadia Code", Consolas, "Yu Gothic UI", monospace;
  }

  * { box-sizing: border-box; }

  .page {
    font-family: var(--sans);
    color: var(--ink);
    background:
      radial-gradient(1200px 480px at 78% -8%, rgba(15,118,110,.07), transparent 60%),
      var(--paper);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    letter-spacing: .01em;
    padding: 0 20px 80px;
  }

  .wrap { max-width: 1080px; margin: 0 auto; }
  .narrow { max-width: 760px; }

  /* ---- Header ---- */
  header.hero {
    padding: 64px 0 40px;
    border-bottom: 1px solid var(--line);
    margin-bottom: 48px;
  }
  .eyebrow {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--teal-deep);
    margin: 0 0 16px;
  }
  h1 {
    font-size: clamp(30px, 5vw, 46px);
    line-height: 1.18;
    font-weight: 800;
    letter-spacing: -.01em;
    margin: 0 0 18px;
    text-wrap: balance;
  }
  .lede {
    font-size: 17px;
    color: var(--muted);
    margin: 0;
    max-width: 64ch;
  }

  /* ---- Section scaffolding ---- */
  section { margin: 0 0 56px; }
  .sec-head { margin: 0 0 22px; }
  .sec-kicker {
    display: inline-block;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--faint);
    margin: 0 0 8px;
  }
  h2 {
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 800;
    letter-spacing: -.005em;
    margin: 0 0 8px;
    text-wrap: balance;
  }
  .sec-sub { margin: 0; color: var(--muted); font-size: 15.5px; max-width: 70ch; }

  /* ---- Changelog callout ---- */
  .changelog {
    background: var(--teal-soft);
    border: 1px solid #CFE4E1;
    border-radius: 12px;
    padding: 14px 16px;
    margin: 0 0 40px;
  }
  .changelog .cl-head { display: flex; align-items: baseline; gap: 10px; margin: 0 0 6px; flex-wrap: wrap; }
  .changelog .cl-title { font-size: 11.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--teal-deep); }
  .changelog .cl-date { font-size: 12.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
  .changelog ul { margin: 0; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
  .changelog li { font-size: 14px; color: var(--ink); }

  /* ---- Mental model band ---- */
  .compare {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 18px;
  }
  .mm {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 26px 26px 24px;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }
  .mm::before {
    content: "";
    position: absolute; inset: 0 auto 0 0;
    width: 4px;
  }
  .mm.skill::before { background: var(--teal); }
  .mm.agent::before { background: var(--amber); }
  .mm h3 { margin: 0 0 4px; font-size: 19px; font-weight: 800; }
  .mm .gloss { font-size: 13px; color: var(--faint); font-family: var(--mono); margin: 0 0 14px; }
  .mm p { margin: 0 0 14px; color: var(--muted); font-size: 15px; }
  .mm ul { margin: 0; padding-left: 0; list-style: none; display: flex; flex-direction: column; gap: 9px; }
  .mm li { position: relative; padding-left: 22px; font-size: 14.5px; color: var(--ink); }
  .mm li::before {
    content: ""; position: absolute; left: 4px; top: 9px;
    width: 7px; height: 7px; border-radius: 2px;
  }
  .mm.skill li::before { background: var(--teal); }
  .mm.agent li::before { background: var(--amber); }

  /* ---- Card grid ---- */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 16px;
    padding: 22px 22px 20px;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  }
  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(22,32,46,.05), 0 14px 34px rgba(22,32,46,.09);
    border-color: #D5DBE2;
  }
  .tag {
    align-self: flex-start;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: .05em;
    padding: 4px 10px;
    border-radius: 999px;
    margin-bottom: 13px;
  }
  .tag.skill { background: var(--teal-soft); color: var(--teal-deep); }
  .tag.agent { background: var(--amber-soft); color: var(--amber); }
  .card h3 { margin: 0 0 9px; font-size: 18px; font-weight: 800; letter-spacing: -.005em; }
  .card > p { margin: 0 0 14px; color: var(--muted); font-size: 14.5px; }
  .card .spacer { flex: 1; }

  code, .path {
    font-family: var(--mono);
    font-size: 12.5px;
    background: #F0F2F5;
    border: 1px solid var(--line-soft);
    border-radius: 6px;
    padding: 1.5px 6px;
    color: var(--teal-deep);
    word-break: break-all;
  }

  .rec {
    background: var(--amber-soft);
    border-radius: 10px;
    padding: 11px 13px;
    margin-top: 4px;
  }
  .rec .lbl {
    display: block;
    font-size: 10.5px; font-weight: 800; letter-spacing: .12em;
    text-transform: uppercase; color: var(--amber); margin-bottom: 4px;
  }
  .rec p { margin: 0; font-size: 13.8px; color: #5A4517; line-height: 1.6; }

  .note {
    display: flex; gap: 8px; align-items: baseline;
    margin-top: 12px; font-size: 13px; color: var(--rust);
  }
  .note .k { font-weight: 700; white-space: nowrap; }

  /* ---- Recipe rows ---- */
  .recipes { display: flex; flex-direction: column; gap: 14px; }
  .recipe {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 14px;
    box-shadow: var(--shadow);
    padding: 20px 22px;
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 20px;
    align-items: start;
  }
  .recipe h3 { margin: 0; font-size: 17px; font-weight: 800; }
  .recipe .usecase { color: var(--muted); font-size: 13px; margin: 5px 0 0; }
  .chain { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .chip {
    font-size: 13px; font-weight: 600;
    background: #F0F2F5; border: 1px solid var(--line);
    border-radius: 8px; padding: 6px 11px; color: var(--ink);
  }
  .chip.teal { background: var(--teal-soft); border-color: #CFE4E1; color: var(--teal-deep); }
  .chip.amber { background: var(--amber-soft); border-color: #ECDCB5; color: var(--amber); }
  .arrow { color: var(--faint); font-weight: 700; }

  /* ---- Reference table ---- */
  .tablewrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 14px; background: var(--surface); box-shadow: var(--shadow); }
  table { border-collapse: collapse; width: 100%; min-width: 640px; font-size: 14px; }
  th, td { text-align: left; padding: 13px 16px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
  thead th { background: #F8FAFB; font-size: 12px; letter-spacing: .04em; color: var(--muted); text-transform: uppercase; font-weight: 700; }
  tbody tr:last-child td { border-bottom: none; }
  td .path { font-size: 12px; }
  td .feat { font-weight: 700; }

  /* ---- Footer ---- */
  footer {
    border-top: 1px solid var(--line);
    padding-top: 28px;
    color: var(--muted);
    font-size: 13.5px;
  }
  footer h4 { margin: 0 0 10px; font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); }
  footer ul { margin: 0 0 18px; padding-left: 18px; display: flex; flex-direction: column; gap: 5px; }
  footer a { color: var(--teal-deep); text-decoration: none; border-bottom: 1px solid #CFE4E1; }
  footer a:hover { border-bottom-color: var(--teal-deep); }
  .caveat { background: var(--rust-soft); border-radius: 10px; padding: 13px 15px; color: #6E3320; font-size: 13.5px; }

  a:focus-visible, .card:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; border-radius: 6px; }

  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .card:hover { transform: none; }
  }
  @media (max-width: 560px) {
    .recipe { grid-template-columns: 1fr; gap: 12px; }
    header.hero { padding: 44px 0 32px; }
  }

  /* ---- Interactive toolbar ---- */
  .toolbar {
    position: sticky; top: 0; z-index: 30;
    background: rgba(244,246,248,.92);
    -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--line);
    padding: 13px 0; margin: 0 0 40px;
  }
  .tb-inner { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .search { position: relative; flex: 1 1 260px; min-width: 0; }
  .search input {
    width: 100%; font: inherit; font-size: 15px;
    padding: 10px 14px 10px 40px;
    border: 1px solid var(--line); border-radius: 10px;
    background: var(--surface); color: var(--ink);
  }
  .search input::placeholder { color: var(--faint); }
  .search input:focus { outline: none; border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-soft); }
  .search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--faint); }
  .pills { display: flex; gap: 6px; }
  .pill {
    font: inherit; font-size: 13.5px; font-weight: 600;
    padding: 9px 15px; border-radius: 999px;
    border: 1px solid var(--line); background: var(--surface);
    color: var(--muted); cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
  }
  .pill:hover { border-color: #C9D0D8; color: var(--ink); }
  .pill.active { background: var(--ink); color: #fff; border-color: var(--ink); }
  .pill.active[data-cat="skill"] { background: var(--teal-deep); border-color: var(--teal-deep); }
  .pill.active[data-cat="agent"] { background: var(--amber); border-color: var(--amber); }
  .meta { display: flex; align-items: center; gap: 14px; margin-left: auto; white-space: nowrap; }
  .count { font-size: 13px; color: var(--faint); font-variant-numeric: tabular-nums; }
  .updated { font-size: 12.5px; color: var(--faint); }
  .updated b { color: var(--muted); font-weight: 700; font-variant-numeric: tabular-nums; }
  .update-btn {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; font-weight: 700; white-space: nowrap;
    padding: 8px 13px; border-radius: 9px;
    background: var(--teal); color: #fff; text-decoration: none;
    border: 1px solid var(--teal-deep);
    transition: background .15s, transform .1s;
  }
  .update-btn:hover { background: var(--teal-deep); }
  .update-btn:active { transform: translateY(1px); }
  .update-btn:focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }
  .update-btn svg { display: block; }
  .noresults { display: none; text-align: center; color: var(--muted); padding: 48px 0; font-size: 15px; }
  .path { position: relative; }
  .path.copyable { cursor: pointer; }
  .path.copyable:hover { border-color: var(--teal); color: var(--teal); }
  .copied {
    position: absolute; bottom: calc(100% + 6px); left: 50%;
    transform: translateX(-50%) translateY(4px);
    background: var(--ink); color: #fff; font-family: var(--sans);
    font-size: 11px; padding: 3px 8px; border-radius: 6px;
    opacity: 0; transition: opacity .18s, transform .18s; pointer-events: none; white-space: nowrap;
  }
  .copied.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  @media (max-width: 560px) {
    .meta { margin-left: 0; width: 100%; justify-content: space-between; }
  }
</style>`;

const SCRIPT = `<script>
(function () {
  var q = document.getElementById('q');
  var countEl = document.getElementById('count');
  var noResults = document.getElementById('noresults');
  var pills = [].slice.call(document.querySelectorAll('.pill'));
  var cards = [].slice.call(document.querySelectorAll('.catalog .card'));
  var catalogSecs = [].slice.call(document.querySelectorAll('section.catalog'));
  var staticSecs = [].slice.call(document.querySelectorAll('section[data-static]'));
  var cat = 'all';

  function cardCat(card) {
    var t = card.querySelector('.tag');
    if (t && t.classList.contains('skill')) return 'skill';
    if (t && t.classList.contains('agent')) return 'agent';
    return '';
  }

  function apply() {
    var term = (q.value || '').trim().toLowerCase();
    var filtering = term !== '' || cat !== 'all';
    var shown = 0;

    cards.forEach(function (card) {
      var okCat = cat === 'all' || cardCat(card) === cat;
      var okTerm = !term || card.textContent.toLowerCase().indexOf(term) !== -1;
      var vis = okCat && okTerm;
      card.style.display = vis ? '' : 'none';
      if (vis) shown++;
    });

    catalogSecs.forEach(function (sec) {
      var any = [].slice.call(sec.querySelectorAll('.card')).some(function (c) {
        return c.style.display !== 'none';
      });
      sec.style.display = any ? '' : 'none';
    });

    staticSecs.forEach(function (sec) { sec.style.display = filtering ? 'none' : ''; });

    countEl.textContent = filtering ? shown + ' 件' : cards.length + ' 機能';
    noResults.style.display = shown === 0 ? 'block' : 'none';
  }

  q.addEventListener('input', apply);
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      cat = p.getAttribute('data-cat');
      pills.forEach(function (x) {
        var on = x === p;
        x.classList.toggle('active', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
  });

  [].slice.call(document.querySelectorAll('.path')).forEach(function (p) {
    var original = p.textContent;
    p.classList.add('copyable');
    p.setAttribute('title', 'クリックでコピー');
    p.addEventListener('click', function () {
      var text = original;
      var done = function () {
        var tip = document.createElement('span');
        tip.className = 'copied';
        tip.textContent = 'コピーしました';
        p.appendChild(tip);
        requestAnimationFrame(function () { tip.classList.add('show'); });
        setTimeout(function () {
          tip.classList.remove('show');
          setTimeout(function () { if (tip.parentNode) tip.parentNode.removeChild(tip); }, 220);
        }, 1100);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      }
    });
  });

  apply();
})();
</script>`;

// ---- renderers ----
const renderMM = (c) => `        <div class="mm ${c.type}">
          <h3>${c.title}</h3>
          <p class="gloss">${c.gloss}</p>
          <p>${c.intro}</p>
          <ul>
${c.points.map((p) => `            <li>${p}</li>`).join('\n')}
          </ul>
        </div>`;

const renderCard = (card, cat) => {
  const note = card.note
    ? `\n          <div class="note"><span class="k">${card.note.k}</span><span>${card.note.text}</span></div>`
    : '';
  return `        <div class="card">
          <span class="tag ${cat}">${card.tag}</span>
          <h3>${card.title}</h3>
          <p>${card.body}</p>
          <div class="spacer"></div>
          <div class="rec">
            <span class="lbl">おすすめの使い方</span>
            <p>${card.rec}</p>
          </div>${note}
        </div>`;
};

const renderSection = (s) => `    <section class="catalog">
      <div class="sec-head">
        <span class="sec-kicker">${s.kicker}</span>
        <h2>${s.h2}</h2>
        <p class="sec-sub">${s.sub}</p>
      </div>
      <div class="grid">

${s.cards.map((c) => renderCard(c, s.cat)).join('\n\n')}

      </div>
    </section>`;

const renderChain = (chain) =>
  chain
    .map((t) =>
      t.sep
        ? `<span class="arrow">${t.sep}</span>`
        : `<span class="${t.style ? 'chip ' + t.style : 'chip'}">${t.chip}</span>`
    )
    .join('');

const renderRecipe = (r) => `        <div class="recipe">
          <div>
            <h3>${r.title}</h3>
            <p class="usecase">${r.usecase}</p>
          </div>
          <div class="chain">${renderChain(r.chain)}</div>
        </div>`;

const renderRow = (row) =>
  `            <tr>\n${row
    .map((cell, i) => (i === 0 ? `              <td class="feat">${cell}</td>` : `              <td>${cell}</td>`))
    .join('\n')}\n            </tr>`;

const renderChangelog = () => {
  if (!data.changelog || !data.changelog.length) return '';
  const e = data.changelog[0];
  return `
    <section class="changelog" data-static="1">
      <div class="cl-head">
        <span class="cl-title">今回の変更点</span>
        <span class="cl-date">${e.date}</span>
      </div>
      <ul>
${e.summary.map((x) => `        <li>${x}</li>`).join('\n')}
      </ul>
    </section>
`;
};

// ---- compose content (page div + script) ----
const CONTENT = `<div class="page">
  <div class="wrap">

    <header class="hero">
      <p class="eyebrow">${data.hero.eyebrow}</p>
      <h1>${data.hero.h1}</h1>
      <p class="lede">${data.hero.lede}</p>
    </header>

    <div class="toolbar" role="search">
      <div class="tb-inner">
        <div class="search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></svg>
          <input id="q" type="search" placeholder="機能を検索（例：レポート / レビュー / pptx）" aria-label="機能を検索" autocomplete="off">
        </div>
        <div class="pills" role="group" aria-label="カテゴリで絞り込み">
          <button class="pill active" type="button" data-cat="all" aria-pressed="true">すべて</button>
          <button class="pill" type="button" data-cat="skill" aria-pressed="false">スキル</button>
          <button class="pill" type="button" data-cat="agent" aria-pressed="false">エージェント</button>
        </div>
        <div class="meta">
          <span class="count" id="count" aria-live="polite"></span>
          <span class="updated">最終更新 <b id="updated">${updated}</b></span>
          <a class="update-btn" href="${updatesUrl}" target="_blank" rel="noopener" title="公式ドキュメントの更新通知（Issue）を確認します。更新は手元の Claude Code で /update-guide を実行してください。">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-3-6.7"></path><path d="M21 4v5h-5"></path></svg>
            更新情報を確認
          </a>
        </div>
      </div>
    </div>

    <p id="noresults" class="noresults">該当する機能が見つかりません。検索語を変えるか「すべて」に戻してください。</p>
${renderChangelog()}
    <section data-static="1">
      <div class="sec-head">
        <span class="sec-kicker">${data.mentalModel.kicker}</span>
        <h2>${data.mentalModel.h2}</h2>
        <p class="sec-sub">${data.mentalModel.sub}</p>
      </div>
      <div class="compare">
${data.mentalModel.cards.map(renderMM).join('\n')}
      </div>
    </section>

${data.sections.map(renderSection).join('\n\n')}

    <section data-static="1">
      <div class="sec-head">
        <span class="sec-kicker">${data.recipes.kicker}</span>
        <h2>${data.recipes.h2}</h2>
        <p class="sec-sub">${data.recipes.sub}</p>
      </div>
      <div class="recipes">

${data.recipes.items.map(renderRecipe).join('\n\n')}

      </div>
    </section>

    <section data-static="1">
      <div class="sec-head">
        <span class="sec-kicker">${data.reference.kicker}</span>
        <h2>${data.reference.h2}</h2>
        <p class="sec-sub">${data.reference.sub}</p>
      </div>
      <div class="tablewrap">
        <table>
          <thead>
            <tr>${data.reference.headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>
${data.reference.rows.map(renderRow).join('\n')}
          </tbody>
        </table>
      </div>
    </section>

    <footer>
      <div class="caveat">
        ${data.footer.caveat}
      </div>
      <div style="height:22px"></div>
      <h4>参考</h4>
      <ul>
${data.footer.sources.map((s) => `        <li><a href="${s.url}">${s.label}</a></li>`).join('\n')}
      </ul>
      <p style="margin:0;color:var(--faint);font-size:12.5px;">Claude Code スキル &amp; エージェント機能ガイド ／ ${updated} 時点の情報</p>
    </footer>

  </div>
</div>

${SCRIPT}`;

// ---- artifact fragment (claude.ai Artifact format: title + style + content) ----
const artifact = `<title>${data.meta.docTitle}</title>
${STYLE}

${CONTENT}
`;

// ---- standalone document (GitHub Pages) ----
const indexHtml = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="description" content="Claude Code スキルとエージェントの機能・解説・おすすめの使い方リファレンス">
<title>${data.meta.docTitle}</title>
${STYLE}
</head>
<body style="margin:0">
${CONTENT}
</body>
</html>
`;

// ---- CHANGELOG.md ----
const changelogMd =
  `# 変更履歴\n\n` +
  (data.changelog || [])
    .map((e) => `## ${e.date}\n\n` + e.summary.map((s) => `- ${s}`).join('\n') + '\n')
    .join('\n');

writeFileSync(join(ROOT, 'index.html'), indexHtml);
writeFileSync(join(ROOT, 'claude-guide', 'skills-agents-guide.html'), artifact);
writeFileSync(join(ROOT, 'CHANGELOG.md'), changelogMd);

const cardCount = data.sections.reduce((n, s) => n + s.cards.length, 0);
console.log(`Built index.html + artifact + CHANGELOG.md  (updated=${updated}, cards=${cardCount})`);
