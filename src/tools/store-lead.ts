import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const DATA_DIR = join(import.meta.dirname ?? ".", "..", "..", "data");
const LEADS_FILE = join(DATA_DIR, "leads.json");

export interface StoredLead {
  id: string;
  firstName: string;
  lastName: string;
  domain: string;
  email: string | null;
  company: Record<string, unknown>;
  score: number;
  reasoning: string;
  enrichedAt: string;
}

/**
 * Store an enriched lead to local JSON storage.
 *
 * This is a simple file-based store designed to be swapped with RuVector later.
 * The interface (storeEnrichedLead / getLeads / getLead) stays the same —
 * only the persistence layer changes.
 */
export async function storeEnrichedLead(
  lead: Record<string, unknown>,
  score: number,
  reasoning: string
): Promise<{ stored: boolean; id: string }> {
  const id = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const record: StoredLead = {
    id,
    firstName: String(lead.firstName ?? lead.first_name ?? ""),
    lastName: String(lead.lastName ?? lead.last_name ?? ""),
    domain: String(lead.domain ?? ""),
    email: (lead.email as string) ?? null,
    company: (lead.company as Record<string, unknown>) ?? {},
    score,
    reasoning,
    enrichedAt: new Date().toISOString(),
  };

  const leads = loadLeads();
  leads.push(record);
  saveLeads(leads);

  return { stored: true, id };
}

export function getLeads(): StoredLead[] {
  return loadLeads();
}

export function getLead(id: string): StoredLead | undefined {
  return loadLeads().find((l) => l.id === id);
}

// --- File I/O ---

function loadLeads(): StoredLead[] {
  if (!existsSync(LEADS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(LEADS_FILE, "utf-8")) as StoredLead[];
  } catch {
    return [];
  }
}

function saveLeads(leads: StoredLead[]): void {
  mkdirSync(dirname(LEADS_FILE), { recursive: true });
  writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
}
