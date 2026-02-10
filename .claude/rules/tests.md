---
paths:
  - "tests/**/*"
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

- Use vitest for testing
- Each test file should mirror the source file path (src/utils/foo.ts → tests/utils/foo.test.ts)
- Prefer `describe` / `it` blocks with clear test names
- No snapshot tests unless explicitly requested
