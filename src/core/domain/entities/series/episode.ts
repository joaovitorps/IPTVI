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
    duration?: string;
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
