import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_FRONTMATTER = [
  'id',
  'slug',
  'title',
  'status',
  'confidence',
  'tags',
  'agent',
  'source',
  'verified_at',
];

const REQUIRED_SECTIONS = [
  'Problem',
  'What worked',
  'Steps',
  'Reuse when',
  'Avoid when',
];

export function walkMarkdownFiles(rootDir) {
  const out = [];
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const full = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkMarkdownFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      out.push(full);
    }
  }
  return out;
}

export function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) {
    return { data: {}, body: content };
  }
  const end = content.indexOf('\n---\n', 4);
  if (end === -1) {
    return { data: {}, body: content };
  }
  const raw = content.slice(4, end).trim();
  const body = content.slice(end + 5);
  return { data: parseSimpleYaml(raw), body };
}

function parseSimpleYaml(raw) {
  const root = {};
  const stack = [{ indent: -1, value: root }];

  for (const originalLine of raw.split('\n')) {
    if (!originalLine.trim()) continue;
    const indent = originalLine.match(/^\s*/)[0].length;
    const line = originalLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const current = stack[stack.length - 1].value;

    if (line.startsWith('- ')) {
      const itemValue = line.slice(2).trim();
      if (!Array.isArray(current.__array__)) {
        current.__array__ = [];
      }
      if (itemValue.includes(':')) {
        const obj = {};
        current.__array__.push(obj);
        const [k, ...rest] = itemValue.split(':');
        obj[k.trim()] = coerce(rest.join(':').trim());
        stack.push({ indent, value: obj });
      } else {
        current.__array__.push(coerce(itemValue));
      }
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const rawValue = line.slice(colonIndex + 1).trim();

    if (rawValue === '') {
      current[key] = {};
      stack.push({ indent, value: current[key] });
    } else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      current[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    } else {
      current[key] = coerce(rawValue);
    }
  }

  normalizeArrays(root);
  return root;
}

function normalizeArrays(obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === 'object') {
      if (Array.isArray(value.__array__)) {
        obj[key] = value.__array__;
      } else {
        normalizeArrays(value);
      }
    }
  }
}

function coerce(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value.replace(/^['"]|['"]$/g, '');
}

export function extractSections(body) {
  const headings = [...body.matchAll(/^#\s+(.+)$/gm)].map((m) => m[1].trim());
  return headings;
}

export function validateWin(content, filePath = '<memory>') {
  const { data, body } = parseFrontmatter(content);
  const sections = extractSections(body);
  const errors = [];

  for (const field of REQUIRED_FRONTMATTER) {
    if (!(field in data)) {
      errors.push(`${filePath}: missing frontmatter field '${field}'`);
    }
  }

  if ('tags' in data && !Array.isArray(data.tags)) {
    errors.push(`${filePath}: 'tags' must be an array`);
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!sections.includes(section)) {
      errors.push(`${filePath}: missing section '# ${section}'`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    data,
    sections,
  };
}

export function loadWins(rootDir) {
  const files = walkMarkdownFiles(rootDir);
  return files.map((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const validation = validateWin(content, file);
    return {
      file,
      content,
      ...validation,
    };
  });
}

export function searchWins(rootDir, query, options = {}) {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  const { status, tag } = options;

  return loadWins(rootDir)
    .filter((win) => win.valid)
    .filter((win) => !status || win.data.status === status)
    .filter((win) => !tag || (Array.isArray(win.data.tags) && win.data.tags.includes(tag)))
    .map((win) => {
      const haystack = [win.file, JSON.stringify(win.data), win.content].join('\n').toLowerCase();
      const tokenScore = tokens.reduce((acc, token) => acc + (haystack.includes(token) ? 1 : 0), 0);
      const titleBoost = tokens.reduce(
        (acc, token) => acc + (String(win.data.title ?? '').toLowerCase().includes(token) ? 2 : 0),
        0,
      );
      const statusBoost = win.data.status === 'verified' ? 2 : win.data.status === 'reported' ? 0 : -1;
      const confidenceBoost = win.data.confidence === 'high' ? 2 : win.data.confidence === 'medium' ? 1 : 0;
      const freshnessBoost = String(win.data.verified_at ?? '').startsWith('2026') ? 1 : 0;
      const score = tokenScore + titleBoost + statusBoost + confidenceBoost + freshnessBoost;
      return { ...win, score };
    })
    .filter((win) => win.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function createWinTemplate(input) {
  const slug = input.slug;
  const title = input.title;
  const date = input.verified_at ?? new Date().toISOString().slice(0, 10);
  const tags = (input.tags ?? []).join(', ');
  const runtime = input.runtime ?? 'unknown-runtime';
  const surface = input.surface ?? 'unknown-surface';
  const provider = input.provider ?? 'unknown-provider';
  const agent = input.agent ?? 'unknown-agent';
  const source = input.source ?? 'direct-execution';

  return `---
id: ${slug}
slug: ${slug}
title: ${title}
status: ${input.status ?? 'reported'}
confidence: ${input.confidence ?? 'medium'}
tags: [${tags}]
agent: ${agent}
source: ${source}
verified_at: ${date}
environment:
  runtime: ${runtime}
  surface: ${surface}
  provider: ${provider}
---

# Problem
${input.problem ?? 'Describe the specific problem.'}

# What worked
${input.whatWorked ?? 'Describe the pattern that worked.'}

# Steps
1. First step.
2. Second step.
3. Third step.

# Reuse when
${input.reuseWhen ?? 'Explain when another agent should try this.'}

# Avoid when
${input.avoidWhen ?? 'Explain when another agent should not rely on it.'}

# What failed
${input.whatFailed ?? 'Optional: describe failed approaches.'}

# Evidence
${input.evidence ?? 'Optional: include logs, screenshots, commands, or proof.'}
`;
}
