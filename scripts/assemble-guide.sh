#!/usr/bin/env bash
# assemble-guide.sh — Combine modular docs/ sections into the final deployment guide.
# Usage: bash scripts/assemble-guide.sh

set -o pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOCS_DIR="$PROJECT_ROOT/docs"
OUTPUT="$PROJECT_ROOT/clay_alternative_deployment_guide.md"
TIMESTAMP=$(date -u "+%Y-%m-%d")

echo "Assembling guide from docs/ sections..."

# Header
cat > "$OUTPUT" << EOF
# Clay Alternative: Agentic GTM Intelligence Platform
## Built with RuVector + Claude API

> Auto-assembled on $TIMESTAMP from modular docs.
> Edit sections in \`docs/\`, then run \`bash scripts/assemble-guide.sh\`.

---

EOF

# Assemble sections in order.
# Add new sections here as they're written.
SECTIONS=(
  "01-executive-summary.md"
  "02-who-this-is-for.md"
  "architecture.md"
  "modules.md"
  "03-deployment-playbook.md"
  "04-use-cases.md"
  "05-cost-analysis.md"
  "06-operations.md"
  "07-compliance.md"
  "08-next-steps.md"
)

INCLUDED=0
for section in "${SECTIONS[@]}"; do
  if [ -f "$DOCS_DIR/$section" ]; then
    cat "$DOCS_DIR/$section" >> "$OUTPUT"
    echo -e "\n---\n" >> "$OUTPUT"
    INCLUDED=$((INCLUDED + 1))
  fi
done

# Footer
cat >> "$OUTPUT" << EOF

**Document Version:** 2.0
**Last Assembled:** $TIMESTAMP
**Source:** docs/ directory (modular sections)
**License:** MIT
EOF

echo "✓ Assembled $INCLUDED sections → $OUTPUT"
echo "  Total lines: $(wc -l < "$OUTPUT")"
