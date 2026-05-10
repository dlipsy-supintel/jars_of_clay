Start the Clay Alternative enrichment API server:

```bash
npm run dev
```

The server runs on http://localhost:3001 with these endpoints:
- POST /api/v1/leads/enrich — enrich a single lead (requires firstName, lastName, domain)
- POST /api/v1/leads/batch — batch enrich up to 50 leads
- GET  /api/v1/leads — list all stored enriched leads
- GET  /api/v1/leads/:id — get a specific lead
- GET  /health — health check (shows API key status)

Requires ANTHROPIC_API_KEY in .env. HUNTER_API_KEY is optional (falls back to pattern matching).
