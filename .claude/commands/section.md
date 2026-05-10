Write or rewrite a specific guide section. The user will specify which section as an argument: $ARGUMENTS

Section mapping:
- executive-summary → docs/01-executive-summary.md
- who-this-is-for → docs/02-who-this-is-for.md
- playbook → docs/03-deployment-playbook.md
- use-cases → docs/04-use-cases.md
- cost-analysis → docs/05-cost-analysis.md
- operations → docs/06-operations.md
- compliance → docs/07-compliance.md
- next-steps → docs/08-next-steps.md
- architecture → docs/architecture.md
- modules → docs/modules.md

Workflow:
1. Read the existing section file first
2. Follow quality rules from CLAUDE.md:
   - Zero fictional API calls — every import must match a real npm package
   - Every referenced GitHub repo must exist and have been pushed within 12 months
   - Code examples must include error handling and be runnable
   - Cost claims must cite sources with links to pricing pages
3. For Claude API code, use `@anthropic-ai/sdk` with model `claude-sonnet-4-6`
4. For Hunter.io, use real endpoints: `https://api.hunter.io/v2/email-finder` and `https://api.hunter.io/v2/companies/find`
5. After writing, remind the user to run `/validate` and `/assemble`
