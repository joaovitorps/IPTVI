import { axiosInstance } from "@/shared/axios";
import { SeriesCategories } from "@/shared/schemas";

import { Category } from "../../entities/category";
import { CategoryRepository } from "../category-repository";

export class APICategoryRepository implements CategoryRepository {
  constructor(
    private readonly server: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  async fetchCategory(): Promise<Category[]> {
    try {
      const response = await axiosInstance(this.server, {
        username: this.username,
        password: this.password,
        action: "get_series_categories",
      }).get("/player_api.php");

      const parsed = SeriesCategories.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return [];
      }

      return parsed.data.map((item) =>
        Category.create({
          id: item.category_id,
          name: item.category_name,
          parentId: item.parent_id,
        }),
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
