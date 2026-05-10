# Executive Summary

This guide is a blueprint for building a **Clay alternative** — a self-hosted GTM intelligence platform that handles lead enrichment, scoring, classification, and CRM sync.

The stack: **RuVector** (vector memory) + **Claude API** (AI brain) + direct data provider integrations.

## Why Build This

Clay is excellent. It's also $185-495+/month and locks you into their orchestration layer. If your startup needs:

- **Full control** over enrichment logic, scoring models, and data pipelines
- **Lower marginal cost** at scale (Claude API tokens are cheap; you own the compute)
- **Self-hosted data** for compliance-sensitive industries
- **Custom AI classification** beyond what Clay's Claygent offers

...then building your own is worth the upfront investment.

## Honest Tradeoffs

This is **not** a drop-in Clay replacement. Here's what you gain and what you lose:

**You gain:**
- Complete control over data pipelines and scoring logic
- Claude API's full reasoning capability for classification and scoring
- RuVector's self-learning patterns that improve scoring over time
- No per-record platform fees — just API costs and hosting
- Ability to use any data provider via direct API calls

**You lose:**
- Clay's 150+ pre-built data provider integrations (you build what you need)
- Clay's visual workflow builder (you write code instead)
- Clay's Sculptor natural language workflow builder
- Zero-setup time (Clay works out of the box; this takes 4-8 weeks)
- Clay's community, templates, and support ecosystem

**Break-even estimate:** If you're spending $495+/month on Clay's Growth plan and have engineering time available, this approach breaks even in ~3-4 months. Below that spend, Clay is likely more cost-effective.

## What's Different About This Guide

The original version of this guide referenced 15 open-source modules, most with fictional API examples that didn't compile. This rebuild:

- Uses **3 core dependencies** instead of 15
- Every code example uses **real library APIs** (verified against npm/PyPI)
- Cost projections cite **actual pricing pages** with math shown
- Architecture is designed for a **2-3 person eng team**, not a platform team
