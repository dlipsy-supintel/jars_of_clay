# Claude Code Configuration — Jars of Clay

## What This Project Is
A startup-friendly Clay alternative deployment guide and working reference implementation.
Built on **RuVector** (vector memory) + **Claude API** (AI brain) + direct integrations.

State of truth lives at: https://github.com/ruvnet/ruvector

## Behavioral Rules
- Do what has been asked; nothing more, nothing less
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files
- NEVER save working files to the root folder
- Prefer editing existing files over creating new ones

## File Organization
```
/docs/                  # Guide content (the deployment guide lives here)
/docs/modules.md        # Validated module registry — source of truth for dependencies
/docs/architecture.md   # Simplified architecture reference
/src/examples/          # Working code examples (must compile/run)
/src/validators/        # Dependency and link validation tools
/scripts/               # Automation scripts (validate, build, publish)
/.github/workflows/     # CI for validation
```

## Core Stack (Occam's Razor)
Only these modules are in scope. Everything else was cut for complexity.

| Module | Role | Repo | Status |
|--------|------|------|--------|
| **RuVector** | Vector memory, GNN, self-learning DB | ruvnet/RuVector | ✅ Active (4K stars) |
| **FACT** | Deterministic context retrieval (replaces RAG) | ruvnet/FACT | ✅ Active (166 stars) |
| **Claude API** | Orchestration, classification, scoring | Anthropic | ✅ Production |

### Cut modules (and why)
- AgentDB → superseded by RuVector
- Federated MCP, MidStream, Inflight Agentics → over-engineering at startup scale
- SPARC IDE, PromptLang, Agentic Preview → dev experience luxuries, not core
- Guardrail, Agentic DevOps → stale (last push 2023)
- SAFLA → useful concept but Python-only, adds dependency weight

## Rebuild Workflow
When iterating on the deployment guide:

1. **Validate first**: Run `bash scripts/validate-deps.sh` to check all referenced repos/links
2. **Edit docs/**: The guide content lives in `/docs/` as modular sections
3. **Update examples**: If guide code changes, update `/src/examples/` to match
4. **Test examples**: Every code example must be runnable. Verify with the appropriate runtime.
5. **Assemble**: Run `bash scripts/assemble-guide.sh` to combine docs/ into the final guide

## Guide Quality Rules
- Zero fictional API calls — every import must match a real package export
- Every referenced repo must pass validation (exists, pushed within 12 months)
- Code examples must include error handling and be runnable
- Cost claims must cite sources (API pricing pages, hosting calculators)
- Architecture must be achievable by a 2-3 person eng team

## Build & Run
```bash
# Type-check
npm run typecheck

# Run the enrichment pipeline (single lead, needs ANTHROPIC_API_KEY)
npm run enrich

# Start the API server
npm run dev

# Validate all dependencies and links
npm run validate

# Assemble guide from modular docs
npm run assemble
```

## App Structure
```
/src/tools/find-email.ts      # Hunter.io email finder (real API)
/src/tools/enrich-company.ts  # Hunter.io company enrichment (real API)
/src/tools/store-lead.ts      # Lead storage (JSON file, RuVector-ready interface)
/src/lib/pipeline.ts          # Claude API agentic loop wiring tools together
/src/lib/retry.ts             # Exponential backoff for HTTP calls
/src/api/server.ts            # Express API server
/data/leads.json              # Stored leads (gitignored)
```

## Security Rules
- NEVER hardcode API keys in examples — always use env vars
- All example code must use `process.env.X` or equivalent
- .env.example files show structure only, never real values
