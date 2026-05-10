import "dotenv/config";
import { withRetry } from "../lib/retry.js";

export interface CompanyData {
  domain: string;
  name: string | null;
  industry: string | null;
  description: string | null;
  location: string | null;
  employeeCount: string | null;
  foundedYear: number | null;
  tags: string[];
}

/**
 * Enrich company data via Hunter.io Company Enrichment API.
 * Docs: https://hunter.io/api-documentation/v2#company-enrichment
 * Costs 1 credit only if core data (name + category/description/tags + location + size) is returned.
 */
export async function enrichCompany(domain: string): Promise<CompanyData> {
  const empty: CompanyData = {
    domain,
    name: null,
    industry: null,
    description: null,
    location: null,
    employeeCount: null,
    foundedYear: null,
    tags: [],
  };

  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey) {
    console.warn("[enrich-company] HUNTER_API_KEY not set, returning empty");
    return empty;
  }

  const url = new URL("https://api.hunter.io/v2/companies/find");
  url.searchParams.set("domain", domain);
  url.searchParams.set("api_key", apiKey);

  let res: Response;
  try {
    res = await withRetry(
      async () => {
        const r = await fetch(url.toString());
        if (!r.ok) {
          const err = new Error(`Hunter company-find: ${r.status}`) as Error & { status: number };
          err.status = r.status;
          throw err;
        }
        return r;
      },
      { label: "hunter-company-find", maxRetries: 2 }
    );
  } catch {
    console.warn(`[enrich-company] Hunter API failed for ${domain}, returning empty`);
    return empty;
  }

  const json = (await res.json()) as {
    data?: {
      name?: string;
      description?: string;
      location?: string;
      foundedYear?: number;
      category?: { industry?: string };
      metrics?: { employees_range?: string; employees?: number };
      tags?: string[];
    };
  };

  const d = json.data;
  if (!d) return empty;

  return {
    domain,
    name: d.name ?? null,
    industry: d.category?.industry ?? null,
    description: d.description ?? null,
    location: d.location ?? null,
    employeeCount: d.metrics?.employees_range ?? (d.metrics?.employees ? String(d.metrics.employees) : null),
    foundedYear: d.foundedYear ?? null,
    tags: d.tags ?? [],
  };
}
