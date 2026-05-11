import { SerieDTO } from "@/shared/types/dto";
import { Calendar, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";

import { EpisodeInfo } from "./EpisodeInfo";

export const SerieInfoView = () => {
  const [serieInfo, setSerieInfo] = useState<SerieDTO>();
  const [seasonNumber, setSeasonNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const { serieId } = useParams();

  useEffect(() => {
    const getSeriesInfo = async () => {
      try {
        setIsLoading(true);
        const res = await window.api.serie.getById(Number(serieId));
        setSerieInfo(res);
        if (res.seasons && res.seasons.length > 0) {
          setSeasonNumber(res.seasons[0].seasonNumber);
        }
      } catch (error) {
        console.error("Failed to fetch serie info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (serieId) {
      void getSeriesInfo();
    }
  }, [serieId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!serieInfo) return null;

  const currentSeason = serieInfo.seasons.find(
    (s) => s.seasonNumber === seasonNumber,
  );
  const currentEpisodes = currentSeason?.episodes || [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0">
          <img
            src={serieInfo.cover}
            alt={serieInfo.name}
            className="w-full h-full object-cover opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-linear-to-t from-gray-950 via-gray-950/50 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end">
            <img
              src={serieInfo.cover}
              alt={serieInfo.name}
              className="w-48 md:w-64 rounded-xl shadow-2xl border border-white/10"
            />
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {serieInfo.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm mb-6 text-gray-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-white">
                    {serieInfo.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{serieInfo.episodeRunTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{serieInfo.releaseDate}</span>
                </div>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">
                  {serieInfo.genre}
                </span>
              </div>
              <p className="text-gray-300 max-w-3xl line-clamp-4 text-lg">
                {serieInfo.plot}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Seasons Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-6">Seasons</h2>
            <div className="flex flex-col gap-2">
              {serieInfo.seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSeasonNumber(season.seasonNumber)}
                  className={`text-left px-4 py-3 rounded-lg transition-all ${
                    seasonNumber === season.seasonNumber
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                      : "bg-gray-900 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <div className="font-semibold">{season.name}</div>
                  <div className="text-xs opacity-60">
                    {season.episodeCount} Episodes
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Episodes List */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                Episodes - Season {seasonNumber}
              </h2>
            </div>
            <EpisodeInfo
              episodes={currentEpisodes}
              serieId={serieId!}
              seasonNumber={seasonNumber}
            />
          </div>
        </div>
      </div>

      <Outlet context={[serieInfo.seasons, setSeasonNumber, currentEpisodes]} />
    </div>
  );
};
