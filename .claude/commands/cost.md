---
description: Check current token usage and get optimization tips for this session.
---

# /cost — Token Usage Check

## Steps

**Step 1.** Run /cost to see current session usage

**Step 2.** Analyze the breakdown:
- If context/history > 60% of tokens → run /compact now
- If on Opus for simple tasks → suggest switching to Sonnet
- If same files read multiple times → suggest caching in memory

**Step 3.** Print recommendations:
💰 Token Health Check
Current usage: {from /cost output}
Status: {healthy / warning / critical}
Recommendations:
- {specific action to reduce tokens}
- {specific action to reduce tokens}

Estimated savings if applied: ~{X}%
