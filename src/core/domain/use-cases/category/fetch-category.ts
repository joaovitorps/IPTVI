import { CategoryRepository } from "../../repositories/category-repository";

export class FetchCategory {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute() {
    const categories = await this.categoryRepository.fetchCategory();

    return { categories };
  }
}
