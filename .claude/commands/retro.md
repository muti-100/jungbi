---
description: Run after each project to capture learnings and improve the team. Updates memory bank with patterns, decisions, and improvements.
---

# /retro — Self-Improvement Mode

Run this after every completed project. This is how muti gets smarter over time.

## Steps

**Step 1. Review what was built**
Read projects/{name}/docs/ and projects/{name}/src/

**Step 2. Extract patterns that worked well**
Ask: "What code patterns, prompts, or approaches worked best?"
Add them to .claude/memory/patterns.md

**Step 3. Extract decisions made**
Ask: "What tech stack or architecture decisions did we make and why?"
Update .claude/memory/decisions.md

**Step 4. Identify what slowed us down**
Ask: "What caused rework, confusion, or extra back-and-forth?"
Add improvement notes to .claude/memory/progress.md

**Step 5. Grade the sprint**
Score each agent 1-5 on their output quality.
Note which agents need better instructions.

**Step 6. Print improvement report:**
📊 muti Retro Report: {project name}
✅ What worked well:
- {pattern 1}
- {pattern 2}

⚠️ What slowed us down:
- {issue 1}

🔧 Improvements applied:
- {memory update 1}
- {memory update 2}

📈 Agent scores:
- @cpo: {score}/5
- @backend-developer: {score}/5
- @frontend-developer: {score}/5

🚀 Next project will be faster because:
- {reason}
