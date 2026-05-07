# Use Case Creation Rules

All new use cases in this project must follow these architectural rules to ensure consistency and maintainability.

## 1. Naming Convention

- Use case classes must be named using the pattern: `[Purpose]UseCase`.
  - Example: `FetchCategoryUseCase`, `CreatePlaylistUseCase`.

## 2. Structure and Method

- Each use case must be a class.
- Each use case must have exactly one public method named `execute`.
- Use cases must be exported.

## 3. Interfaces (Input/Output)

- Every use case must define and NOT export an entry interface (if have any params to receive) and a return interface (if not void).
- These interfaces must be objects containing the data.
- **Naming Pattern**:
  - Input: `[UseCaseName]Params`
  - Return: `[UseCaseName]Return`
- **Example**:
  - Class: `FetchCategoryUseCase`
  - Input: `FetchCategoryUseCaseParams`
  - Return: `FetchCategoryUseCaseReturn`

## 4. Dependencies

- Use cases must receive their dependencies (like repositories) through the constructor.
- Repositories must be declared as `private` properties pointing to an interface.

## 5. Return Type

- The `execute` method must always return an object (wrapped in the `Return` interface if not void).

---

### Implementation Example

```typescript
export interface FetchCategoryUseCaseParams {
  id: string;
}

export interface FetchCategoryUseCaseReturn {
  category: Category;
}

export class FetchCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute({
    id,
  }: FetchCategoryUseCaseParams): Promise<FetchCategoryUseCaseReturn> {
    // implementation
    return { category };
  }
}
```
