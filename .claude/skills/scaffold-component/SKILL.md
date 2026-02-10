---
name: scaffold-component
description: Scaffold a new TypeScript module with tests
user-invocable: true
allowed-tools: Read, Write, Glob
argument-hint: <module-name>
---

Create a new module called `$ARGUMENTS`:

1. Create `src/$ARGUMENTS.ts` with a single exported function stub
2. Create `tests/$ARGUMENTS.test.ts` with a basic test skeleton using vitest
3. Follow existing patterns in `src/` — if no files exist yet, use a minimal style

Keep both files minimal. Do not add unnecessary boilerplate.
