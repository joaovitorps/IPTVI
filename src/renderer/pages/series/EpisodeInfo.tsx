import { Episode } from "@/shared/schemas";
import { Clock, Play } from "lucide-react";
import { useNavigate } from "react-router";

export const EpisodeInfo = ({
  episodes,
  serieId,
  seasonNumber,
}: {
  episodes: Episode[];
  serieId: string;
  seasonNumber: number;
}) => {
  const navigate = useNavigate();

  if (!episodes || episodes.length === 0) {
    return (
      <div className="text-gray-500 py-8 text-center bg-gray-900/50 rounded-xl border border-dashed border-gray-800">
        No episodes found for this season.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {episodes.map((episode) => (
        <div
          key={episode.id}
          onClick={() => {
            void navigate(
              `/play/stream/${episode.id}/?seriesId=${serieId}&season=${seasonNumber}`,
            );
          }}
          className="group flex items-center gap-4 p-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/50 rounded-xl transition-all cursor-pointer"
        >
          <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
            {episode.info?.movie_image ? (
              <img
                src={episode.info.movie_image}
                alt={episode.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-purple-500/10">
                <Play className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 fill-white text-white ml-0.5" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                Episode {episode.episode_num}
              </span>
              {episode.info?.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{episode.info.duration}</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
              {episode.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
              {episode.info?.plot || "No description available."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
