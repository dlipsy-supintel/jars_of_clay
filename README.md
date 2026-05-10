# Jars of Clay — Clay Alternative Deployment Guide

A startup-friendly blueprint for building a self-hosted GTM intelligence platform that replaces [Clay](https://clay.com) with **RuVector** + **Claude API** + direct data provider integrations.

## Why

Clay is $185-495+/month and locks you into their orchestration layer. This guide shows how to build the same capabilities — lead enrichment, scoring, classification, CRM sync — using 3 core dependencies instead of a proprietary platform. Total cost at 2,000 leads/month: ~$200 vs. Clay's $495.

See the [full guide](clay_alternative_deployment_guide.md) for honest tradeoffs, including when you should just use Clay instead.

## Stack

| Component | Role |
|-----------|------|
| [RuVector](https://github.com/ruvnet/RuVector) | Vector memory DB with self-learning (Rust + npm) |
| [Claude API](https://docs.anthropic.com) | AI orchestration via tool use — classification, scoring, reasoning |
| [Hunter.io](https://hunter.io/api) | Email finding + company enrichment |
| [jsforce](https://github.com/jsforce/jsforce) / [@hubspot/api-client](https://github.com/HubSpot/hubspot-api-nodejs) | CRM sync |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/dlipsy-supintel/jars_of_clay.git
cd jars_of_clay

# 2. Validate that all referenced dependencies are alive
bash scripts/validate-deps.sh

# 3. Run the enrichment pipeline example (needs an Anthropic API key)
npm install @anthropic-ai/sdk tsx
ANTHROPIC_API_KEY=your-key npx tsx src/examples/enrichment-pipeline.ts
```

## Project Structure

```
CLAUDE.md                           # Claude Code config for iterating on this project
clay_alternative_deployment_guide.md # The assembled guide (auto-generated)
docs/
  01-executive-summary.md           # Clay comparison, tradeoffs
  02-who-this-is-for.md             # Prerequisites, ideal team profile
  03-deployment-playbook.md         # Week-by-week build guide with working code
  04-use-cases.md                   # 4 implementation patterns
  05-cost-analysis.md               # Per-lead cost math with cited sources
  06-operations.md                  # Monitoring, runbooks, maintenance
  07-compliance.md                  # GDPR/CCPA, data retention
  08-next-steps.md                  # Scaling path, resources
  architecture.md                   # 3-tier system design
  modules.md                        # Validated dependency registry
src/examples/
  enrichment-pipeline.ts            # Working Claude API tool-use agentic loop
scripts/
  validate-deps.sh                  # Checks all referenced repos/packages are alive
  assemble-guide.sh                 # Combines docs/ into the final guide
.github/workflows/
  validate.yml                      # CI: validates deps on push + weekly cron
```

## Editing the Guide

The final `clay_alternative_deployment_guide.md` is auto-assembled from modular sections in `docs/`. To make changes:

1. Edit the relevant file in `docs/`
2. Run `bash scripts/validate-deps.sh` to verify references
3. Run `bash scripts/assemble-guide.sh` to rebuild the guide
4. Commit both the doc source and the assembled output

### With Claude Code

Open this project in Claude Code — it reads `CLAUDE.md` automatically and understands the file structure, rebuild workflow, and quality rules (zero fictional APIs, cited cost claims, etc.).

## Cost at a Glance

Per enriched, scored lead: **~$0.04-0.07**

| Volume | This Stack | Clay |
|--------|-----------|------|
| 500/mo | ~$165/mo | $185/mo (Launch) |
| 2,000/mo | ~$200/mo | $495/mo (Growth) |
| 10,000/mo | ~$630/mo | ~$2,500+/mo (Enterprise) |

All pricing verified May 2026. Sources: [Anthropic](https://docs.anthropic.com/en/docs/about-claude/pricing), [Hunter.io](https://hunter.io/pricing), [Clay](https://clay.com/pricing). See `docs/05-cost-analysis.md` for full breakdown.

## License

MIT
