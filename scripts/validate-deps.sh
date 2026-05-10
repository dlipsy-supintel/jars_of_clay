#!/usr/bin/env bash
# validate-deps.sh — Verify all referenced repos and APIs are alive and active.
# Run before each guide rebuild: bash scripts/validate-deps.sh

set -o pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0
STALE_MONTHS=12  # Flag repos not pushed within this many months

echo "=== Dependency Validation ==="
echo ""

# --- GitHub repos ---
REPOS=(
  "ruvnet/RuVector"
  "ruvnet/FACT"
)

echo "📦 Checking GitHub repos..."
for repo in "${REPOS[@]}"; do
  response=$(curl -sf "https://api.github.com/repos/$repo" 2>/dev/null)
  if [ $? -ne 0 ]; then
    echo -e "  ${RED}✗ $repo — NOT FOUND or API error${NC}"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  pushed_at=$(echo "$response" | grep '"pushed_at"' | head -1 | sed 's/.*: "//;s/".*//')
  stars=$(echo "$response" | grep '"stargazers_count"' | head -1 | sed 's/[^0-9]//g')

  # Check staleness (simple: compare year-month)
  if [ -n "$pushed_at" ]; then
    push_date=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$pushed_at" "+%s" 2>/dev/null || date -d "$pushed_at" "+%s" 2>/dev/null)
    now=$(date "+%s")
    if [ -n "$push_date" ]; then
      age_days=$(( (now - push_date) / 86400 ))
      stale_days=$((STALE_MONTHS * 30))
      if [ "$age_days" -gt "$stale_days" ]; then
        echo -e "  ${YELLOW}⚠ $repo — stale (last push ${age_days}d ago, threshold ${stale_days}d) ★${stars}${NC}"
        WARNINGS=$((WARNINGS + 1))
        continue
      fi
    fi
  fi

  echo -e "  ${GREEN}✓ $repo — active (pushed: ${pushed_at%T*}) ★${stars}${NC}"
done

echo ""

# --- npm packages ---
NPM_PACKAGES=(
  "jsforce"
  "@hubspot/api-client"
  "@anthropic-ai/sdk"
)

echo "📦 Checking npm packages..."
for pkg in "${NPM_PACKAGES[@]}"; do
  response=$(curl -sf "https://registry.npmjs.org/$pkg" 2>/dev/null)
  if [ $? -ne 0 ]; then
    echo -e "  ${RED}✗ $pkg — NOT FOUND on npm${NC}"
    ERRORS=$((ERRORS + 1))
    continue
  fi
  latest=$(echo "$response" | grep -o '"latest":"[^"]*"' | head -1 | sed 's/.*"latest":"//;s/".*//')
  echo -e "  ${GREEN}✓ $pkg@${latest}${NC}"
done

echo ""

# --- API endpoints (just check they resolve) ---
API_URLS=(
  "https://api.hunter.io"
  "https://api.apollo.io"
  "https://docs.anthropic.com"
)

echo "🌐 Checking API endpoints..."
for url in "${API_URLS[@]}"; do
  status=$(curl -sf -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  if [ "$status" -ge 200 ] && [ "$status" -lt 400 ]; then
    echo -e "  ${GREEN}✓ $url (HTTP $status)${NC}"
  elif [ "$status" -ge 400 ] && [ "$status" -lt 500 ]; then
    echo -e "  ${YELLOW}⚠ $url (HTTP $status — may require auth)${NC}"
    WARNINGS=$((WARNINGS + 1))
  else
    echo -e "  ${RED}✗ $url (HTTP $status)${NC}"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "=== Results ==="
echo -e "Errors:   ${RED}${ERRORS}${NC}"
echo -e "Warnings: ${YELLOW}${WARNINGS}${NC}"

if [ "$ERRORS" -gt 0 ]; then
  echo -e "${RED}FAIL — Fix errors before rebuilding the guide.${NC}"
  exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}PASS with warnings — review stale dependencies.${NC}"
  exit 0
fi

echo -e "${GREEN}PASS — All dependencies validated.${NC}"
exit 0
