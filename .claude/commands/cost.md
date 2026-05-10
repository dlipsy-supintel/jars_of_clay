Recalculate the cost analysis with current API pricing. Steps:

1. Fetch current pricing from these sources (use web search or check docs):
   - Claude API: docs.anthropic.com/en/docs/about-claude/pricing
   - Hunter.io: hunter.io/pricing
   - Clay.com: clay.com/pricing

2. Recalculate per-lead costs using the skill's cost model:
   - Claude Sonnet 4.6: $3/MTok input, $15/MTok output, cache reads $0.30/MTok
   - Claude Haiku 4.5: $1/MTok input, $5/MTok output
   - A typical enrichment pipeline = 3-4 Claude API turns, ~2,000 input tokens total, ~1,500 output tokens total
   - Hunter.io: 1 credit per found email, 1 credit per company enrichment

3. Update docs/05-cost-analysis.md with new numbers
4. Remind user to run `/assemble` after
