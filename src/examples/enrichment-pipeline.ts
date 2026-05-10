/**
 * enrichment-pipeline.ts
 *
 * Minimal lead enrichment pipeline using Claude API tool use.
 * Claude orchestrates which tools to call and in what order.
 *
 * Dependencies:
 *   npm install @anthropic-ai/sdk
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... npx tsx src/examples/enrichment-pipeline.ts
 */

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// --- Tool definitions that Claude can invoke ---

const tools: Anthropic.Tool[] = [
  {
    name: "enrich_company",
    description:
      "Look up company information by domain. Returns description, employee count estimate, and detected technologies.",
    input_schema: {
      type: "object" as const,
      properties: {
        domain: { type: "string", description: "Company domain (e.g. anthropic.com)" },
      },
      required: ["domain"],
    },
  },
  {
    name: "find_email",
    description:
      "Find a person's work email using a waterfall of providers (Hunter → Apollo → pattern matching).",
    input_schema: {
      type: "object" as const,
      properties: {
        first_name: { type: "string" },
        last_name: { type: "string" },
        domain: { type: "string" },
      },
      required: ["first_name", "last_name", "domain"],
    },
  },
  {
    name: "store_enriched_lead",
    description: "Store the fully enriched lead data in the vector database.",
    input_schema: {
      type: "object" as const,
      properties: {
        lead: {
          type: "object",
          description: "The enriched lead object with all fields",
        },
        score: {
          type: "number",
          description: "Lead score 0-100",
        },
        reasoning: {
          type: "string",
          description: "Explanation of the score",
        },
      },
      required: ["lead", "score", "reasoning"],
    },
  },
];

// --- Tool implementations ---
// TODO: Replace stubs with real API calls once API keys are configured.

async function enrichCompany(domain: string) {
  // TODO: Integrate with real data source (Clearbit, company website scraping, etc.)
  console.log(`  [tool] enrich_company: ${domain}`);
  return {
    domain,
    description: `Company at ${domain}`,
    estimated_employees: "50-200",
    technologies: ["React", "AWS", "PostgreSQL"],
    scraped_at: new Date().toISOString(),
  };
}

async function findEmail(firstName: string, lastName: string, domain: string) {
  // TODO: Implement Hunter.io → Apollo.io waterfall
  // Hunter: GET https://api.hunter.io/v2/email-finder?domain=X&first_name=Y&last_name=Z&api_key=KEY
  // Apollo: POST https://api.apollo.io/api/v1/people/match
  console.log(`  [tool] find_email: ${firstName} ${lastName} @ ${domain}`);
  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    provider: "pattern_match",
    confidence: "medium",
    verified: false,
  };
}

async function storeEnrichedLead(lead: unknown, score: number, reasoning: string) {
  // TODO: Integrate with RuVector for vector storage + self-learning
  // See: https://github.com/ruvnet/RuVector for npm bindings
  console.log(`  [tool] store_enriched_lead: score=${score}`);
  return { stored: true, id: `lead_${Date.now()}` };
}

// --- Tool dispatch ---

async function handleToolCall(name: string, input: Record<string, unknown>) {
  switch (name) {
    case "enrich_company":
      return await enrichCompany(input.domain as string);
    case "find_email":
      return await findEmail(
        input.first_name as string,
        input.last_name as string,
        input.domain as string
      );
    case "store_enriched_lead":
      return await storeEnrichedLead(input.lead, input.score as number, input.reasoning as string);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- Main: agentic loop ---

async function enrichLead(lead: { firstName: string; lastName: string; domain: string }) {
  console.log(`\nEnriching lead: ${lead.firstName} ${lead.lastName} @ ${lead.domain}`);

  let messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Enrich this lead and score them for a B2B SaaS company selling developer tools.

Lead:
- Name: ${lead.firstName} ${lead.lastName}
- Company domain: ${lead.domain}

Steps:
1. Enrich the company data
2. Find their work email
3. Based on all data, score the lead 0-100 and explain your reasoning
4. Store the enriched lead with the score

Provide a final summary of what you found.`,
    },
  ];

  // Agentic loop: keep going until Claude stops calling tools
  while (true) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    // Collect tool results for this turn
    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUseBlocks) {
        const result = await handleToolCall(toolUse.name, toolUse.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    } else {
      // Claude is done — extract final text
      const text = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      console.log(`\n--- Result ---\n${text}`);
      return text;
    }
  }
}

// --- Run ---
enrichLead({
  firstName: "Jane",
  lastName: "Doe",
  domain: "example.com",
}).catch(console.error);
