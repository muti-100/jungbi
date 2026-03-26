# muti Memory Bank

This folder stores cross-session context so agents don't re-research the same things.

## Files
- decisions.md — architecture and product decisions made
- progress.md — current sprint status and what's done
- patterns.md — code patterns that worked well

## Rules
- Agents MUST read relevant memory files before starting work
- Agents MUST update progress.md after completing a task
- Never research the same thing twice — check memory first
