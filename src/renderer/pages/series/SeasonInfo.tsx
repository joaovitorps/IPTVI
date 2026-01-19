import { useOutletContext } from "react-router";
import { Season } from "../../../types";

const SeasonInfo = () => {
  const [seasons, setSeasonNumber]: [
    Season[],
    React.Dispatch<React.SetStateAction<number>>,
  ] = useOutletContext();

  return (
    <div>
      {seasons &&
        seasons.map((season) => {
          return (
            <button
              key={season.id}
              onClick={() => setSeasonNumber(season.season_number)}
            >
              {season.name}
            </button>
          );
        })}
    </div>
  );
};

export default SeasonInfo;
