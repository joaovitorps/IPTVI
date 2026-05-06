export interface CategoryProps {
  id: number;
  name: string;
  parentId: number;
}

export class Category {
  private props: CategoryProps;

  constructor(props: CategoryProps) {
    this.props = props;
  }

  static create(props: CategoryProps) {
    return new Category(props).toJSON();
  }

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get parentId(): number {
    return this.props.parentId;
  }

  /**
   * Returns a plain object for serialization.
   */
  public toJSON() {
    return this.props as Category;
  }
}
