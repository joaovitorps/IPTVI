import { Category } from "../../entities/series/category";
import { CategoryRepository } from "../../repositories/category-repository";

interface FetchCategoryUseCaseReturn {
  categories: Category[];
}

export class FetchCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<FetchCategoryUseCaseReturn> {
    const categories = await this.categoryRepository.fetchCategory();

    return { categories };
  }
}
