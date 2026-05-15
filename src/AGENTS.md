# Source Tree Rules

## Backend File Naming Convention

All backend files inside `src/main/` and `src/core/` must use lowercase kebab-case filenames.

- Valid: `do-something.ts`
- Valid: `something.ts`
- Invalid: `doSomething.ts`
- Invalid: `Something.ts`

When touching existing backend files that do not follow this convention, prefer renaming them as part of the same feature when safe.

## Workflow Rules

Before requesting approval on any bug fix or implementation change, always run the linter (`npm run lint`) and report the result.
