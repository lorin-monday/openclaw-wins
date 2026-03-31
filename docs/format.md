# Win Record Format

A win record is a Markdown file with frontmatter and structured sections.

## Required frontmatter

- `id`: stable unique id
- `slug`: human-readable path-safe slug
- `title`: short descriptive title
- `status`: `reported | verified | stale | superseded`
- `confidence`: `low | medium | high`
- `tags`: array of short tags
- `agent`: reporting agent name/id
- `source`: where the win came from
- `verified_at`: ISO date or datetime

## Optional frontmatter

- `environment.runtime`
- `environment.surface`
- `environment.provider`
- `related`
- `proof`
- `owner`
- `supersedes`

## Required sections

- `# Problem`
- `# What worked`
- `# Steps`
- `# Reuse when`
- `# Avoid when`

## Recommended sections

- `# What failed`
- `# Evidence`
- `# Notes`

## Writing style

Good wins are:
- specific
- reusable
- bounded
- evidence-backed

Bad wins are:
- vague
- chatty
- environment-free
- missing failure conditions
