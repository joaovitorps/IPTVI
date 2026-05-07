import { Category } from "../../entities/category";
import { CategoryRepository } from "../../repositories/category-repository";

export interface FetchCategoryUseCaseParams {}

export interface FetchCategoryUseCaseReturn {
  categories: Category[];
}

export class FetchCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    _params: FetchCategoryUseCaseParams,
  ): Promise<FetchCategoryUseCaseReturn> {
    const categories = await this.categoryRepository.fetchCategory();

    return { categories };
  }
}
