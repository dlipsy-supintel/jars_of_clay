# Deployment Playbook

## Phase 1: Foundation (Week 1)

### Step 1.1: Project Setup

```bash
mkdir clay-alternative && cd clay-alternative
npm init -y
npm install @anthropic-ai/sdk typescript tsx @types/node dotenv
npx tsc --init --target es2022 --module nodenext --moduleResolution nodenext
```

Create `.env` (never commit this):
```
ANTHROPIC_API_KEY=sk-ant-...
HUNTER_API_KEY=...
APOLLO_API_KEY=...
```

Create `.env.example` (commit this):
```
ANTHROPIC_API_KEY=
HUNTER_API_KEY=
APOLLO_API_KEY=
```

### Step 1.2: Build the Email Finder (Hunter.io Waterfall)

This calls the real Hunter.io API. See https://hunter.io/api-documentation/v2#email-finder

```typescript
// src/tools/find-email.ts
import 'dotenv/config';

interface EmailResult {
  email: string | null;
  provider: string;
  confidence: number;
  verified: boolean;
}

export async function findEmail(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EmailResult> {
  // Provider 1: Hunter.io
  const hunterResult = await hunterLookup(firstName, lastName, domain);
  if (hunterResult) return hunterResult;

  // Provider 2: Pattern matching fallback
  return patternFallback(firstName, lastName, domain);
}

async function hunterLookup(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EmailResult | null> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) throw new Error('HUNTER_API_KEY not set');

  const url = new URL('https://api.hunter.io/v2/email-finder');
  url.searchParams.set('domain', domain);
  url.searchParams.set('first_name', firstName);
  url.searchParams.set('last_name', lastName);
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const json = await res.json();
  const data = json?.data;

  if (data?.email) {
    return {
      email: data.email,
      provider: 'hunter',
      confidence: data.score ?? 0,
      verified: data.verification?.status === 'valid',
    };
  }
  return null;
}

function patternFallback(
  firstName: string,
  lastName: string,
  domain: string
): EmailResult {
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  return { email, provider: 'pattern', confidence: 30, verified: false };
}
```

### Step 1.3: Build the Company Enricher (Hunter.io)

```typescript
// src/tools/enrich-company.ts
import 'dotenv/config';

export interface CompanyData {
  domain: string;
  name: string | null;
  industry: string | null;
  description: string | null;
  location: string | null;
  size: string | null;
}

export async function enrichCompany(domain: string): Promise<CompanyData> {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) throw new Error('HUNTER_API_KEY not set');

  const url = new URL('https://api.hunter.io/v2/companies/find');
  url.searchParams.set('domain', domain);
  url.searchParams.set('api_key', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return { domain, name: null, industry: null, description: null, location: null, size: null };
  }

  const json = await res.json();
  const d = json?.data;

  return {
    domain,
    name: d?.name ?? null,
    industry: d?.category?.industry ?? null,
    description: d?.description ?? null,
    location: d?.location ?? null,
    size: d?.metrics?.employees_range ?? d?.metrics?.employees ?? null,
  };
}
```

### Step 1.4: Wire into Claude API Tool Use

See `src/examples/enrichment-pipeline.ts` in this repo for the full agentic loop.
The pattern: define tools → let Claude decide which to call → execute → return results → loop until done.

**Verification:** Run the example with a test lead:
```bash
ANTHROPIC_API_KEY=sk-... npx tsx src/examples/enrichment-pipeline.ts
```

You should see Claude calling `enrich_company`, `find_email`, and `store_enriched_lead` in sequence, then returning a summary with a score.

## Phase 2: Scoring & Persistence (Week 2)

### Step 2.1: Install RuVector

```bash
# Via npm (recommended for quick start)
npm install ruvector

# Or build from source (requires Rust toolchain)
git clone https://github.com/ruvnet/RuVector.git
cd RuVector && npm run build
```

### Step 2.2: Store Enriched Leads

```typescript
// src/tools/store-lead.ts
// TODO: Replace with actual RuVector npm API once bindings are validated.
// The API surface below is based on RuVector's README and npm package.
// Run `npm test` after implementation to verify.

export async function storeEnrichedLead(lead: Record<string, unknown>, score: number, reasoning: string) {
  // Step 1: Generate embedding from lead description
  // RuVector handles embedding generation internally via its HNSW index

  // Step 2: Store in RuVector with metadata
  // The self-learning feature automatically tracks scoring patterns

  console.log(`[store] Lead stored: score=${score}, reasoning=${reasoning.slice(0, 50)}...`);
  return { stored: true, id: `lead_${Date.now()}` };
}
```

