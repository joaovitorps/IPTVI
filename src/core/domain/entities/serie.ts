import { Entity } from "./entity";

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
  categoryId: string;
}

export class Serie extends Entity<SeriesProps> {
  static create(props: SeriesProps, id?: string) {
    return new Serie(props, id).toJSON();
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

  get categoryId(): string {
    return this.props.categoryId;
  }

  /**
   * Returns a plain object for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
