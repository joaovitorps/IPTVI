import { useEffect, useState } from "react";

import SerieCategory from "../components/SerieCategory";
import { Loader2 } from "lucide-react";

const SeriesCategories = () => {
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
            <SerieCategory key={category.category_id} category={category} />
          ))}
        </div>
      ) : (
        <Loader2 className="animate-spin" />
      )}
    </>
  );
};

export default SeriesCategories;
