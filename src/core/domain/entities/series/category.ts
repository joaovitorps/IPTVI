import { CategoryDTO } from "@/shared/types/dto";

import { Entity } from "../entity";

export interface CategoryProps {
  name: string;
  parentId: number;
}

export class Category extends Entity<CategoryProps> {
  static create(props: CategoryProps, id?: string) {
    return new Category(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get parentId(): number {
    return this.props.parentId;
  }

  public toJSON(): CategoryDTO {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
