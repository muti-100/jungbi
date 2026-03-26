---
description: Build the product blueprint from vision.md. Invokes CPO, designer, and architect in parallel.
---

# /plan — Build the Blueprint

Read vision.md first. Invoke 3 agents in parallel.

## Steps

**Step 0. Read memory first:**
- Read .claude/memory/decisions.md
- Read .claude/memory/progress.md
- Only then proceed to Step 1

**1.** Find and read the latest projects/{name}/docs/vision.md

**Step 1.5. Research phase (parallel with Step 1):**
- @trend-researcher → market validation
- @ux-researcher → user flow mapping

**2.** Invoke simultaneously:
- @cpo → feature list with RICE scores, sprint plan, user stories
- @ui-designer → screen list, components, interactions, edge cases
- @backend-developer → tech stack recommendation, API endpoints, DB schema

**3.** Combine into plan.md:
Execution Plan: {name}
Tech Stack

Frontend: {choice + reason}
Backend: {choice + reason}
Database: {choice + reason}
Deploy: {choice + reason}

Features by Priority (RICE)
FeatureRICEScore
Screens
{per screen: purpose, components, interactions, edge cases}
API Endpoints
{method} {path} — {purpose}
DB Schema
{core tables and relationships}
Sprint Plan

Week 1: {deliverable}
Week 2: {deliverable}


**4.** Save to projects/{name}/docs/plan.md

**5.** Print:
📋 Plan ready. Review above.
▶️ Type /build to start coding
✏️ Or tell me what to change

**Step Final.** Update .claude/memory/decisions.md with tech stack decisions made.
Run /compact before ending.
