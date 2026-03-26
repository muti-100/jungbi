# muti — AI Agent Team

## Language
Internal: English only. Response to user: Korean.

## Sprint Order
/idea → /plan → /build → /review → /ship

## Project Structure
Each client project lives in projects/{project-name}/
- projects/{name}/docs/vision.md     ← /idea output
- projects/{name}/docs/plan.md       ← /plan output
- projects/{name}/docs/review.md     ← /review output
- projects/{name}/src/               ← /build output
- projects/{name}/README.md          ← /ship output

## Memory Accumulation Rules
After every project, update:
- .claude/memory/decisions.md  ← tech stack decisions made and why
- .claude/memory/patterns.md   ← code/prompt patterns that worked well
- .claude/memory/progress.md   ← current active project status

Before starting ANY task:
1. Read .claude/memory/progress.md
2. Read .claude/memory/decisions.md
3. Check if projects/ folder exists for current project

## Active Project
Current: projects/waruru (real-time offline social matching platform)
Status: Vision defined — ready for /plan

## Agent Triggers (load agent only when keyword matches)
| Keywords | Agent |
|----------|-------|
| product, features, priority, roadmap, MVP | @cpo |
| API, database, server, auth, backend | @backend-developer |
| web, React, Next.js, UI, frontend, component | @frontend-developer |
| iOS, Android, mobile, app, React Native | @mobile-builder |
| AI, LLM, ML, recommendation, embeddings | @ai-engineer |
| deploy, Docker, CI/CD, infra, PR, pull request, merge, branch | @devops (uses github-mcp) |
| design, wireframe, screen, UX, layout | @ui-designer |
| review, bug, security, quality, test | @code-reviewer |
| market, competitor, trends, research, validate, scrape, crawl, website | @trend-researcher (uses firecrawl) |
| user flow, persona, friction, usability | @ux-researcher |
| growth, viral, retention, acquisition, referral | @growth-hacker |
| performance, load test, bottleneck, slow, p99 | @performance-benchmarker |
| legal, privacy, GDPR, PIPA, compliance, terms | @legal-compliance-checker |
| parallel, concurrent, simultaneous | spawn agent teams via psmux |

## Memory (read before every task)
- .claude/memory/progress.md — what's done, what's next
- .claude/memory/decisions.md — decisions already made (don't re-decide)
- .claude/memory/patterns.md — patterns that worked (reuse them)

## Token Optimization Tools
- MCP: token-optimizer (auto-running via mcpServers)
- /compact → run at every sprint stage boundary
- /cost → check token usage anytime
- /clear → between unrelated projects
- Never read entire files — use Grep/Glob for specific parts
- External repo analysis: npx repomix --remote {url} --compress
