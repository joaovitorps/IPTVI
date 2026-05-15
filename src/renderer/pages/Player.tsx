import { EpisodeDTO, SerieDTO } from "@/shared/types/dto";
import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster,
  isHLSProvider,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/layouts/audio.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/default/theme.css";
import { ArrowLeft, FastForward, Languages, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";

export const Player = () => {
  const { streamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const playerRef = useRef<MediaPlayerInstance>(null);

  const queryParams = new URLSearchParams(location.search);
  const seriesId = queryParams.get("seriesId");
  const seasonNumber = queryParams.get("season");

  const [serieInfo, setSerieInfo] = useState<SerieDTO | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeDTO | null>(null);
  const [nextEpisode, setNextEpisode] = useState<EpisodeDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNextEpisodePrompt, setShowNextEpisodePrompt] = useState(false);
  const [showPoster, setShowPoster] = useState(true);

  const [hlsPlaylistUrl, setHlsPlaylistUrl] = useState<string | null>(null);
  const [isTranscoding, setIsTranscoding] = useState(true);
  const [transcodingError, setTranscodingError] = useState<string | null>(null);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [activeAudioTrack, setActiveAudioTrack] = useState(0);
  const [activeSubtitleTrack, setActiveSubtitleTrack] = useState(-1);

  type PlayerAudioOption = {
    id: string;
    label: string;
    lang?: string;
    index: number;
  };
  type PlayerSubtitleOption = {
    id: string;
    label: string;
    lang?: string;
    index: number;
  };

  const [playerAudioOptions, setPlayerAudioOptions] = useState<
    PlayerAudioOption[]
  >([]);
  const [playerSubtitleOptions, setPlayerSubtitleOptions] = useState<
    PlayerSubtitleOption[]
  >([]);

  const syncTracksFromPlayer = useCallback(() => {
    const player = playerRef.current as unknown as {
      audioTracks?: {
        id: string;
        label: string;
        language: string;
        kind: string;
        selected: boolean;
      }[];
      textTracks?: {
        id: string;
        label: string;
        language: string;
        kind: string;
        mode: string;
      }[];
    };
    if (!player) return;

    const audioList = player.audioTracks ?? [];
    setPlayerAudioOptions(
      audioList.map((t, idx) => ({
        id: t.id ?? String(idx),
        label: t.label || t.language || `Track ${idx + 1}`,
        lang: t.language,
        index: idx,
      })),
    );

    const textList = player.textTracks ?? [];
    const subs = textList.filter(
      (t) => t.kind === "subtitles" || t.kind === "captions",
    );
    setPlayerSubtitleOptions(
      subs.map((t, idx) => ({
        id: t.id ?? String(idx),
        label: t.label || t.language || `Subtitle ${idx + 1}`,
        lang: t.language,
        index: idx,
      })),
    );

    const audioSel = audioList.findIndex((t) => t.selected);
    setActiveAudioTrack(audioSel >= 0 ? audioSel : 0);

    const subSel = subs.findIndex((t) => t.mode === "showing");
    setActiveSubtitleTrack(subSel);
  }, []);

  const loadSerieData = useCallback(async () => {
    if (!seriesId || !streamId) return;

    try {
      const res = await window.api.serie.getById(Number(seriesId));
      setSerieInfo(res);

      const season = res.seasons.find(
        (season) => season.seasonNumber === Number(seasonNumber),
      );

      if (!season) {
        throw new Error("Season not found.");
      }

      const allEpisodes: EpisodeDTO[] = season.episodes;
      let current: EpisodeDTO | null = null;
      let next: EpisodeDTO | null = null;

      const currentIndex = allEpisodes.findIndex((ep) => ep.id === streamId);

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
  }, [seriesId, seasonNumber, streamId]);

  useEffect(() => {
    void loadSerieData();
  }, [loadSerieData]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      const result = await window.api.streamServer.start({
        streamId: streamId!,
      });

      if (cancelled) return;

      if (result.ok) {
        const { baseUrl, hlsPlaylist: playlist } = result.status;

        if (playlist) {
          console.log(`${baseUrl}${playlist}`);
          setHlsPlaylistUrl(`${baseUrl}${playlist}`);
        }

        setIsTranscoding(false);
      } else {
        console.error(result.error?.message);
        setTranscodingError("Failed to start stream");
        setIsTranscoding(false);
      }
    }

    void start();

    return () => {
      cancelled = true;
      void window.api.streamServer.stop({ reason: "player-unmount" });
    };
  }, [streamId]);

  const onCanPlay = () => {
    syncTracksFromPlayer();

    window.store
      .get("playbackPositions")
      .then((raw) => {
        const savedPositions: Record<string, number> = raw
          ? (JSON.parse(raw) as Record<string, number>)
          : {};
        const savedPosition = savedPositions[streamId!];
        if (savedPosition && playerRef.current) {
          playerRef.current.currentTime = savedPosition;
        }
      })
      .catch(() => {});
  };

  const onHlsLibLoadStart = useCallback(() => {
    const provider = playerRef.current?.provider;
    if (isHLSProvider(provider)) {
      provider.config = {
        lowLatencyMode: false,
        startPosition: 0.05,
      };
    }
  }, []);

  // const onHlsError = useCallback(
  //   (event: HLSErrorEvent) => {
  //     const error = event.detail;
  //     if (
  //       error.type === Hls.ErrorTypes.MEDIA_ERROR &&
  //       !error.fatal &&
  //       playerRef.current &&
  //       playerRef.current.currentTime < 0.05
  //     ) {
  //       playerRef.current.currentTime = 0.05;
  //     }
  //   },
  //   [],
  // );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!playerRef.current || playerRef.current.paused || !streamId) return;

      const currentTime = playerRef.current.currentTime;
      const duration = playerRef.current.duration;

      if (duration > 0 && currentTime / duration < 0.95) {
        window.store
          .get("playbackPositions")
          .then((raw) => {
            const savedPositions: Record<string, number> = raw
              ? (JSON.parse(raw) as Record<string, number>)
              : {};
            savedPositions[streamId] = currentTime;
            return window.store.set(
              "playbackPositions",
              JSON.stringify(savedPositions),
            );
          })
          .catch(() => {});
      } else if (duration > 0 && currentTime / duration >= 0.95) {
        window.store
          .get("playbackPositions")
          .then((raw) => {
            const savedPositions: Record<string, number> = raw
              ? (JSON.parse(raw) as Record<string, number>)
              : {};
            delete savedPositions[streamId];
            return window.store.set(
              "playbackPositions",
              JSON.stringify(savedPositions),
            );
          })
          .catch(() => {});
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

      if (duration > 0 && showPoster) {
        setShowPoster(false);
      }

      if (duration > 0 && duration - currentTime < 30 && nextEpisode) {
        setShowNextEpisodePrompt(true);
      } else {
        setShowNextEpisodePrompt(false);
      }
    }
  };

  const handleAudioTrackChange = (option: PlayerAudioOption) => {
    setActiveAudioTrack(option.index);

    try {
      const player = playerRef.current as unknown as {
        audioTracks?: { selected: boolean }[];
      };

      const list = player?.audioTracks;
      if (list?.[option.index]) {
        list[option.index].selected = true;
      }
    } catch {
      // player API may not be available yet
    }
  };

  const handleSubtitleTrackChange = (
    option: PlayerSubtitleOption | null,
  ) => {
    setActiveSubtitleTrack(option ? option.index : -1);

    try {
      const player = playerRef.current as unknown as {
        textTracks?: { kind?: string; mode?: string }[];
      };

      const allTextTracks = player?.textTracks ?? [];

      if (!option) {
        for (const t of allTextTracks) {
          if (t.kind === "subtitles" || t.kind === "captions") {
            t.mode = "disabled";
          }
        }
        return;
      }

      const captionTracks = allTextTracks.filter(
        (t) => t.kind === "subtitles" || t.kind === "captions",
      );
      const target = captionTracks[option.index];
      if (target) {
        target.mode = "showing";
      }
    } catch {
      // player API may not be available yet
    }
  };

  if (isLoading || isTranscoding) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="text-gray-400 text-sm">
          {isTranscoding ? "Transcoding stream..." : "Loading..."}
        </p>
        {isTranscoding && (
          <p className="text-gray-600 text-xs">
            Please wait while the stream is prepared (this may take 5-15 seconds)
          </p>
        )}
      </div>
    );
  }

  if (transcodingError) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-red-400 text-lg font-bold">Stream Error</p>
        <p className="text-gray-400 text-sm">{transcodingError}</p>
        <button
          type="button"
          onClick={() => void navigate(-1)}
          className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden group">
      <MediaPlayer
        ref={playerRef}
        title={currentEpisode?.title || "Video Player"}
        src={hlsPlaylistUrl || undefined}
        onCanPlay={onCanPlay}
        onLoadedMetadata={syncTracksFromPlayer}
        onEnded={onEnd}
        onTimeUpdate={onTimeUpdate}
        onHlsLibLoadStart={onHlsLibLoadStart}
        // onHlsError={onHlsError}
        className="w-full h-full"
        autoPlay
      >
        <MediaProvider>
          {currentEpisode?.info.movieImage && showPoster && (
            <Poster
              src={currentEpisode.info.movieImage}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
        </MediaProvider>

        <DefaultVideoLayout icons={defaultLayoutIcons} />

        <div className="absolute top-0 left-0 right-0 p-8 bg-linear-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                void window.api.streamServer.stop({ reason: "user-back" });
                void navigate(-1);
              }}
              type="button"
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
                  {serieInfo.name} • Season {currentEpisode?.season} • Episode{" "}
                  {currentEpisode?.episodeNum}
                </p>
              )}
            </div>
          </div>
        </div>

        {(playerAudioOptions.length > 1 ||
          playerSubtitleOptions.length > 0) && (
          <div className="absolute top-20 right-8 z-20">
            <button
              type="button"
              onClick={() => setShowTrackSelector(!showTrackSelector)}
              className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors text-white"
              title="Audio & Subtitles"
            >
              <Languages size={20} />
            </button>

            {showTrackSelector && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl p-3 backdrop-blur-sm">
                {playerAudioOptions.length > 1 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">
                      Audio
                    </p>
                    {playerAudioOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleAudioTrackChange(option)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          activeAudioTrack === option.index
                            ? "bg-purple-600 text-white"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                        {option.lang && (
                          <span className="text-xs ml-2 opacity-60">
                            {option.lang}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {playerSubtitleOptions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">
                      Subtitles
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSubtitleTrackChange(null)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        activeSubtitleTrack === -1
                          ? "bg-purple-600 text-white"
                          : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      Off
                    </button>
                    {playerSubtitleOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSubtitleTrackChange(option)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          activeSubtitleTrack === option.index
                            ? "bg-purple-600 text-white"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {option.label}
                        {option.lang && (
                          <span className="text-xs ml-2 opacity-60">
                            {option.lang}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showNextEpisodePrompt && nextEpisode && (
          <div className="absolute bottom-24 right-8 bg-gray-900/90 border border-purple-500/50 p-4 rounded-xl shadow-2xl z-20 animate-in slide-in-from-right-full">
            <div className="flex items-center gap-4">
              <div className="w-24 aspect-video rounded-lg overflow-hidden bg-gray-800">
                {nextEpisode.info?.movieImage ? (
                  <img
                    src={nextEpisode.info.movieImage}
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
                  type="button"
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
