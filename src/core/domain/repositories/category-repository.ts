import { Category } from "../entities/category";

export interface CategoryRepository {
  fetchCategory(): Promise<Category[]>;
}
