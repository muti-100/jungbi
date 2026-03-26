---
description: Audit all code for bugs, security issues, and quality problems.
---

# /review — Audit the Code

Read all source files. Invoke @code-reviewer.

## Steps

**1.** Read all files in projects/{name}/src/

**2.** @code-reviewer checks:
- 🔴 Security holes (SQLi, XSS, missing auth, secrets in code)
- 🔴 Data loss risk, crashes, infinite loops
- 🟡 Missing error handling, performance issues, hardcoded values
- 🟢 Style, naming, readability, test coverage

**3.** 🔴 issues → auto-fix
**4.** 🟡 issues → list and ask user

**5.** Save to projects/{name}/docs/review.md

**6.** Print:
🔍 Review complete
🔴 Critical: {n} → auto-fixed
🟡 Warnings: {n} → needs your decision
🟢 Suggestions: {n} → optional
▶️ /ship when ready
