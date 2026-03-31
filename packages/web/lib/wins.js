import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createWinTemplate, loadWins, searchWins } from '../../core/src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const winsDir = path.join(repoRoot, 'examples/wins');

export function getAllWins() {
  return loadWins(winsDir)
    .filter((win) => win.valid)
    .map(mapWin)
    .sort((a, b) => String(b.verified_at).localeCompare(String(a.verified_at)));
}

export function getWinStats(wins) {
  return {
    total: wins.length,
    verified: wins.filter((win) => win.status === 'verified').length,
    reported: wins.filter((win) => win.status === 'reported').length,
  };
}

export function findWins({ query = '', status = '', tag = '' } = {}) {
  if (!query && !status && !tag) return getAllWins();
  if (query) {
    return searchWins(winsDir, query, { status: status || undefined, tag: tag || undefined }).map(mapWin);
  }
  return getAllWins().filter((win) => (!status || win.status === status) && (!tag || win.tags.includes(tag)));
}

export function createWinRecord(input) {
  const slug = slugify(input.slug || input.title || 'untitled-win');
  const filePath = path.join(winsDir, `${slug}.md`);
  const content = createWinTemplate({
    ...input,
    slug,
    title: input.title,
    tags: normalizeTags(input.tags),
    verified_at: input.verified_at,
  });
  fs.writeFileSync(filePath, content);
  return { filePath, slug };
}

function mapWin(win) {
  return {
    file: path.relative(repoRoot, win.file),
    id: win.data.id,
    slug: win.data.slug,
    title: win.data.title,
    status: win.data.status,
    confidence: win.data.confidence,
    tags: win.data.tags || [],
    agent: win.data.agent,
    source: win.data.source,
    verified_at: win.data.verified_at,
    provider: win.data.environment?.provider || '',
    runtime: win.data.environment?.runtime || '',
    surface: win.data.environment?.surface || '',
  };
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  return String(tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
