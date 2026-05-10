Scaffold a new clay-alternative project. If in the jars_of_clay repo, confirm with the user before overwriting. If in a different directory, create the full structure:

```
CLAUDE.md
.gitignore
docs/
  01-executive-summary.md
  02-who-this-is-for.md
  03-deployment-playbook.md
  04-use-cases.md
  05-cost-analysis.md
  06-operations.md
  07-compliance.md
  08-next-steps.md
  architecture.md
  modules.md
src/examples/
  enrichment-pipeline.ts
scripts/
  validate-deps.sh
  assemble-guide.sh
.github/workflows/
  validate.yml
.claude/commands/
  validate.md
  assemble.md
  section.md
  cost.md
  scaffold.md
```

Use the canonical template at github.com/dlipsy-supintel/jars_of_clay as reference. The enrichment pipeline must use `@anthropic-ai/sdk` with `claude-sonnet-4-6` and real Hunter.io API endpoints. Include Claude Code commands in `.claude/commands/` so the scaffolded project also has slash commands.
