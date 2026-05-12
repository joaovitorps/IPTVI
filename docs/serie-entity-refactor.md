# Serie Entity Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor Serie aggregate to use hierarchical entity model (Serie → Season[] → Episode[]) removing the flat SerieInfo wrapper.

**Architecture:** The server response has three top-level keys (`info`, `seasons`, `episodes: Record<number, Episode[]>`). The repository will map this into a single `Serie` aggregate root containing `Season[]`, where each `Season` contains its own `Episode[]`. The `SerieInfo` entity wrapper is removed entirely.

**Tech Stack:** TypeScript domain entities extending base `Entity<Props>` class, Zod schemas for API validation, and a use case / repository pattern for data access.

---

### Task 1: Fix Episode entity

**Files:**
- Modify: `src/core/domain/entities/series/episode.ts`

- [ ] **Step 1: Fix import path and `create()` return type**

The import `"./entity"` is wrong — entity.ts is in the parent directory. And `create()` should return an `Episode` instance, not a plain object.

```typescript
import { Entity } from "../entity";

export interface EpisodeProps {
  episodeNum: number;
  title: string;
  containerExtension: string;
  info: {
    tmdbId: number | null;
    releasedate: string;
    plot: string;
    durationSecs: number;
    duration: string;
    movieImage?: string;
    video: {
      width: number;
      height: number;
      codecName: string;
    };
    audio: {
      codecName: string;
      language: string;
    };
  };
  customSid: string;
  added: string;
  season: number;
  directSource: string;
}

export class Episode extends Entity<EpisodeProps> {
  static create(props: EpisodeProps, id?: string): Episode {
    return new Episode(props, id);
  }

  get episodeNum(): number {
    return this.props.episodeNum;
  }

  get title(): string {
    return this.props.title;
  }

  get containerExtension(): string {
    return this.props.containerExtension;
  }

  get info() {
    return this.props.info;
  }

  get customSid(): string {
    return this.props.customSid;
  }

  get added(): string {
    return this.props.added;
  }

  get season(): number {
    return this.props.season;
  }

  get directSource(): string {
    return this.props.directSource;
  }

  public toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
```

- [ ] **Step 2: Verify file saved correctly**

---

### Task 2: Fix Season entity

**Files:**
- Modify: `src/core/domain/entities/series/season.ts`

- [ ] **Step 1: Add `episodes: Episode[]` to props and fix `create()`**

Season should now contain its own episodes array, and `create()` should return a `Season` instance.

```typescript
import { Entity } from "../entity";
import { Episode } from "./episode";

export interface SeasonProps {
  airDate: string;
  episodeCount: number;
  name: string;
  overview: string;
  seasonNumber: number;
  voteAverage?: number;
  cover: string;
  coverBig: string;
  episodes: Episode[];
}

export class Season extends Entity<SeasonProps> {
  static create(props: SeasonProps, id?: string): Season {
    return new Season(props, id);
  }

  get airDate(): string {
    return this.props.airDate;
  }

  get episodeCount(): number {
    return this.props.episodeCount;
  }

  get name(): string {
    return this.props.name;
  }

  get overview(): string {
    return this.props.overview;
  }

  get seasonNumber(): number {
    return this.props.seasonNumber;
  }

  get voteAverage(): number | undefined {
    return this.props.voteAverage;
  }

  get cover(): string {
    return this.props.cover;
  }

  get coverBig(): string {
    return this.props.coverBig;
  }

  get episodes(): Episode[] {
    return this.props.episodes;
  }

  public toJSON() {
    return {
      id: this.id,
      ...this.props,
      episodes: this.props.episodes.map((ep) => ep.toJSON()),
    };
  }
}
```

- [ ] **Step 2: Verify file saved correctly**

---

### Task 3: Fix Serie entity

**Files:**
- Modify: `src/core/domain/entities/series/serie.ts`

- [ ] **Step 1: Replace flat props with `seasons: Season[]`**

Remove `episodes?: Episode` and `seasons?: Season`, replace with `seasons: Season[]`.

