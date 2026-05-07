import { Category } from "@/core/domain/entities/category";
import { InMemoryCategoryRepository } from "@/core/domain/repositories/in-memory/in-memory-category-repository";
import { FetchCategoryUseCase } from "@/core/domain/use-cases/category/fetch-category";

let sut: FetchCategoryUseCase;
let repository: InMemoryCategoryRepository;

describe("Fetch categories use case", () => {
  it("should be able to fetch the categories", async () => {
    repository = new InMemoryCategoryRepository();
    sut = new FetchCategoryUseCase(repository);
    repository.categories.push(
      Category.create({ name: "test", parentId: 1 }, "1"),
    );

    const { categories } = await sut.execute();

    expect(categories[0].name).toEqual("test");
  });
});
