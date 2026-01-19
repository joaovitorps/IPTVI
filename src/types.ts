export interface SerieCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

export interface Serie {
  backdrop_path: Array<unknown>;
  cast: string;
  category_id: number;
  cover: string;
  director: string;
  episode_run_time: number;
  genre: string;
  last_modified: string;
  name: string;
  num?: number;
  plot: string;
  rating: number;
  rating_5based: number;
  releaseDate: Date;
  series_id?: number;
  youtube_trailer: string;
}

export interface SerieInfo {
  seasons: Array<Season>;
  info: Serie;
  episodes: SeasonEpisode;
}

export interface Season {
  air_date: Date;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  season_number: number;
  vote_average: number;
  cover: string;
  cover_big: string;
}

export interface SeasonEpisode {
  [seasonNumber: number]: Array<Episode>;
}

export interface Episode {
  added: string;
  container_extension: string;
  custom_sid: string;
  direct_source: string;
  episode_num: number;
  id: string;
  info: EpisodeInfo;
  season: number;
  title: string;
}

export interface EpisodeInfo {
  bitrate: number;
  duration: string;
  duration_secs: number;
  movie_image: string;
  plot: string;
  rating: string;
  releasedate: string;
}

declare global {
  interface Window {
    api: {
      getSeriesCategories: () => Promise<Array<SerieCategory>>;
      getSeriesCategory: (categoryId: number) => Promise<Array<Serie>>;
      getSerieInfo: (serieId: number) => Promise<SerieInfo>;
    };
  }
}
