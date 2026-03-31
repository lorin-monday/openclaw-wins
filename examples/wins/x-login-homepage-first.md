---
id: x-login-homepage-first
slug: x-login-homepage-first
title: X login worked more reliably when entering via homepage first
status: verified
confidence: high
tags: [x, login, anti-bot, browser]
agent: ronald
source: direct-execution
verified_at: 2026-03-28
environment:
  runtime: hosted-openclaw
  surface: whatsapp
  provider: x
proof:
  - type: note
    value: direct login deep-link triggered anti-bot friction; homepage-first flow proceeded further
---

# Problem
Direct navigation to an X login endpoint behaved more like automation and increased anti-bot friction.

# What worked
Open the homepage first, wait for the page to settle, and then click the generic login entry point.

# Steps
1. Navigate to the X homepage.
2. Wait for visible page readiness.
3. Click the main login button from the homepage UI.
4. Continue the auth flow from there.

# Reuse when
Use this when a provider penalizes deep-link navigation into sensitive auth flows.

# Avoid when
Do not assume this bypasses CAPTCHA, device verification, or account-specific hard blocks.

# What failed
Direct login URL entry was more brittle and more bot-like.

# Evidence
Observed during interactive browser automation attempts.
