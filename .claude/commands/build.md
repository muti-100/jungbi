---
description: Write the actual code based on plan.md. Invokes development agents in parallel.
---

# /build — Write the Code

Read plan.md first. Invoke agents based on tech stack.

## Steps

**1.** Read projects/{name}/docs/plan.md

**2.** Identify platforms and invoke in parallel:
- Web frontend → @frontend-developer
- Backend/API → @backend-developer
- Mobile app → @mobile-builder (if needed)
- AI features → @ai-engineer (if needed)

Note: If running inside psmux, agents spawn in separate panes automatically via CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

**3.** Each agent writes code to projects/{name}/src/

**4.** After code is written → auto-invoke @code-reviewer
- 🔴 Critical issues → fix immediately and re-review
- 🟡 Warnings → show user, ask to fix or skip

**5.** Print:
🔨 Build complete
Files created:
{file tree}
Code review:
🔴 Critical: {n} (auto-fixed)
🟡 Warnings: {n} (your decision)
🟢 Suggestions: {n}
▶️ /review for full audit or /ship to deploy
