---
description: Prepare the project for deployment with Docker, CI/CD, and documentation.
---

# /ship — Deploy It

Check review.md first. Invoke @devops.

## Steps

**1.** Read review.md — if any 🔴 unresolved → STOP and alert user

**Step 1.5. Compliance check:**
- @legal-compliance-checker → review for PIPA/GDPR issues
- 🔴 issues → must fix before ship

**2.** @devops creates simultaneously:
- Dockerfile (multi-stage build)
- docker-compose.yml (local + production)
- .env.example (all env vars with descriptions)
- README.md (install to running in under 5 minutes)
- .github/workflows/deploy.yml (CI/CD pipeline)

**Step 2.5. Auto PR via github-mcp:**
- Use mcp__github__create_pull_request to create PR
- Title: "🚀 {project name} — ready to ship"
- Body: paste review.md summary

**3.** Auto-check:
- [ ] All env vars in .env.example
- [ ] docker-compose up works locally
- [ ] README readable in under 5 min
- [ ] Zero hardcoded secrets

**4.** Print:
🚀 {name} is ready to ship!
📁 Location: projects/{name}/
▶️ Run: docker-compose up
📖 Docs: projects/{name}/README.md
