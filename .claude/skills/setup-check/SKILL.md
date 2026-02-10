---
name: setup-check
description: Verify the project is set up correctly
user-invocable: true
allowed-tools: Bash, Read, Glob
---

Run these checks and report results:

1. Verify `pnpm` is installed: `pnpm --version`
2. Verify `node_modules` exists and `pnpm install` has been run
3. Verify `tsconfig.json` exists and has strict mode enabled
4. Run `pnpm exec tsc --noEmit` and report any type errors
5. Check if a linter is configured and run it if so

Summarize: what's working, what's missing, what needs fixing.