```typescript
import { SerieDTO } from "@/shared/types/dto";
import { Entity } from "../entity";
import { Season } from "./season";

export interface SeriesProps {
  num?: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  lastModified: string;
  rating: number;
  rating5based: number;
  backdropPath: string[] | null;
  youtubeTrailer: string;
  episodeRunTime: number;
  categoryId: number;
  seasons: Season[];
}

export class Serie extends Entity<SeriesProps> {
  static create(props: SeriesProps, id?: string): Serie {
    return new Serie(props, id);
  }

  get num(): number | undefined {
    return this.props.num;
  }

  get name(): string {
    return this.props.name;
  }

  get cover(): string {
    return this.props.cover;
  }

  get plot(): string {
    return this.props.plot;
  }

  get cast(): string {
    return this.props.cast;
  }

  get director(): string {
    return this.props.director;
  }

  get genre(): string {
    return this.props.genre;
  }

  get releaseDate(): string {
    return this.props.releaseDate;
  }

  get lastModified(): string {
    return this.props.lastModified;
  }

  get rating(): number {
    return this.props.rating;
  }

  get rating5based(): number {
    return this.props.rating5based;
  }

  get backdropPath(): string[] | null {
    return this.props.backdropPath;
  }

  get youtubeTrailer(): string {
    return this.props.youtubeTrailer;
  }

  get episodeRunTime(): number {
    return this.props.episodeRunTime;
  }

  get categoryId(): number {
    return this.props.categoryId;
  }

  get seasons(): Season[] {
    return this.props.seasons;
  }

  public toJSON(): SerieDTO {
    return {
      id: this.id,
      ...this.props,
      seasons: this.props.seasons.map((season) => season.toJSON()),
    };
  }
}
```

Note: `episode` is dropped from Serie's role. Episodes live under their Season.

- [ ] **Step 2: Verify file saved correctly**

---

### Task 4: Delete SerieInfo entity

**Files:**
- Delete: `src/core/domain/entities/series/serie-info.ts`

- [ ] **Step 1: Delete the file**

Use `bash rm` to remove `src/core/domain/entities/series/serie-info.ts`.

- [ ] **Step 2: Remove `SerieInfo` from any index/barrel exports if they exist**

Run `grep -r "serie-info" src/ --include="*.ts"` to find leftover references.

---

### Task 5: Update Zod schemas

**Files:**
- Modify: `src/shared/schemas.ts`

- [ ] **Step 1: Uncomment seasons and episodes in SerieInfoSchema**

```typescript
export const SerieInfoSchema = z.object({
  seasons: z.array(Season),
  info: SerieSchema,
  episodes: z.record(z.coerce.number(), z.array(Episode)),
});
```

Also update the exported `SerieInfo` type can stay, or we can add a `SerieInfo` type for the raw API shape. Keep the commented parts uncommented so the schema validates the full response.

---

### Task 6: Update DTO interfaces

**Files:**
- Modify: `src/shared/types/dto.ts`

- [ ] **Step 1: Add SeasonDTO and EpisodeDTO, update SerieDTO**

```typescript
export interface CategoryDTO {
  id: string;
  name: string;
  parentId: number;
}

export interface EpisodeDTO {
  id: string;
  episodeNum: number;
  title: string;
  containerExtension: string;
  info: {
    tmdbId: number | null;
    releasedate: string;
    plot: string;
    durationSecs: number;
    duration: string;
    movieImage?: string;
    video: {
      width: number;
      height: number;
      codecName: string;
    };
    audio: {
      codecName: string;
      language: string;
    };
  };
  customSid: string;
  added: string;
  season: number;
  directSource: string;
}

export interface SeasonDTO {
  id: string;
  airDate: string;
  episodeCount: number;
  name: string;
  overview: string;
  seasonNumber: number;
  voteAverage?: number;
  cover: string;
  coverBig: string;
  episodes: EpisodeDTO[];
}

export interface SerieDTO {
  id: string;
  num?: number;
  name: string;
  cover: string;
  plot: string;
  cast: string;
  director: string;
  genre: string;
  releaseDate: string;
  lastModified: string;
  rating: number;
  rating5based: number;
  backdropPath: string[] | null;
  youtubeTrailer: string;
  episodeRunTime: number;
  categoryId: string;
  seasons: SeasonDTO[];
}
```

