# DTO Creation Rules

All DTOs (Data Transfer Objects) in this project must follow these architectural rules to ensure consistency and maintainability.

## 1. Location

- DTOs must be defined in `src/shared/types/dto.ts`, NOT alongside domain entities.
- Domain entities in `src/core/domain/entities/` must remain pure — they define domain models, not wire contracts.

## 2. Rationale

- DTOs are a **boundary concern** — they define the shape of data exchanged across layers (main process ↔ preload ↔ renderer).
- All three layers already share `src/shared/types/` via the `@/shared/types/*` alias.
- Keeping DTOs in shared prevents coupling the renderer/UI to `core/domain/entities`.

## 3. Relationship with Entities

- Entities may implement `toJSON()` to serialize themselves into the DTO shape.
- The DTO interface in `shared/types/dto.ts` documents the resulting plain-object contract.
- Do NOT define the DTO interface inside the entity file — define it in shared and use the entity's `toJSON()` to produce it.

## 4. Naming

- Name DTO interfaces with a `DTO` suffix: `CategoryDTO`, `SerieDTO`, etc.
- Export all DTO interfaces.

## TypeScript Conventions

### Array Types

Use `T[]` instead of `Array<T>`.

### ✅ Correct

```ts
type Tracks = HlsTrackInfo[];
```

### ❌ Incorrect

```ts
type Tracks = Array<HlsTrackInfo>;
```

---

### Implementation Example

```typescript
// src/shared/types/dto.ts
export interface CategoryDTO {
  id: string;
  name: string;
  parentId: number;
}
```

```typescript
// src/core/domain/entities/series/category.ts
import { Entity } from "../entity";

export interface CategoryProps {
  name: string;
  parentId: number;
}

export class Category extends Entity<CategoryProps> {
  // ... entity methods ...

  toJSON(): CategoryDTO {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
```
