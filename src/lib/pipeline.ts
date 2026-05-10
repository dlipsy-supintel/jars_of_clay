import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import { findEmail } from "../tools/find-email.js";
import { enrichCompany } from "../tools/enrich-company.js";
import { storeEnrichedLead } from "../tools/store-lead.js";

const client = new Anthropic();

// --- Tool definitions for Claude ---

const tools: Anthropic.Tool[] = [
  {
    name: "enrich_company",
    description:
      "Look up company information by domain. Returns name, industry, description, location, employee count, and tags. Uses Hunter.io Company Enrichment API.",
    input_schema: {
      type: "object" as const,
      properties: {
        domain: { type: "string", description: "Company domain (e.g. stripe.com)" },
      },
      required: ["domain"],
    },
  },
  {
    name: "find_email",
    description:
      "Find a person's work email address. Uses Hunter.io Email Finder with pattern-match fallback. Returns email, provider, confidence score, and verification status.",
    input_schema: {
      type: "object" as const,
      properties: {
        first_name: { type: "string", description: "Person's first name" },
        last_name: { type: "string", description: "Person's last name" },
        domain: { type: "string", description: "Company domain" },
      },
      required: ["first_name", "last_name", "domain"],
    },
  },
  {
    name: "store_enriched_lead",
    description:
      "Store the fully enriched lead with its score and reasoning in the database. Call this after enrichment and scoring are complete.",
    input_schema: {
      type: "object" as const,
      properties: {
        lead: { type: "object", description: "The enriched lead object with all collected fields" },
        score: { type: "number", description: "Lead score from 0 to 100" },
        reasoning: { type: "string", description: "Explanation of why this score was assigned" },
      },
      required: ["lead", "score", "reasoning"],
    },
  },
];

// --- Tool dispatch — calls real implementations ---

async function handleToolCall(
  name: string,
  input: Record<string, unknown>
): Promise<unknown> {
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
      return await storeEnrichedLead(
        input.lead as Record<string, unknown>,
        input.score as number,
        input.reasoning as string
      );

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// --- Public API ---

export interface EnrichmentInput {
  firstName: string;
  lastName: string;
  domain: string;
}

export interface EnrichmentResult {
  leadId: string | null;
  score: number | null;
  summary: string;
  toolCalls: string[];
}

/**
 * Run the full enrichment pipeline for a single lead.
 * Claude orchestrates tool calls dynamically.
 */
export async function enrichLead(lead: EnrichmentInput): Promise<EnrichmentResult> {
  const toolCalls: string[] = [];

  let messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content: `Enrich this lead for a B2B SaaS company. Use the available tools to:
1. Look up the company data for their domain
2. Find their work email
3. Score the lead from 0-100 based on all collected data (consider company size, industry relevance, and data quality)
4. Store the enriched lead with the score and your reasoning

Lead:
- First name: ${lead.firstName}
- Last name: ${lead.lastName}
- Company domain: ${lead.domain}

After completing all steps, provide a brief summary of what you found.`,
    },
  ];

  let leadId: string | null = null;
  let score: number | null = null;

  // Agentic loop — Claude decides which tools to call and when to stop
  for (let turn = 0; turn < 10; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      tools,
      messages,
    });

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        toolCalls.push(toolUse.name);
        const result = await handleToolCall(toolUse.name, toolUse.input as Record<string, unknown>);

        // Capture store result for the response
        if (toolUse.name === "store_enriched_lead") {
          const storeResult = result as { stored: boolean; id: string };
          leadId = storeResult.id;
          const storeInput = toolUse.input as Record<string, unknown>;
          score = (storeInput.score as number) ?? null;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });
    } else {
      // Claude is done — extract final summary
      const summary = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      return { leadId, score, summary, toolCalls };
    }
  }

  return { leadId, score, summary: "Pipeline reached max turns without completing.", toolCalls };
}
