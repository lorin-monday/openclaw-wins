import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadWins } from '../../core/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const winsDir = path.join(root, 'examples/wins');
const outPath = path.join(root, 'packages/web/public/index.html');

const wins = loadWins(winsDir)
  .filter((win) => win.valid)
  .map((win) => ({
    file: path.relative(root, win.file),
    title: win.data.title,
    id: win.data.id,
    status: win.data.status,
    confidence: win.data.confidence,
    tags: win.data.tags,
    verified_at: win.data.verified_at,
  }));

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>OpenClaw Wins</title>
    <style>
      body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #0b1020; color: #eef2ff; }
      .wrap { max-width: 900px; margin: 0 auto; padding: 40px 20px 80px; }
      h1 { margin-bottom: 8px; }
      p { color: #b7c0e0; }
      .grid { display: grid; gap: 16px; margin-top: 24px; }
      .card { background: #131a33; border: 1px solid #273158; border-radius: 14px; padding: 18px; }
      .meta { color: #9fb0ea; font-size: 14px; margin-top: 8px; }
      .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
      .tag { background: #1f2a52; padding: 4px 10px; border-radius: 999px; font-size: 12px; color: #dbe4ff; }
      code { background: #11182e; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <h1>OpenClaw Wins</h1>
      <p>Open-source operational memory for agents. Structured, reviewable, and easy to contribute to.</p>
      <p><strong>${wins.length}</strong> sample wins loaded from <code>examples/wins</code>.</p>
      <div class="grid">
        ${wins
          .map(
            (win) => `
              <section class="card">
                <h2>${escapeHtml(win.title)}</h2>
                <div class="meta">${escapeHtml(win.id)} · ${escapeHtml(win.status)} · confidence: ${escapeHtml(win.confidence)} · verified: ${escapeHtml(String(win.verified_at))}</div>
                <div class="meta">${escapeHtml(win.file)}</div>
                <div class="tags">${win.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
              </section>
            `,
          )
          .join('')}
      </div>
    </div>
  </body>
</html>`;

fs.writeFileSync(outPath, html);
console.log(`Built ${outPath}`);

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
