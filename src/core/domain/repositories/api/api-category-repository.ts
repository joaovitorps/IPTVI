import { axiosInstance } from "@/shared/axios";
import z from "zod";

import { Category } from "../../entities/series/category";
import { CategoryRepository } from "../category-repository";

const CategoriesSchema = z.array(
  z.object({
    category_id: z.string(),
    category_name: z.string(),
    parent_id: z.coerce.number(),
  }),
);

export class APICategoryRepository implements CategoryRepository {
  constructor(
    private readonly server: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  async fetchCategory() {
    try {
      const response = await axiosInstance(this.server, {
        username: this.username,
        password: this.password,
        action: "get_series_categories",
      }).get("/player_api.php");

      const parsed = CategoriesSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return [];
      }

      const categories: Category[] = parsed.data.map((category) =>
        Category.create(
          { name: category.category_name, parentId: category.parent_id },
          category.category_id,
        ),
      );

      return categories;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
