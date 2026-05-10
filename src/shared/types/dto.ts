export interface CategoryDTO {
  id: string;
  name: string;
  parentId: number;
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
}