---

### Task 7: Fix APISeriesRepository

**Files:**
- Modify: `src/core/domain/repositories/api/api-series-repository.ts`

- [ ] **Step 1: Remove SerieInfo import, re-enable mapping, return Serie**

```typescript
import { axiosInstance } from "@/shared/axios";
import { SerieInfoSchema, SeriesSchema } from "@/shared/schemas";
import { Serie } from "../../entities/series/serie";
import { Season } from "../../entities/series/season";
import { Episode } from "../../entities/series/episode";
import { SeriesRepository } from "../series-repository";

export class APISeriesRepository implements SeriesRepository {
  constructor(
    private readonly server: string,
    private readonly username: string,
    private readonly password: string,
  ) {}

  async fetchByCategoryId(categoryId: number): Promise<Serie[]> {
    try {
      const response = await axiosInstance(this.server, {
        username: this.username,
        password: this.password,
        action: "get_series",
        category_id: categoryId,
      }).get("/player_api.php");

      const parsed = SeriesSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return [];
      }

      const series: Serie[] = parsed.data.map((item) =>
        Serie.create(
          {
            num: item.num,
            name: item.name,
            cover: item.cover,
            plot: item.plot,
            cast: item.cast,
            director: item.director,
            genre: item.genre,
            releaseDate: item.releaseDate,
            lastModified: item.last_modified,
            rating: item.rating,
            rating5based: item.rating_5based,
            backdropPath: item.backdrop_path,
            youtubeTrailer: item.youtube_trailer,
            episodeRunTime: item.episode_run_time,
            categoryId: item.category_id,
            seasons: [],
          },
          item?.series_id,
        ),
      );

      return series;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async getById(serieId: string): Promise<Serie | null> {
    try {
      const response = await axiosInstance(this.server, {
        username: this.username,
        password: this.password,
        action: "get_series_info",
        series_id: serieId,
      }).get("/player_api.php");

      const parsed = SerieInfoSchema.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return null;
      }

      const { seasons, info, episodes } = parsed.data;

      // Build episodes lookup: Record<seasonNumber, Episode[]>
      const episodesBySeason: Record<number, Episode[]> = {};
      Object.entries(episodes).forEach(([seasonNum, seasonEpisodes]) => {
        episodesBySeason[Number(seasonNum)] = seasonEpisodes.map(
          (episode) =>
            Episode.create(
              {
                episodeNum: episode.episode_num,
                title: episode.title,
                containerExtension: episode.container_extension,
                info: {
                  tmdbId: episode.info.tmdb_id,
                  releasedate: episode.info.releasedate,
                  plot: episode.info.plot,
                  durationSecs: episode.info.duration_secs,
                  duration: episode.info.duration,
                  movieImage: episode.info.movie_image,
                  video: {
                    width: episode.info.video.width,
                    height: episode.info.video.height,
                    codecName: episode.info.video.codec_name,
                  },
                  audio: {
                    codecName: episode.info.audio.codec_name,
                    language: episode.info.audio.tags.language,
                  },
                },
                customSid: episode.custom_sid,
                added: episode.added,
                season: episode.season,
                directSource: episode.direct_source,
              },
              episode.id.toString(),
            ),
        );
      });

      // Map seasons with their episodes attached
      const mappedSeasons = seasons.map((season) =>
        Season.create(
          {
            airDate: season.air_date,
            episodeCount: season.episode_count,
            name: season.name,
            overview: season.overview,
            seasonNumber: season.season_number,
            voteAverage: season.vote_average,
            cover: season.cover,
            coverBig: season.cover_big,
            episodes: episodesBySeason[season.season_number] || [],
          },
          season.id.toString(),
        ),
      );

      return Serie.create(
        {
          name: info.name,
          cover: info.cover,
          plot: info.plot,
          cast: info.cast,
          director: info.director,
          genre: info.genre,
          releaseDate: info.releaseDate,
          lastModified: info.last_modified,
          rating: info.rating,
          rating5based: info.rating_5based,
          backdropPath: info.backdrop_path,
          youtubeTrailer: info.youtube_trailer,
          episodeRunTime: info.episode_run_time,
          categoryId: info.category_id,
          seasons: mappedSeasons,
        },
        info.series_id,
      );
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
```

