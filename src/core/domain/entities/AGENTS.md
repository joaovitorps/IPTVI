# Entity Creation Rules

All entities in this project must follow these architectural rules to ensure consistency and maintainability.

## 1. Naming Convention

- Entity classes must be named using the singular form.
  - Example: `Category` (Correct), `Categories` (Incorrect).
  - Example: `Serie` (Correct), `Series` (Incorrect).

## 2. Base Class

- All entities must extend the `Entity` base class.
- The `Entity` base class requires a `Props` generic type.

## 3. Properties and Methods

- Use a `props` object to store entity data.
- Do NOT add `set` methods unless explicitly specified for a specific business requirement.
- Only add `get` methods for properties that need to be accessed.
- Entities should have a static `create` method to instantiate them.

## 4. Serialization

- If the entity needs to be serialized into a plain object, implement a `toJSON` method.

---

### Implementation Example

```typescript
import { Entity } from "./entity";

export interface CategoryProps {
  name: string;
  parentId: number;
}

export class Category extends Entity<CategoryProps> {
  static create(props: CategoryProps, id?: string) {
    return new Category(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get parentId(): number {
    return this.props.parentId;
  }

  toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
```
