import { Episode } from "../../../types";

const EpisodeInfo = ({ episodes }: { episodes: Array<Episode> }) => {
  return (
    episodes &&
    episodes.map((episode) => {
      return <div key={episode.id}>{episode.title}</div>;
    })
  );
};

export default EpisodeInfo;