### Step 2.3: Lead Scoring with Claude Structured Outputs

Add a scoring tool that Claude calls after enrichment:

```typescript
// Claude will produce this structure via tool use:
// {
//   "score": 0-100,
//   "reasoning": "string explaining the score",
//   "urgency": "low" | "medium" | "high",
//   "recommended_action": "string"
// }
```

The scoring logic lives in the Claude prompt, not in code. This means you can iterate on scoring criteria by changing the system prompt — no deploys needed.

## Phase 3: CRM Sync (Week 3)

### Step 3.1: Salesforce Integration

```bash
npm install jsforce@3  # v3.x is current
```

```typescript
// src/integrations/salesforce.ts
import jsforce from 'jsforce';

const conn = new jsforce.Connection({
  loginUrl: process.env.SF_LOGIN_URL ?? 'https://login.salesforce.com',
});

export async function syncToSalesforce(lead: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  score: number;
}) {
  await conn.login(
    process.env.SF_USERNAME!,
    process.env.SF_PASSWORD! + (process.env.SF_TOKEN ?? '')
  );

  const result = await conn.sobject('Lead').upsert(
    {
      Email: lead.email,
      FirstName: lead.firstName,
      LastName: lead.lastName,
      Company: lead.company,
      LeadSource: 'Clay Alternative',
      // Custom fields (create these in Salesforce first):
      // Lead_Score__c: lead.score,
    },
    'Email' // external ID field for upsert
  );

  return { success: result.success, id: result.id };
}
```

### Step 3.2: HubSpot Alternative

```bash
npm install @hubspot/api-client
```

```typescript
// src/integrations/hubspot.ts
import { Client } from '@hubspot/api-client';

const hubspot = new Client({ accessToken: process.env.HUBSPOT_TOKEN });

export async function syncToHubspot(lead: {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}) {
  const response = await hubspot.crm.contacts.basicApi.create({
    properties: {
      firstname: lead.firstName,
      lastname: lead.lastName,
      email: lead.email,
      company: lead.company,
    },
    associations: [],
  });
  return { id: response.id };
}
```

## Phase 4: API & Dashboard (Week 4)

### Step 4.1: Express API

```bash
npm install express cors
npm install -D @types/express @types/cors
```

```typescript
// src/api/server.ts
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/v1/leads/enrich', async (req, res) => {
  const { firstName, lastName, domain } = req.body;
  // Call the enrichment pipeline (see Phase 1)
  // Return result
  res.json({ status: 'processing', leadId: `${firstName}-${lastName}` });
});

app.post('/api/v1/leads/batch', async (req, res) => {
  const { leads } = req.body;
  // Process batch via Claude Batch API (50% discount)
  res.json({ status: 'queued', count: leads.length });
});

app.listen(3001, () => console.log('API running on :3001'));
```

### Step 4.2: Dashboard (Next.js)

```bash
npx create-next-app@latest dashboard --typescript --tailwind --app
cd dashboard
npm install @tanstack/react-query
```

The dashboard is a standard Next.js app that calls your API. Key pages:
- `/` — Lead table with scores, enrichment status
- `/lead/[id]` — Detail view with company data, scoring reasoning
- `/settings` — API key management, ICP criteria

### Step 4.3: Deployment

```bash
# Option A: Railway (simplest)
npm install -g @railway/cli
railway login && railway init && railway up

# Option B: Docker
docker build -t clay-alt . && docker run -p 3001:3001 clay-alt

# Option C: Fly.io
flyctl launch && flyctl deploy
```

## Phase 5: Signal Monitoring (Weeks 5-8)

This phase adds monitoring for job changes, funding announcements, and other signals. Implementation depends on your data sources:

- **Job changes**: Poll LinkedIn Sales Navigator API or use a webhook service
- **Funding signals**: Crunchbase API or PitchBook
- **Website changes**: Periodic scraping with Playwright + diff detection

Each signal feeds back into the Claude scoring pipeline, which updates the lead score in RuVector.

**This phase is optional at launch.** Ship Phases 1-4 first, validate with real leads, then add signals based on what your sales team actually needs.
