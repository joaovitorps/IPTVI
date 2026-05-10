import { FetchCategoryUseCase } from "@/core/domain/use-cases/category/fetch-category";
import { makeCategory } from "@tests/factories/make-category";
import { InMemoryCategoryRepository } from "@tests/repositories/in-memory-category-repository";

describe("Fetch categories use case", () => {
  let sut: FetchCategoryUseCase;
  let repository: InMemoryCategoryRepository;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    sut = new FetchCategoryUseCase(repository);
  });

  it("should be able to fetch the categories", async () => {
    const { category } = makeCategory();
    repository.categories.push(category);

    const { categories } = await sut.execute();

    expect(categories[0].name).toEqual(category.name);
  });
});
