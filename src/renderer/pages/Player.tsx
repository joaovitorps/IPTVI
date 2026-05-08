import { Episode, SerieInfo } from "@/shared/schemas";
import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { ArrowLeft, FastForward, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

export const Player = () => {
  const { streamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerRef = useRef<MediaPlayerInstance>(null);

  const queryParams = new URLSearchParams(location.search);
  const seriesId = queryParams.get("seriesId");

  const [serieInfo, setSerieInfo] = useState<SerieInfo | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNextEpisodePrompt, setShowNextEpisodePrompt] = useState(false);

  const buildStreamUrl = (id: string) => {
    return `http://localhost:9876/stream?streamId=${id}`;
    // return `http://cdn23.in/series/FernandaSantos/83136955925/${id}.mkv`;
  };

  const loadSerieData = useCallback(async () => {
    if (!seriesId || !streamId) return;

    try {
      const res = await window.api.getSerieInfo(Number(seriesId));
      setSerieInfo(res);

      // Find current episode and next episode
      let current: Episode | null = null;
      let next: Episode | null = null;

      const allEpisodes: Episode[] = [];
      Object.values(res.episodes).forEach((seasonEpisodes) => {
        allEpisodes.push(...seasonEpisodes);
      });

      const currentIndex = allEpisodes.findIndex(
        (ep) => ep.id === Number(streamId),
      );
      if (currentIndex !== -1) {
        current = allEpisodes[currentIndex];
        if (currentIndex < allEpisodes.length - 1) {
          next = allEpisodes[currentIndex + 1];
        }
      }

      setCurrentEpisode(current);
      setNextEpisode(next);
    } catch (error) {
      console.error("Failed to load series info for player:", error);
    } finally {
      setIsLoading(false);
    }
  }, [seriesId, streamId]);

  useEffect(() => {
    void loadSerieData();
  }, [loadSerieData]);

  // Resume playback position
  const onCanPlay = () => {
    const savedPositions = window.api.store.get("playbackPositions") || {};
    const savedPosition = savedPositions[streamId!];
    if (savedPosition && playerRef.current) {
      playerRef.current.currentTime = savedPosition;
    }
  };

  // Save playback position
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && !playerRef.current.paused && streamId) {
        const currentTime = playerRef.current.currentTime;
        const duration = playerRef.current.duration;

        // Only save if we are not at the very end (95%)
        if (duration > 0 && currentTime / duration < 0.95) {
          const savedPositions =
            window.electron.store.get("playbackPositions") || {};
          savedPositions[streamId] = currentTime;
          window.electron.store.set("playbackPositions", savedPositions);
        } else if (duration > 0 && currentTime / duration >= 0.95) {
          // If near end, clear the position so it starts from beginning next time
          const savedPositions =
            window.electron.store.get("playbackPositions") || {};
          delete savedPositions[streamId];
          window.electron.store.set("playbackPositions", savedPositions);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [streamId]);

  const handleNextEpisode = () => {
    if (nextEpisode) {
      void navigate(
        `/play/stream/${nextEpisode.id}/?seriesId=${seriesId}&season=${nextEpisode.season}`,
      );
    }
  };

  const onEnd = () => {
    if (nextEpisode) {
      handleNextEpisode();
    } else {
      void navigate(-1);
    }
  };

  const onTimeUpdate = () => {
    if (playerRef.current) {
      const { currentTime, duration } = playerRef.current;
      // Show next episode prompt in the last 30 seconds
      if (duration > 0 && duration - currentTime < 30 && nextEpisode) {
        setShowNextEpisodePrompt(true);
      } else {
        setShowNextEpisodePrompt(false);
      }
    }
  };

  if (isLoading && seriesId) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden group">
      <MediaPlayer
        ref={playerRef}
        title={currentEpisode?.title || "Video Player"}
        src={{ src: buildStreamUrl(streamId!), type: "video/mp4" }}
        onCanPlay={onCanPlay}
        onEnded={onEnd}
        onTimeUpdate={onTimeUpdate}
        className="w-full h-full"
        autoPlay
      >
        <MediaProvider>
          {currentEpisode?.info?.movie_image && (
            <Poster
              src={currentEpisode.info.movie_image}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
        </MediaProvider>

        <DefaultVideoLayout icons={defaultLayoutIcons} />

        {/* Top Bar Overlay */}
        <div className="absolute top-0 left-0 right-0 p-8 bg-linear-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => void navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">
                {currentEpisode?.title || "Streaming"}
              </h2>
              {serieInfo && (
                <p className="text-sm text-gray-300">
                  {serieInfo.info.name} • Season {currentEpisode?.season} •
                  Episode {currentEpisode?.episode_num}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Next Episode Prompt */}
        {showNextEpisodePrompt && nextEpisode && (
          <div className="absolute bottom-24 right-8 bg-gray-900/90 border border-purple-500/50 p-4 rounded-xl shadow-2xl z-20 animate-in slide-in-from-right-full">
            <div className="flex items-center gap-4">
              <div className="w-24 aspect-video rounded-lg overflow-hidden bg-gray-800">
                {nextEpisode.info?.movie_image ? (
                  <img
                    src={nextEpisode.info.movie_image}
                    alt={nextEpisode.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-purple-500" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                  Next Episode
                </p>
                <h3 className="font-bold text-white text-sm line-clamp-1">
                  {nextEpisode.title}
                </h3>
                <button
                  onClick={handleNextEpisode}
                  className="mt-2 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1.5 rounded-lg font-bold transition-colors"
                >
                  <FastForward size={14} />
                  Play Now
                </button>
              </div>
            </div>
          </div>
        )}
      </MediaPlayer>
    </div>
  );
};
