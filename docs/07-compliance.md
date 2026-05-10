# Compliance & Privacy

## GDPR Requirements (EU Leads)

If you process data on EU residents, you must:

1. **Establish a lawful basis** for processing. For B2B lead enrichment, "legitimate interest" (Art. 6(1)(f)) is the most common basis — but you must document your Legitimate Interest Assessment (LIA).

2. **Provide a privacy notice** that discloses:
   - What data you collect and from which sources (Hunter.io, Apollo, etc.)
   - How you use it (enrichment, scoring, outreach)
   - How long you retain it
   - How to request deletion

3. **Honor data subject requests** within 30 days:
   - Right to access: Export all data you hold on a person
   - Right to deletion: Remove from RuVector, CRM, and any backups
   - Right to object: Stop processing and add to suppression list

4. **Maintain a suppression list**: When someone opts out, add them to a global suppression list. Check this list before every enrichment run.

## CCPA Requirements (California Residents)

Similar to GDPR but with key differences:
- Consumers can opt out of "sale" of personal information (enrichment data may qualify)
- You must provide a "Do Not Sell My Personal Information" link
- 45-day response window for data requests (vs. GDPR's 30)

## Data Retention Policy

Implement these retention rules in your system:

| Data Type | Retention Period | Action at Expiry |
|-----------|-----------------|------------------|
| Enriched lead data | 12 months from last update | Archive to cold storage or delete |
| Scoring history | 24 months | Anonymize (remove PII, keep scores for model training) |
| Raw API responses | 30 days | Delete (these contain third-party data) |
| Suppression list | Indefinite | Never delete — this prevents re-processing opted-out contacts |
| CRM sync logs | 90 days | Delete |

## Implementation Checklist

- [ ] Add suppression list check before every enrichment pipeline run
- [ ] Implement `/api/v1/data-request` endpoint for access/deletion requests
- [ ] Log all data processing activities (who, what, when, lawful basis)
- [ ] Add `data_retention_expires_at` field to RuVector records
- [ ] Set up a weekly cron job to purge expired records
- [ ] Document your data processing activities in a Record of Processing Activities (ROPA)

## Data Provider Compliance

When using Hunter.io, Apollo, or similar providers:
- Verify their DPA (Data Processing Agreement) covers your use case
- Ensure they are GDPR-compliant data processors
- Hunter.io's DPA: Available upon request via their legal team
- Apollo.io's DPA: Available at apollo.io/legal

**Do not** store raw data provider responses longer than needed. Extract the fields you need, store those in RuVector, and discard the raw response within 30 days.
