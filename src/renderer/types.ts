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
  num: number;
  plot: string;
  rating: number;
  rating_5based: number;
  releaseDate: Date;
  series_id: number;
  youtube_trailer: string;
}

declare global {
  interface Window {
    api: {
      getSeriesCategories: () => Promise<Array<SerieCategory>>;
      getSeriesCategory: (categoryId: number) => Promise<Array<Serie>>;
    };
  }
}
