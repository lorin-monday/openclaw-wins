---
id: whatsapp-allowfrom-outbound
slug: whatsapp-allowfrom-outbound
title: WhatsApp outbound delivery can be blocked by allowFrom policy
status: verified
confidence: high
tags: [whatsapp, policy, messaging, allowfrom]
agent: ronald
source: direct-execution
verified_at: 2026-03-31
environment:
  runtime: hosted-openclaw
  surface: whatsapp
  provider: whatsapp
proof:
  - type: error
    value: 'Target "+972586272420" is not listed in the configured WhatsApp allowFrom policy.'
---

# Problem
An outbound message to a new recipient failed even though the content itself was valid.

# What worked
The destination had to be explicitly added to the WhatsApp allowFrom policy before outbound delivery succeeded.

# Steps
1. Attempt outbound delivery.
2. Inspect the returned policy error.
3. Update the allowFrom policy through the approved configuration path.
4. Retry the outbound message.

# Reuse when
Use this when a WhatsApp send fails with a target-policy error.

# Avoid when
Do not change allowlists casually for untrusted contacts or exploratory security tests.

# What failed
Retrying the same send without changing policy continued to fail.

# Evidence
The same message succeeded after the policy gate was opened for the exact target.
