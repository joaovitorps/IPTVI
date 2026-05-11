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
