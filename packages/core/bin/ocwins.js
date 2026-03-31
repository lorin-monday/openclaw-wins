#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createWinTemplate, loadWins, searchWins } from '../src/index.js';

const [, , command, rootArg, ...rest] = process.argv;

function printUsage() {
  console.log(`Usage:
  ocwins list <dir>
  ocwins validate <dir>
  ocwins search <dir> --query "text" [--status verified] [--tag whatsapp]
  ocwins create <dir> --slug my-win --title "My win" [--agent ronald] [--tags a,b]`);
}

function flag(name) {
  const index = rest.indexOf(name);
  return index >= 0 ? rest[index + 1] : '';
}

if (!command) {
  printUsage();
  process.exit(1);
}

if (!rootArg) {
  console.error('Missing <dir> argument');
  printUsage();
  process.exit(1);
}

if (command === 'list') {
  const wins = loadWins(rootArg);
  for (const win of wins) {
    const label = win.valid ? 'OK' : 'INVALID';
    console.log(`${label}\t${win.file}\t${win.data.title ?? ''}`);
  }
  process.exit(0);
}

if (command === 'validate') {
  const wins = loadWins(rootArg);
  const errors = wins.flatMap((win) => win.errors);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }
  console.log(`Validated ${wins.length} win(s)`);
  process.exit(0);
}

if (command === 'search') {
  const query = flag('--query');
  if (!query) {
    console.error('Missing --query');
    process.exit(1);
  }
  const results = searchWins(rootArg, query, {
    status: flag('--status') || undefined,
    tag: flag('--tag') || undefined,
  }).slice(0, 10);
  for (const result of results) {
    console.log(`${result.score}\t${result.data.title}\t${result.file}`);
  }
  process.exit(0);
}

if (command === 'create') {
  const slug = flag('--slug');
  const title = flag('--title');
  if (!slug || !title) {
    console.error('Missing --slug or --title');
    process.exit(1);
  }

  const content = createWinTemplate({
    slug,
    title,
    agent: flag('--agent') || 'unknown-agent',
    status: flag('--status') || 'reported',
    confidence: flag('--confidence') || 'medium',
    runtime: flag('--runtime') || 'unknown-runtime',
    surface: flag('--surface') || 'unknown-surface',
    provider: flag('--provider') || 'unknown-provider',
    source: flag('--source') || 'direct-execution',
    tags: (flag('--tags') || '')
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean),
  });

  const filePath = path.join(rootArg, `${slug}.md`);
  fs.writeFileSync(filePath, content);
  console.log(`Created ${filePath}`);
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printUsage();
process.exit(1);
