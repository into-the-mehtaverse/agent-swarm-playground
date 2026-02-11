# Agent Swarm Playground

A pnpm monorepo starter kit with an Expo frontend and Bun backend.

## Architecture

```
├── apps/
│   ├── mobile/          # Expo React Native app
│   └── server/          # Bun backend
├── packages/
│   └── shared/          # Shared TypeScript types and utilities
├── pnpm-workspace.yaml
├── package.json         # Root workspace config
└── tsconfig.base.json   # Shared TS config extended by each package
```

## Stack
- **Monorepo**: pnpm workspaces
- **Frontend**: Expo (React Native)
- **Backend**: Bun
- **Shared types**: `@repo/shared` package in `packages/shared/`
- **Language**: TypeScript (strict mode, ES modules)

## Key rules
- All packages import shared types from `@repo/shared` — never duplicate type definitions
- Each workspace has its own `package.json` and `tsconfig.json` that extends `tsconfig.base.json`
- Use pnpm (never npm or yarn)
- Keep dependencies minimal

## Workflow
- Always plan before implementing. Present the plan and wait for approval before writing code.
- When tasks are independent, spawn teammates in parallel.
- When tasks depend on each other, run them sequentially.
- After all teammates finish, run a final validation (typecheck, lint, tests if applicable).

## Agent hierarchy (MUST follow)
You (Claude) act as the **Orchestrator**. You MUST delegate work using the custom agents defined in `.claude/agents/`. NEVER write code directly or skip levels in the hierarchy.

### Execution flow
1. **You = Orchestrator**: Break the task into discrete subtasks with execution order. Do NOT write code yourself.
2. **Spawn Task Planner agents** (`subagent_type: "Task Planner"`): One per subtask. Each task planner explores the codebase, determines files/changes, and spawns the right worker agents (Implementer, Scaffolder).
3. **Task Planners spawn workers**: Implementers write code, Scaffolders set up config/deps. Task planners coordinate their workers.
4. **Spawn a Validator agent** (`subagent_type: "Validator"`): After ALL implementation is done, always spawn a Validator to run typechecks/lint/tests. Never run validation yourself.

### Rules
- NEVER use `subagent_type: "general-purpose"` or `subagent_type: "Bash"` when a custom agent fits the task.
- NEVER write, edit, or create source files yourself — always delegate to an Implementer or Scaffolder via a Task Planner.
- NEVER run `tsc`, `pnpm test`, or other validation commands yourself — always delegate to a Validator.
- You MAY read files, search code, and run `pnpm install` / `pnpm add` as the orchestrator for planning purposes.
- When spawning agents, use the custom agent names exactly: `"Orchestrator"`, `"Task Planner"`, `"Implementer"`, `"Scaffolder"`, `"Validator"`.
