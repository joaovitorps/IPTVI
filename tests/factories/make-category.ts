import { Category } from "@/core/domain/entities/series/category";
import { faker } from "@faker-js/faker";

export function makeCategory(override: Partial<Category> = {}, id?: string) {
  const category = Category.create(
    {
      name: faker.lorem.sentence(),
      parentId: faker.number.int(),
      ...override,
    },
    id,
  );

  return { category };
}
