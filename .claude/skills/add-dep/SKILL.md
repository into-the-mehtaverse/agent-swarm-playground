---
name: add-dep
description: Add a dependency with justification
user-invocable: true
allowed-tools: Bash, Read, WebSearch
argument-hint: <package-name>
---

The user wants to add the dependency: $ARGUMENTS

Before installing:
1. Search the web for the package to confirm it exists and is actively maintained
2. Check the current package.json for similar/overlapping packages already installed
3. State why this package is needed and if there are lighter alternatives
4. Install with `pnpm add $ARGUMENTS` (or `pnpm add -D $ARGUMENTS` if it's a dev tool)
5. Show the updated dependencies from package.json
