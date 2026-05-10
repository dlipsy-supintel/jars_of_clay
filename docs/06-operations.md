# Operations & Maintenance

## Health Checks

Add a `/health` endpoint to your API:

```typescript
app.get('/health', async (req, res) => {
  const checks = {
    api: true,
    anthropic: await pingAnthropic(),
    hunter: await pingHunter(),
    ruvector: await pingRuVector(),
  };
  const healthy = Object.values(checks).every(Boolean);
  res.status(healthy ? 200 : 503).json(checks);
});
```

## Monitoring

**Recommended stack** (minimal):
- **Sentry** (free tier): Error tracking for your API. `npm install @sentry/node`
- **UptimeRobot** (free): Ping your `/health` endpoint every 5 minutes
- **Railway/Fly.io built-in metrics**: CPU, memory, request count

**What to alert on:**
- Enrichment failure rate > 10% (data provider issues)
- Claude API latency p95 > 30 seconds (possible rate limiting)
- Hunter.io credit usage > 80% of monthly allocation
- Any 5xx errors from your API

## Common Failure Runbooks

### Hunter.io rate limit hit
**Symptom**: 429 responses from Hunter API
**Fix**: Add exponential backoff with retry. Hunter allows 15 requests/second for Email Finder.
```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try { return await fn(); }
    catch (e: any) {
      if (e.status === 429 && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
      throw e;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Claude API overloaded
**Symptom**: 529 "overloaded" responses
**Fix**: Implement request queuing with a concurrency limit. Don't fire 100 parallel Claude calls — limit to 10-20 concurrent requests.

### CRM sync conflicts
**Symptom**: Duplicate leads in Salesforce/HubSpot
**Fix**: Always use upsert (not create) with email as the external ID. The jsforce example in Phase 3 already does this.

### RuVector storage full
**Symptom**: Write failures to vector DB
**Fix**: Implement a retention policy — archive leads older than 12 months to cold storage (S3/GCS).

## Weekly Maintenance (~1 hour)

1. Check enrichment success rates in your logs
2. Review Claude API spend in Anthropic console
3. Verify Hunter.io credit remaining vs. projected usage
4. Spot-check 5 recently scored leads for quality

## Monthly Maintenance (~4 hours)

1. Review scoring quality: Do high-score leads actually convert? Adjust prompt.
2. Rotate API keys if your security policy requires it
3. Update npm dependencies (`npm audit`, `npm update`)
4. Check `bash scripts/validate-deps.sh` for any stale dependencies
