Run the dependency validator to check all referenced repos, npm packages, and API endpoints are alive. Execute:

```bash
bash scripts/validate-deps.sh
```

Report the results. If any checks fail, identify which dependency is broken and suggest a fix (update the reference, remove it, or document it as deprecated in docs/modules.md).
