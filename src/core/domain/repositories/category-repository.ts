import { Category } from "../entities/series/category";

export interface CategoryRepository {
  fetchCategory(): Promise<Category[]>;
}
