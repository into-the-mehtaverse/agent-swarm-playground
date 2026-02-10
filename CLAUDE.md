# Agent Swarm Playground

This is a pnpm starter kit project used to test multi-agent workflows with Claude Code Agent Teams.

## Stack
- **Package manager**: pnpm
- **Runtime**: Node.js / Bun
- **Language**: TypeScript

## Workflow
- Always plan before implementing. Present the plan and wait for approval before writing code.
- When tasks are independent, spawn teammates in parallel.
- When tasks depend on each other, run them sequentially.
- After all teammates finish, run a final validation (typecheck, lint, tests if applicable).

## Conventions
- Use TypeScript strict mode
- Use ES modules (`"type": "module"` in package.json)
- Keep things minimal — no unnecessary dependencies
