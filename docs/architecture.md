# Architecture: Clay Alternative (Simplified)

> 3 tiers. No swarms. No distributed runtimes. Just the minimum viable architecture
> a 2-3 person startup eng team can deploy and maintain.

## Design Principles

1. **Occam's Razor**: If a direct API call works, don't wrap it in a framework
2. **One language**: Node.js/TypeScript end-to-end (RuVector has npm bindings)
3. **Claude as orchestrator**: Use Claude API tool use to coordinate steps — not a custom agent framework
4. **RuVector as memory**: One DB for vectors, patterns, and self-learning — not Postgres + Redis + S3 + AgentDB

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    INTERFACE LAYER                       │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────┐  │
│  │  Next.js UI   │  │  REST API     │  │  Webhooks  │  │
│  │  (Dashboard)  │  │  (FastAPI or  │  │  (Inbound  │  │
│  │               │  │   Express)    │  │   leads)   │  │
│  └───────────────┘  └───────────────┘  └────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                  INTELLIGENCE LAYER                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Claude API (Anthropic)                 │  │
│  │                                                    │  │
│  │  • Orchestration via tool use                      │  │
│  │  • Lead classification (structured outputs)        │  │
│  │  • Lead scoring with reasoning                     │  │
│  │  • Industry taxonomy (custom prompts)              │  │
│  │  • Data cleaning / normalization                   │  │
│  │                                                    │  │
│  │  Tools available to Claude:                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │ enrich   │ │ find     │ │ score_and_store  │   │  │
│  │  │ _company │ │ _email   │ │                  │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │
│  │  │ classify │ │ sync     │ │ check_signals    │   │  │
│  │  │          │ │ _to_crm  │ │                  │   │  │
│  │  └──────────┘ └──────────┘ └──────────────────┘   │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                   DATA & MEMORY LAYER                    │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    RuVector                         │  │
│  │  • Vector embeddings for lead similarity            │  │
│  │  • Self-learning patterns (scoring history)         │  │
│  │  • HNSW index for sub-ms retrieval                  │  │
│  │  • GNN for relationship mapping                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────┐           ┌──────────────────────┐     │
│  │  Postgres    │           │  External APIs       │     │
│  │  (optional)  │           │  Hunter · Apollo     │     │
│  │  Structured  │           │  Clearbit · CRMs     │     │
│  │  data, auth  │           │  (direct HTTP calls) │     │
│  └──────────────┘           └──────────────────────┘     │
└──────────────────────────────────────────────────────────┘
```

## Data Flow: Lead Enrichment

```
1. Lead arrives (webhook POST or CSV upload)
   │
2. API validates input, queues for processing
   │
3. Claude API receives lead + tool definitions
   │  Claude decides which tools to call and in what order.
   │  No hardcoded pipeline — Claude orchestrates dynamically.
   │
4. Claude calls tools as needed:
   │  ├─ enrich_company(domain) → scrapes/API lookup
   │  ├─ find_email(name, domain) → Hunter → Apollo → RocketReach waterfall
   │  ├─ classify(company_data) → Claude structured output (industry, B2B/B2C, segment)
   │  └─ score_and_store(all_data) → scoring logic + RuVector persistence
   │
5. RuVector stores enriched lead with embeddings
   │  Self-learning: stores scoring outcome for future pattern matching
   │
6. Claude calls sync_to_crm(enriched_lead) → jsforce or HubSpot SDK
   │
7. API returns enrichment result to caller
```

## Key Architectural Decisions

### Why Claude orchestrates (not a custom agent framework)
Claude's tool use gives you dynamic orchestration for free. Instead of building
a workflow engine that calls agents in sequence, define tools and let Claude
decide the execution plan. This eliminates: agent swarm code, state machines,
workflow DSLs, and concurrency management.

### Why RuVector instead of Postgres + pgvector
RuVector provides vector search + self-learning patterns + GNN in one binary.
For a startup, this is simpler than managing Postgres extensions, and the
self-learning capability means scoring improves automatically over time.

Postgres is optional — use it if you need relational queries, auth tables,
or integration with existing infra. Don't use it as the vector store.

### Why direct API calls instead of MCP servers
At startup scale (<10K leads/month), the overhead of running MCP servers for
each data provider is unjustified. A simple `fetch()` to Hunter.io is clearer,
easier to debug, and has no runtime dependency. Graduate to MCP servers when
you have 5+ agents consuming the same data source.

## Scaling Path (When You Outgrow This)

| Growth Signal | What to Add |
|--------------|-------------|
| >50K leads/month | Queue system (BullMQ or SQS) between API and Claude |
| >5 concurrent enrichment streams | MidStream for real-time processing |
| Multi-region requirements | Federated MCP for distributed agents |
| Complex multi-step workflows | Claude-Flow for explicit orchestration |
| Need streaming analysis | MidStream for inflight processing |

The point: start simple, add complexity only when a specific scaling pain forces it.
