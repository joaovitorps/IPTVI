import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Serie } from "../types";
import { Loader } from "lucide-react";

const SeriesCategory = () => {
  const [series, setSeries] = useState<Serie[]>();

  const { categoryId } = useParams();

  useEffect(() => {
    const getSeriesCategory = async () => {
      setSeries(await window.api.getSeriesCategory(Number(categoryId)));
    };

    getSeriesCategory();
  }, [categoryId]);

  return (
    <>
      <Link to={"/"}>Back</Link> - SeriesCategory
      {series ? (
        series.map((serie) => <div key={serie.series_id}>{serie.name}</div>)
      ) : (
        <Loader className="animate-spin" />
      )}
    </>
  );
};

export default SeriesCategory;