---

### Task 8: Fix GetSerieByIdUseCase

**Files:**
- Modify: `src/core/domain/use-cases/series/get-serie-by-id.ts`

- [ ] **Step 1: Change `serieId` type from `number` to `string` to match repository interface**

```typescript
import { Serie } from "../../entities/series/serie";
import { SeriesRepository } from "../../repositories/series-repository";

interface GetSerieByIdUseCaseParams {
  serieId: string;
}

interface GetSerieByIdUseCaseReturn {
  serie: Serie;
}

export class GetSerieByIdUseCase {
  constructor(private readonly seriesRepository: SeriesRepository) {}

  async execute({
    serieId,
  }: GetSerieByIdUseCaseParams): Promise<GetSerieByIdUseCaseReturn> {
    const serie = await this.seriesRepository.getById(serieId);

    if (!serie) {
      throw new Error("Serie not found.");
    }

    return { serie };
  }
}
```

Also fix the IPC handler and preload to convert to string:

In `src/main/handlers/serie/get-serie-by-id.ts`:
```typescript
import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { StorePlaylistRepository } from "@/core/domain/repositories/store/store-playlist-repository";
import { GetSerieByIdUseCase } from "@/core/domain/use-cases/series/get-serie-by-id";

export const getSeriById = async (serieId: number) => {
  const storeRepo = new StorePlaylistRepository();
  const playlists = await storeRepo.fetchActives();

  if (playlists.length === 0) throw new Error("No active playlist");

  const { server, username, password } = playlists[0];
  const getSerieByIdUseCase = new GetSerieByIdUseCase(
    new APISeriesRepository(server, username, password),
  );

  const { serie } = await getSerieByIdUseCase.execute({
    serieId: String(serieId),
  });

  return serie.toJSON();
};
```

In `src/preload/preload.ts`, change the serie type:
```typescript
serie: {
  getById(serieId: number): Promise<SerieDTO> {
    return ipcRenderer.invoke(IPC.SERIE.GET_BY_ID, serieId);
  },
  fetchByCategoryId(categoryId: number): Promise<SerieDTO[]> {
    return ipcRenderer.invoke(IPC.SERIE.FETCH_BY_CATEGORY_ID, categoryId);
  },
},
```

(The preload already passes a number, and we convert to string in the handler, so no preload change needed for that.)

---

### Task 9: Adapt renderer files

**Files:**
- Modify: `src/renderer/pages/series/SerieInfo.tsx`
- Modify: `src/renderer/pages/series/EpisodeInfo.tsx`

- [ ] **Step 1: Fix SerieInfoView**

The state is typed as `SerieDTO` which now has `seasons` nested with `episodes`. Adapt the component:

```typescript
import { SeasonDTO, SerieDTO } from "@/shared/types/dto";
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

      <Outlet
        context={[
          serieInfo.seasons,
          setSeasonNumber,
          currentEpisodes,
        ]}
      />
    </div>
  );
};
```

- [ ] **Step 2: Fix EpisodeInfo import path**

Change `import { Episode } from "@/core/domain/entities/episode"` to `import { EpisodeDTO } from "@/shared/types/dto"`:

```typescript
import { EpisodeDTO } from "@/shared/types/dto";
import { Clock, Play } from "lucide-react";
import { useNavigate } from "react-router";

export const EpisodeInfo = ({
  episodes,
  serieId,
  seasonNumber,
}: {
  episodes: EpisodeDTO[];
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
            {episode.info?.movieImage ? (
              <img
                src={episode.info.movieImage}
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
                Episode {episode.episodeNum}
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
```

