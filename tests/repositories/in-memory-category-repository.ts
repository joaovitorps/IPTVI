import { Category } from "../../entities/series/category";
import { CategoryRepository } from "../category-repository";

export class InMemoryCategoryRepository implements CategoryRepository {
  categories: Category[] = [];

  fetchCategory = async () => {
    return new Promise<Category[]>((resolve) => {
      return resolve(this.categories);
    });
  };
}
