# Components Pattern

## className Utility

All Tailwind `className` props must use the `cn()` utility from `@renderer/lib/utils` (which wraps `clsx` + `tailwind-merge`).

### Syntax

Each class must be a separate string argument — no grouping multiple classes in one string.

### ✅ Correct

```tsx
import { cn } from "@renderer/lib/utils"

<div className={cn("flex", "items-center", "gap-2", "p-4")}>
```

### ❌ Incorrect

```tsx
<div className="flex items-center gap-2 p-4">
```

```tsx
// Also incorrect — classes ganged in a single string
<div className={cn("flex items-center gap-2 p-4")}>
```

### Canonical Class Names

Prefer Tailwind v4 canonical class names over deprecated v3 equivalents. Run `suggestCanonicalClasses` from tailwind-merge to detect non-canonical names.

| Deprecated (v3)    | Canonical (v4)   |
| ------------------ | ---------------- |
| `bg-gradient-to-t` | `bg-linear-to-t` |
| `bg-gradient-to-r` | `bg-linear-to-r` |
| `bg-gradient-to-b` | `bg-linear-to-b` |
| `bg-gradient-to-l` | `bg-linear-to-l` |

### Why

- `tailwind-merge` resolves conflicting Tailwind classes (e.g., `p-4` + `p-6`)
- `clsx` handles conditional classes cleanly
- Array-style makes each class explicit and easier to read/modify
- Canonical names prevent deprecation warnings and ensure v4 compatibility
- Always favor explicit `cn()` wrapping instead of raw strings