---

### Task 10: Update e2e test

**Files:**
- Modify: `tests/e2e/get-serie-by-id.spec.ts`

- [ ] **Step 1: Adapt test to new entity structure**

The test should verify that the returned serie has `seasons` with nested `episodes`:

```typescript
import { APISeriesRepository } from "@/core/domain/repositories/api/api-series-repository";
import { GetSerieByIdUseCase } from "@/core/domain/use-cases/series/get-serie-by-id";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("Fetch categories e2e", () => {
  let mock: AxiosMockAdapter;

  beforeAll(() => {
    mock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  const successResponse = {
    seasons: [
      {
        air_date: "2021-01-09",
        episode_count: 10,
        id: 175591,
        name: "Especiais",
        overview: "",
        season_number: 0,
        vote_average: 0,
        cover:
          "http://image.tmdb.org/t/p/w600_and_h900_bestv2/eNWo1SAzHVnXNBYagafAm9yjMgJ.jpg",
        cover_big:
          "http://image.tmdb.org/t/p/w600_and_h900_bestv2/eNWo1SAzHVnXNBYagafAm9yjMgJ.jpg",
      },
    ],
    info: {
      name: "Jujutsu Kaisen",
      cover: "http://cdn23.in/logo/712-tv-cover.jpg",
      plot: "Jujutsu Kaisen Yuji é um gênio do atletismo, mas não tem interesse algum em ficar correndo em círculos. Ele é feliz como membro no Clube de Estudo de Fenômenos Psíquicos. Apesar de estar no clube apenas por diversão, tudo fica sério quando um espírito de verdade aparece na escola! A vida está prestes a se tornar muito interessante na Escola Sugisawa…",
      cast: "Junya Enoki, Yuma Uchida, Asami Seto, Yuichi Nakamura",
      director: "Sunghoo Park",
      genre: "Animação, Action & Adventure, Sci-Fi & Fantasy",
      releaseDate: "2020-10-03",
      last_modified: "1776459237",
      rating: "9",
      rating_5based: 4.5,
      backdrop_path: null,
      youtube_trailer: "ynr6gnyu9NE",
      episode_run_time: "24",
      category_id: "1135",
    },
    episodes: {
      "1": [
        {
          id: "67207",
          episode_num: 1,
          title: "Jujutsu Kaisen - S01E01 - Ryomen Sukuna",
          container_extension: "mkv",
          info: {
            tmdb_id: 1984409,
            releasedate: "2020-10-03",
            plot: "No leito de morte de seu avô, Yuuji Itadori promete que ajudará as pessoas sempre que puder. E a oportunidade vem na forma de acontecimentos sinistro ameaçando seus amigos da escola.",
            duration_secs: 1435,
            duration: "00:23:55",
            movie_image:
              "https://image.tmdb.org/t/p/w600_and_h900_bestv2/veG3J8KaBudM8omuGi58fYOMDTz.jpg",
            video: {
              index: 0,
              codec_name: "h264",
              codec_long_name: "H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10",
              profile: "High",
              codec_type: "video",
              codec_time_base: "1001/48000",
              codec_tag_string: "[0][0][0][0]",
              codec_tag: "0x0000",
              width: 1280,
              height: 720,
              coded_width: 1280,
              coded_height: 720,
              has_b_frames: 2,
              sample_aspect_ratio: "1:1",
              display_aspect_ratio: "16:9",
              pix_fmt: "yuv420p",
              level: 41,
              color_range: "tv",
              color_space: "bt709",
              color_transfer: "bt709",
              color_primaries: "bt709",
              chroma_location: "left",
              field_order: "progressive",
              refs: 1,
              is_avc: "true",
              nal_length_size: "4",
              r_frame_rate: "24000/1001",
              avg_frame_rate: "24000/1001",
              time_base: "1/1000",
              start_pts: 23,
              start_time: "0.023000",
              bits_per_raw_sample: "8",
              disposition: {
                default: 1,
                dub: 0,
                original: 0,
                comment: 0,
                lyrics: 0,
                karaoke: 0,
                forced: 1,
                hearing_impaired: 0,
                visual_impaired: 0,
                clean_effects: 0,
                attached_pic: 0,
                timed_thumbnails: 0,
              },
              tags: {
                BPS: "1700459",
                DURATION: "00:23:55.017000000",
                NUMBER_OF_FRAMES: "34406",
                NUMBER_OF_BYTES: "305023510",
                _STATISTICS_WRITING_APP:
                  "mkvmerge v57.0.0 ('Till The End') 64-bit",
                _STATISTICS_WRITING_DATE_UTC: "2021-06-15 00:15:39",
                _STATISTICS_TAGS:
                  "BPS DURATION NUMBER_OF_FRAMES NUMBER_OF_BYTES",
              },
            },
            audio: {
              index: 1,
              codec_name: "aac",
              codec_long_name: "AAC (Advanced Audio Coding)",
              profile: "LC",
              codec_type: "audio",
              codec_time_base: "1/44100",
              codec_tag_string: "[0][0][0][0]",
              codec_tag: "0x0000",
              sample_fmt: "fltp",
              sample_rate: "44100",
              channels: 2,
              channel_layout: "stereo",
              bits_per_sample: 0,
              r_frame_rate: "0/0",
              avg_frame_rate: "0/0",
              time_base: "1/1000",
              start_pts: 0,
              start_time: "0.000000",
              disposition: {
                default: 1,
                dub: 0,
                original: 0,
                comment: 0,
                lyrics: 0,
                karaoke: 0,
                forced: 1,
                hearing_impaired: 0,
                visual_impaired: 0,
                clean_effects: 0,
                attached_pic: 0,
                timed_thumbnails: 0,
              },
              tags: {
                language: "por",
                BPS: "128211",
                DURATION: "00:23:55.086000000",
                NUMBER_OF_FRAMES: "61804",
                NUMBER_OF_BYTES: "22999253",
                _STATISTICS_WRITING_APP:
                  "mkvmerge v57.0.0 ('Till The End') 64-bit",
                _STATISTICS_WRITING_DATE_UTC: "2021-06-15 00:15:39",
                _STATISTICS_TAGS:
                  "BPS DURATION NUMBER_OF_FRAMES NUMBER_OF_BYTES",
              },
            },
            bitrate: 1835,
            rating: 6.6,
            season: "1",
          },
          custom_sid: "",
          added: "1624249816",
          season: 1,
          direct_source: "",
        },
      ],
    },
  };

  let repository: APISeriesRepository;
  let sut: GetSerieByIdUseCase;

  it("should be able to fetch a serie by id with seasons and episodes", async () => {
    mock.onGet("/player_api.php").reply(200, successResponse);

    repository = new APISeriesRepository("server", "username", "pass");
    sut = new GetSerieByIdUseCase(repository);

    const { serie } = await sut.execute({ serieId: "1" });

    // Serie info
    expect(serie.name).toEqual(successResponse.info.name);
    expect(serie.cast).toEqual(successResponse.info.cast);

    // Seasons
    expect(serie.seasons).toHaveLength(1);
    expect(serie.seasons[0].name).toEqual("Especiais");
    expect(serie.seasons[0].seasonNumber).toEqual(0);

    // Episodes nested under season
    expect(serie.seasons[0].episodes).toHaveLength(1);
    expect(serie.seasons[0].episodes[0].title).toEqual(
      "Jujutsu Kaisen - S01E01 - Ryomen Sukuna",
    );
    expect(serie.seasons[0].episodes[0].episodeNum).toEqual(1);
  });
});
```

---

### Task 11: Run tests

- [ ] **Step 1: Run the e2e tests**

Run: `npx vitest run tests/e2e/get-serie-by-id.spec.ts`
Expected: All tests pass.

- [ ] **Step 2: Run full test suite if available**

Run: `npx vitest run`
Expected: All existing tests pass (or only pre-existing failures unrelated to this change).
