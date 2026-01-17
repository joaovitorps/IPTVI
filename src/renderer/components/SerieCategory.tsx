import { Link } from "react-router";
import type { SerieCategory } from "../types";

const SerieCategory = ({ category }: { category: SerieCategory }) => {
  const { category_id, category_name } = category;

  return (
    <Link
      to={`/${category_id}`}
      className="bg-purple-500 cursor-pointer p-1 rounded-md"
    >
      {category_name}
    </Link>
  );
};

export default SerieCategory;
