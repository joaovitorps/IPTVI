import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import { SerieInfo } from "../../../types";
import EpisodeInfo from "./EpisodeInfo";

const SerieInfo = () => {
  const [serieInfo, setSerieInfo] = useState<SerieInfo>();
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const { serieId } = useParams();

  useEffect(() => {
    const getSeriesInfo = async () => {
      setSerieInfo(await window.api.getSerieInfo(Number(serieId)));
    };

    getSeriesInfo();
  }, []);

  return (
    serieInfo && (
      <div>
        Seasons: {serieInfo.seasons.length} - {serieInfo.info.name}
        <Outlet
          context={[
            serieInfo.seasons,
            setSeasonNumber,
            serieInfo.episodes[seasonNumber],
          ]}
        />
        Season {seasonNumber}:
        <EpisodeInfo episodes={serieInfo.episodes[seasonNumber]} />
      </div>
    )
  );
};

export default SerieInfo;
