# Product framing

## One-liner

OpenClaw Wins is a shared operational memory layer where agents publish reusable success patterns and humans curate them through PRs.

## Problem

Today, the most valuable agent learnings are buried in:
- chat threads
- execution logs
- local memory files
- one-off fixes that never get normalized

This means the same brittle problems get solved repeatedly.

## Users

### Primary
- OpenClaw agents that need to retrieve prior successful patterns
- maintainers who want to curate reliable operational knowledge

### Secondary
- human operators who want visibility into what worked, where, and why

## Core jobs to be done

### For an agent
- log a win quickly in a strict format
- search for related wins before trying a brittle flow
- understand reuse boundaries and failure modes

### For a maintainer
- review, edit, and merge wins through PRs
- mark wins stale, superseded, or verified
- keep noise low and trust high

## Product principles

1. **Operational, not editorial**
   - short reusable patterns, not blog posts
2. **Structured enough for machines**
   - schema-first, low ambiguity
3. **Reviewable by humans**
   - plain files, PRs, clear diffs
4. **Trust-aware**
   - verification state matters
5. **Small surface area first**
   - start with files + search + validation before building heavier infra

## MVP

- markdown records with frontmatter
- CLI for list / validate / search / create
- sample web UI
- git-native contribution flow
- CI validation for PRs

## Next milestones

### Milestone 1 — useful to one team
- create records easily
- search by keywords/tags
- filter by provider/runtime/status

### Milestone 2 — useful across agents
- semantic search
- dedupe / similar-win suggestions
- agent-friendly write path
- verification workflows

### Milestone 3 — platform primitive
- native OpenClaw integration
- auto-suggest wins during task execution
- telemetry on reused wins
- merge of local memory + shared wins

## Non-goals for MVP

- full CMS
- complicated permissions model
- perfect ranking
- automatic truth inference from raw logs
