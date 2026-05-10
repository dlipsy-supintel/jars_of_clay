import "dotenv/config";
import express from "express";
import cors from "cors";
import { enrichLead, type EnrichmentInput } from "../lib/pipeline.js";
import { getLeads, getLead } from "../tools/store-lead.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- Health check ---

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasHunterKey: !!process.env.HUNTER_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// --- Enrich a single lead ---

app.post("/api/v1/leads/enrich", async (req, res) => {
  const { firstName, lastName, domain } = req.body as Partial<EnrichmentInput>;

  if (!firstName || !lastName || !domain) {
    res.status(400).json({ error: "firstName, lastName, and domain are required" });
    return;
  }

  try {
    const result = await enrichLead({ firstName, lastName, domain });
    res.json(result);
  } catch (err: unknown) {
    console.error("[enrich] Error:", err);
    res.status(500).json({ error: "Enrichment failed", detail: String(err) });
  }
});

// --- Batch enrich ---

app.post("/api/v1/leads/batch", async (req, res) => {
  const { leads } = req.body as { leads?: EnrichmentInput[] };

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    res.status(400).json({ error: "leads array is required" });
    return;
  }

  if (leads.length > 50) {
    res.status(400).json({ error: "Maximum 50 leads per batch" });
    return;
  }

  // Process sequentially to avoid rate limits
  const results = [];
  for (const lead of leads) {
    try {
      const result = await enrichLead(lead);
      results.push({ ...lead, ...result, status: "success" });
    } catch (err) {
      results.push({ ...lead, status: "error", error: String(err) });
    }
  }

  res.json({ processed: results.length, results });
});

// --- Retrieve stored leads ---

app.get("/api/v1/leads", (_req, res) => {
  const leads = getLeads();
  res.json({ count: leads.length, leads });
});

app.get("/api/v1/leads/:id", (req, res) => {
  const lead = getLead(req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  res.json(lead);
});

// --- Start ---

const PORT = parseInt(process.env.PORT ?? "3001", 10);
app.listen(PORT, () => {
  console.log(`Clay Alternative API running on http://localhost:${PORT}`);
  console.log(`  POST /api/v1/leads/enrich   — enrich a single lead`);
  console.log(`  POST /api/v1/leads/batch    — batch enrich (max 50)`);
  console.log(`  GET  /api/v1/leads          — list stored leads`);
  console.log(`  GET  /api/v1/leads/:id      — get a specific lead`);
  console.log(`  GET  /health                — health check`);
});

export default app;
