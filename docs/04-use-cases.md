# Use Case Implementations

## Use Case 1: Auto-Enrich Inbound Leads

**Scenario**: 500 inbound leads/month from website forms. Enrich with company data, find work emails, score, and route automatically.

**Implementation**: Set up a webhook endpoint that receives form submissions. Each submission triggers the Claude API enrichment pipeline (Phase 1). Claude calls `enrich_company` and `find_email` tools, classifies the lead using structured outputs, scores it, and stores in RuVector.

**Routing logic** (in the Claude system prompt):
- Score ≥ 80: Sync to CRM as "hot lead", notify sales via Slack webhook
- Score 50-79: Add to nurture sequence
- Score < 50: Store but don't route

**Cost per lead**: ~$0.02-0.05 (see Cost Analysis section)

## Use Case 2: Personal → Work Email Conversion

**Scenario**: PLG users sign up with Gmail/Yahoo. You need to identify their company.

**Implementation**: Define a Claude tool called `resolve_personal_email` that:
1. Takes the user's full name from signup
2. Calls Hunter.io Email Finder with common company domains
3. Falls back to pattern matching across known company domains in RuVector

The key insight: Claude can reason about which company a person likely works for based on context clues (email domain patterns, signup metadata, product usage patterns).

```typescript
// System prompt addition for this use case:
const systemPrompt = `When resolving personal emails to work emails:
1. Use the person's name to search Hunter.io
2. If multiple results, prefer companies matching our ICP
3. Return confidence level: high (verified), medium (pattern match), low (guess)
4. Never fabricate email addresses — return null if unsure`;
```

## Use Case 3: Signal-Based Outreach (PLG → Enterprise)

**Scenario**: Monitor product usage signals and trigger outreach when PLG users show enterprise intent (10+ seats, high feature adoption).

**Implementation**: This is a cron job, not a webhook. Run daily:
1. Query your product database for accounts meeting threshold criteria
2. For each qualifying account, run the enrichment pipeline
3. Claude scores "enterprise readiness" using product signals + enrichment data
4. High-scoring accounts get synced to CRM with signal context

The Claude system prompt includes your specific enterprise readiness criteria:
```
Score enterprise readiness based on:
- Seat count (weight: 0.3) — 10+ seats is strong signal
- Feature adoption (weight: 0.25) — using advanced features
- Company size from enrichment (weight: 0.2) — 50+ employees
- Growth trend (weight: 0.15) — increasing usage over 30 days
- Industry fit (weight: 0.1) — matches our ICP industries
```

## Use Case 4: Custom Industry Taxonomy

**Scenario**: Standard industry categories (SIC, NAICS) don't match your niche. You need custom categories like "Robotics Manufacturers > Automotive Robotics".

**Implementation**: Define your taxonomy in a JSON config, include it in the Claude system prompt via prompt caching (saves 90% on input tokens for repeated classifications), and let Claude classify each enriched company.

```typescript
const taxonomy = {
  "Industrial Robotics": ["Automotive", "Electronics Assembly", "Warehouse"],
  "Collaborative Robotics": ["Cobots", "Human-Robot Interaction"],
  "Specialty Robotics": ["Medical", "Agricultural", "Service"],
  "Robotics Components": ["Sensors", "Actuators", "Control Systems"],
};

// Include in system prompt with cache_control for reuse
// Claude returns: { primaryCategory, subCategory, confidence, reasoning }
```

Because the taxonomy is in the cached system prompt, classifying 1,000 companies costs roughly the same as classifying 10 — the taxonomy tokens are only paid for once.
