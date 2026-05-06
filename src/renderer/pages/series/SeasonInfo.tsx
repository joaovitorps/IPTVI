import { Season } from "@/shared/schemas";
import { useOutletContext } from "react-router";

export const SeasonInfo = () => {
  const [seasons, setSeasonNumber] =
    useOutletContext<
      [Season[], React.Dispatch<React.SetStateAction<number>>]
    >();

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
