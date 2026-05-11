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
