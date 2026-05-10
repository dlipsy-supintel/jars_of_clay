# Cost Analysis

All pricing verified as of May 2026. Sources cited inline.

## Per-Lead Cost Breakdown

Assumptions: One enrichment pipeline run per lead = 1 company enrichment + 1 email find + 1 Claude classification/scoring call.

**Claude API costs per lead** (using Sonnet 4.6 — $3/MTok input, $15/MTok output):
- Tool definitions + system prompt: ~800 input tokens (cached after first call = $0.0002)
- Lead data + context: ~500 input tokens = $0.0015
- Claude output (tool calls + final summary): ~600 output tokens = $0.009
- **Total Claude cost per lead: ~$0.01-0.02**

Source: [docs.anthropic.com/en/docs/about-claude/pricing](https://docs.anthropic.com/en/docs/about-claude/pricing)

**Data provider costs per lead:**
- Hunter.io Email Finder: 1 credit per found email
  - Starter: 2,000 credits/mo for $49 = $0.025/credit
  - Growth: 10,000 credits/mo for $149 = $0.015/credit
  - Source: [hunter.io/pricing](https://hunter.io/pricing)
- Hunter.io Company Enrichment: 1 credit per call (charged only if core data returned)
- **Total data provider cost per lead: ~$0.03-0.05**

**Total cost per enriched, scored lead: ~$0.04-0.07**

## Monthly Cost at Scale

| Volume | Claude API | Hunter.io (Growth) | Hosting (Railway) | Total/month |
|--------|-----------|--------------------|--------------------|-------------|
| 500 leads/mo | $5-10 | $149 | $5 | **~$165** |
| 2,000 leads/mo | $20-40 | $149 | $10 | **~$200** |
| 5,000 leads/mo | $50-100 | $299 (Scale) | $20 | **~$420** |
| 10,000 leads/mo | $100-200 | $299 + credit packs | $30 | **~$630** |

## Clay Comparison

| Volume | Clay Cost | This Stack | Savings |
|--------|-----------|------------|---------|
| 500/mo | $185/mo (Launch) | ~$165/mo | $20/mo |
| 2,000/mo | $495/mo (Growth) | ~$200/mo | $295/mo |
| 5,000/mo | $495+ (Growth + top-ups) | ~$420/mo | $75+/mo |
| 10,000/mo | Enterprise (~$2,500+/mo) | ~$630/mo | $1,870+/mo |

Clay pricing source: [clay.com/pricing](https://clay.com/pricing) — Launch $185/mo, Growth $495/mo (March 2026 pricing).

**Key insight:** The savings are most dramatic at enterprise volumes (10K+ leads/mo) where Clay requires custom pricing. At low volumes (<1,000/mo), the savings may not justify the engineering investment.

## Cost Optimization Strategies

1. **Prompt caching**: Cache your system prompt + tool definitions + ICP criteria. Cache reads cost 0.1x base input price. If your system prompt is 2,000 tokens, you save ~$5.40/month per 1,000 leads.

2. **Batch API**: For non-real-time enrichment (e.g., nightly CSV imports), use Claude's Batch API for 50% off all tokens. This cuts Claude costs from ~$0.02 to ~$0.01 per lead.

3. **Model routing**: Use Haiku 4.5 ($1/$5 per MTok) for simple classifications, Sonnet for scoring. A 70/30 Haiku/Sonnet split reduces Claude costs by ~50%.

4. **Hunter.io credit optimization**: Hunter doesn't charge credits when no email is found. Focus on high-quality input data to maximize match rates.

## Upfront Investment

- Developer time: 80-120 hours × your eng hourly rate
- Infrastructure setup: ~$0 (Railway/Fly.io free tiers for dev)
- Data provider accounts: $49-149/mo (Hunter Starter/Growth)

**Break-even at $495/mo Clay plan: ~3-4 months** (accounting for ~$295/mo savings vs. ~$100/hr × 100 hours = $10,000 upfront)
