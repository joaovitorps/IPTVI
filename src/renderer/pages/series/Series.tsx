import { useEffect, useState } from "react";
import { useParams } from "react-router";
import type { Serie } from "../../../types";
import { Loader } from "lucide-react";
import Button from "../../components/Button";

const Series = () => {
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
      {series ? (
        series.map((serie) => (
          <div key={serie.series_id}>
            <Button path={`/serie/${serie.series_id}/info`}>
              {serie.name}
            </Button>
          </div>
        ))
      ) : (
        <Loader className="animate-spin" />
      )}
    </>
  );
};

export default Series;
