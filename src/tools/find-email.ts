import "dotenv/config";
import { withRetry } from "../lib/retry.js";

export interface EmailResult {
  email: string | null;
  provider: string;
  confidence: number;
  verified: boolean;
}

/**
 * Find a work email via Hunter.io → pattern-match fallback.
 * Hunter API docs: https://hunter.io/api-documentation/v2#email-finder
 */
export async function findEmail(
  firstName: string,
  lastName: string,
  domain: string
): Promise<EmailResult> {
  // Provider 1: Hunter.io
  const apiKey = process.env.HUNTER_API_KEY;
  if (apiKey) {
    const hunterResult = await hunterLookup(firstName, lastName, domain, apiKey);
    if (hunterResult) return hunterResult;
  } else {
    console.warn("[find-email] HUNTER_API_KEY not set, skipping Hunter.io");
  }

  // Fallback: pattern matching
  return patternFallback(firstName, lastName, domain);
}

async function hunterLookup(
  firstName: string,
  lastName: string,
  domain: string,
  apiKey: string
): Promise<EmailResult | null> {
  const url = new URL("https://api.hunter.io/v2/email-finder");
  url.searchParams.set("domain", domain);
  url.searchParams.set("first_name", firstName);
  url.searchParams.set("last_name", lastName);
  url.searchParams.set("api_key", apiKey);

  const res = await withRetry(
    async () => {
      const r = await fetch(url.toString());
      if (!r.ok) {
        const err = new Error(`Hunter email-finder: ${r.status}`) as Error & { status: number };
        err.status = r.status;
        throw err;
      }
      return r;
    },
    { label: "hunter-email-finder", maxRetries: 2 }
  );

  const json = (await res.json()) as {
    data?: { email?: string; score?: number; verification?: { status?: string } };
  };

  if (json.data?.email) {
    return {
      email: json.data.email,
      provider: "hunter",
      confidence: json.data.score ?? 0,
      verified: json.data.verification?.status === "valid",
    };
  }

  return null; // Hunter found nothing — fall through
}

function patternFallback(firstName: string, lastName: string, domain: string): EmailResult {
  const f = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const l = lastName.toLowerCase().replace(/[^a-z]/g, "");
  return {
    email: `${f}.${l}@${domain}`,
    provider: "pattern",
    confidence: 25,
    verified: false,
  };
}
