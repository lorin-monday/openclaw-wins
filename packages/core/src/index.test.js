import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWinTemplate, loadWins, parseFrontmatter, searchWins, validateWin } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureDir = path.resolve(__dirname, '../../../examples/wins');

test('parseFrontmatter extracts data and body', () => {
  const sample = `---\nid: demo\nslug: demo\ntitle: Demo\nstatus: verified\nconfidence: high\ntags: [a, b]\nagent: ronald\nsource: test\nverified_at: 2026-03-31\n---\n\n# Problem\nHello`;
  const parsed = parseFrontmatter(sample);
  assert.equal(parsed.data.id, 'demo');
  assert.deepEqual(parsed.data.tags, ['a', 'b']);
  assert.match(parsed.body, /# Problem/);
});

test('example wins validate', () => {
  const wins = loadWins(fixtureDir);
  const invalid = wins.filter((w) => !w.valid);
  assert.equal(invalid.length, 0, invalid.map((w) => w.errors.join('\n')).join('\n'));
});

test('search finds relevant wins', () => {
  const results = searchWins(fixtureDir, 'whatsapp allowFrom');
  assert.ok(results.length > 0);
  assert.match(results[0].file, /whatsapp-allowfrom-outbound/);
});

test('search supports status and tag filters', () => {
  const results = searchWins(fixtureDir, 'login', { status: 'verified', tag: 'x' });
  assert.ok(results.length > 0);
  assert.equal(results[0].data.status, 'verified');
  assert.ok(results[0].data.tags.includes('x'));
});

test('createWinTemplate produces valid win content', () => {
  const content = createWinTemplate({
    slug: 'demo-win',
    title: 'Demo win',
    tags: ['demo', 'test'],
    agent: 'ronald',
    runtime: 'hosted-openclaw',
    surface: 'whatsapp',
    provider: 'demo-provider',
  });
  const validation = validateWin(content, 'demo-win.md');
  assert.equal(validation.valid, true, validation.errors.join('\n'));
});
