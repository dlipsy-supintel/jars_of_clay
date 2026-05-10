# Module Registry

> Source of truth for all dependencies referenced in the deployment guide.
> Run `bash scripts/validate-deps.sh` to verify this list against live GitHub data.

## Core Modules (In Scope)

### RuVector
- **Role**: Vector memory DB with self-learning, GNN, HNSW indexing
- **Repo**: https://github.com/ruvnet/RuVector
- **Stars**: ~4,000 | **Last push**: 2026-05-09
- **Language**: Rust (with npm bindings)
- **Why it's core**: Replaces both AgentDB and any external vector DB. Sub-millisecond retrieval, self-learning patterns, already has Claude Code integration (CLAUDE.md). This is where enriched lead data, embeddings, and scoring patterns live.
- **Install**: `npm install ruvector` or build from source via Cargo

### FACT (Fast Augmented Context Tools)
- **Role**: Deterministic context retrieval — replaces RAG with cached tokens + MCP tool execution
- **Repo**: https://github.com/ruvnet/FACT
- **Stars**: 166 | **Last push**: 2025-08-01
- **Why it's core**: Gives agents fast, deterministic access to enrichment context without vector search overhead. Good for structured lookups (ICP criteria, taxonomy definitions, template retrieval).
- **Note**: Evaluate if FACT's API surface is worth the dependency vs. simple in-memory caches. If marginal, cut it.

### Claude API (Anthropic)
- **Role**: AI orchestration brain — classification, scoring, reasoning, structured outputs
- **Provider**: Anthropic (https://docs.anthropic.com)
- **Why it's core**: This is the actual intelligence layer. Handles lead classification, industry taxonomy, scoring reasoning, and workflow orchestration via tool use.
- **Key features used**: Structured outputs, tool use, prompt caching, batch API

## Evaluated & Cut

| Module | Stars | Last Push | Cut Reason |
|--------|-------|-----------|------------|
| AgentDB | 36 | 2026-05 | Superseded by RuVector (same author, RuVector is the evolution) |
| SAFLA | 147 | 2025-06 | Python-only, adds cross-language dependency. Scoring done better with Claude structured outputs. |
| Federated MCP | 20 | 2025-05 | Distributed runtime is premature optimization for startups |
| MidStream | 102 | 2026-01 | Streaming analysis is nice-to-have, not core enrichment |
| Auto-Browser | 89 | 2025-01 | Web scraping can use simpler tools (Playwright, Cheerio) |
| Agile Agents (A2) | 40 | 2024-06 | Stale (1+ year), serverless agent framework adds abstraction we don't need |
| Guardrail | 149 | 2023-12 | Stale (2+ years) |
| PromptLang | 131 | 2023-12 | Stale (2+ years) |
| Inflight Agentics | — | — | Repo does not exist (404) |
| SPARC IDE | — | — | Dev experience luxury, not core |
| Agentic DevOps | — | — | Infrastructure abstraction, premature at startup scale |
| Dynamo MCP | — | — | Template management, not needed |
| AgenticsJS | — | — | Null description, unclear purpose |

## Data Provider APIs (Direct Integration)

These are called directly — no wrapper framework needed.

| Provider | Purpose | Pricing | API Docs |
|----------|---------|---------|----------|
| Hunter.io | Email finding + verification | $49-399/mo | https://hunter.io/api |
| Apollo.io | Contact + company enrichment | $49-119/mo | https://apolloio.github.io/apollo-api-docs |
| Clearbit (HubSpot) | Company enrichment, reveal | Bundled with HubSpot / legacy API | https://clearbit.com/docs |
| RocketReach | Email + phone finding | $53-269/mo | https://rocketreach.co/api |

## CRM SDKs (Direct Integration)

| CRM | SDK | Install |
|-----|-----|---------|
| Salesforce | jsforce | `npm install jsforce` |
| HubSpot | @hubspot/api-client | `npm install @hubspot/api-client` |

## Hosting Platforms (Recommended)

| Platform | Best For | Estimated Cost |
|----------|----------|----------------|
| Railway | Quick deploy, Postgres included | $5-20/mo |
| Fly.io | Global edge, containers | $5-30/mo |
| Vercel | Next.js dashboard frontend | Free-$20/mo |
| AWS (ECS/Lambda) | Scale, existing infra | $50-200/mo |
