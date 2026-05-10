Run the enrichment pipeline on a single test lead. $ARGUMENTS

If the user provided a name and domain, modify `src/examples/enrichment-pipeline.ts` to use those values before running. Otherwise use the default test lead (Jane Doe @ example.com).

```bash
npm run enrich
```

This runs the full Claude API agentic loop:
1. Claude calls enrich_company (Hunter.io) to get company data
2. Claude calls find_email (Hunter.io) to find work email
3. Claude scores the lead 0-100 and explains reasoning
4. Claude calls store_enriched_lead to persist to data/leads.json

Requires ANTHROPIC_API_KEY in .env.
