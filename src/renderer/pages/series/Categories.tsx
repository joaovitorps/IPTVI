import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { SerieCategory } from "../../../types";
import Button from "../../components/Button";

const Categories = () => {
  const [seriesCategories, setSeriesCategories] = useState<SerieCategory[]>();

  useEffect(() => {
    const getSeriesCategories = async () => {
      setSeriesCategories(await window.api.getSeriesCategories());
    };

    getSeriesCategories();
  }, []);

  return (
    <>
      {seriesCategories ? (
        <div className="flex flex-col flex-wrap  gap-2 sm:flex-row">
          {seriesCategories.map((category) => (
            <Button
              key={category.category_id}
              path={`category/${category.category_id}/series`}
            >
              {category.category_name}
            </Button>
          ))}
        </div>
      ) : (
        <Loader2 className="animate-spin" />
      )}
    </>
  );
};

export default Categories;
