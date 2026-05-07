import { axiosInstance } from "@/shared/axios";
import { SeriesCategories } from "@/shared/schemas";

import { Category } from "../../entities/category";
import { Credentials } from "../../entities/object-values/credentials";
import { CategoryRepository } from "../category-repository";

export class APICategoryRepository implements CategoryRepository {
  constructor(private readonly credentials: Credentials) {}

  async fetchCategory() {
    const { server, username, password } = this.credentials;

    try {
      const response = await axiosInstance(server, {
        username,
        password,
        action: "get_series_categories",
      }).get("/player_api.php");

      const parsed = SeriesCategories.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return [];
      }

      return parsed.data.map((item) =>
        Category.create(
          {
            name: item.category_name,
            parentId: item.parent_id,
          },
          item.category_id,
        ),
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
