# Next Steps

## Getting Started (This Week)

1. Clone the scaffold: `git clone` this repo
2. Run `bash scripts/validate-deps.sh` to verify all dependencies
3. Get API keys: [Anthropic console](https://console.anthropic.com), [Hunter.io](https://hunter.io/pricing)
4. Run the enrichment example: `npx tsx src/examples/enrichment-pipeline.ts`
5. Process 10 test leads end-to-end

## Build Schedule

| Week | Milestone | Verification |
|------|-----------|-------------|
| 1 | Email finding + company enrichment + Claude orchestration | Process 10 test leads successfully |
| 2 | Lead scoring + RuVector persistence | Leads stored with scores; similar leads retrievable |
| 3 | CRM sync (Salesforce or HubSpot) | Enriched leads appear in CRM with custom fields |
| 4 | API + basic dashboard | Webhook endpoint accepts leads; dashboard shows results |
| 5-8 | Signal monitoring, advanced scoring, scale testing | Run 1,000 lead batch; verify cost matches projections |

## Scaling Path

When you outgrow the base architecture:

| Signal | What to Add | Why |
|--------|-------------|-----|
| >50K leads/month | BullMQ or SQS queue between API and Claude | Rate limit management, retry handling |
| Need real-time streaming | MidStream ([ruvnet/midstream](https://github.com/ruvnet/midstream)) | Analyze Claude responses as they stream |
| Multi-region requirements | Federated MCP ([ruvnet/federated-mcp](https://github.com/ruvnet/federated-mcp)) | Distributed agent coordination |
| Complex multi-step workflows | Claude-Flow orchestrator | Explicit workflow state management |
| Self-improving scoring | SAFLA ([ruvnet/safla](https://github.com/ruvnet/safla)) | Meta-cognitive feedback loops |

## Resources

### Core Repos
- [RuVector](https://github.com/ruvnet/RuVector) — Vector memory DB (Rust + npm)
- [FACT](https://github.com/ruvnet/FACT) — Deterministic context retrieval

### API Documentation
- [Anthropic Claude API](https://docs.anthropic.com) — Tool use, structured outputs, batch API
- [Hunter.io API](https://hunter.io/api-documentation/v2) — Email finder, company enrichment
- [jsforce](https://jsforce.github.io/) — Salesforce SDK for Node.js
- [@hubspot/api-client](https://github.com/HubSpot/hubspot-api-nodejs) — HubSpot SDK

### Community
- [Ruvnet GitHub Discussions](https://github.com/ruvnet/RuVector/discussions)
- [Anthropic Discord](https://discord.gg/anthropic)

## Contributing

To improve this guide:
1. Edit the relevant section in `docs/`
2. Run `bash scripts/validate-deps.sh`
3. Run `bash scripts/assemble-guide.sh`
4. Submit a PR
