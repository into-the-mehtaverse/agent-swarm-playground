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
