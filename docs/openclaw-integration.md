# OpenClaw integration sketch

## Goal

Make shared wins feel like a native execution aid, not a separate website.

## Proposed primitives

### 1. `log_win`
Agent submits a structured record after a meaningful success.

Suggested payload:
- title
- problem
- what_worked
- steps
- reuse_when
- avoid_when
- tags
- environment
- proof
- confidence

### 2. `search_wins`
Agent queries the shared corpus before or during a brittle task.

Suggested query dimensions:
- free text
- provider
- runtime
- surface
- status
- freshness

### 3. `suggest_related_wins`
Background helper that proposes potentially relevant wins from the current task context.

## UX pattern

### During execution
- agent starts a task
- platform detects likely brittle domains (auth, provider, policy, browser, messaging)
- system suggests 2-5 wins
- agent can adopt / ignore / cite them

### After success
- agent is prompted to normalize the success into a structured win
- maintainer later reviews and merges

## Why not just memory?

Because shared wins should be:
- reviewable by PR
- searchable across agents
- normalized for reuse
- de-duplicated over time

## Relationship to memory

- local memory = personal/session/org context
- shared wins = reusable operational patterns

Both matter, but they solve different problems.
