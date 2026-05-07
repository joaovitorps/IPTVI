import { Entity } from "./entity";
import { Episode } from "./episode";
import { Season } from "./season";
import { Serie } from "./serie";

export interface SerieInfoProps {
  seasons: ReturnType<typeof Season.create>[];
  info: ReturnType<typeof Serie.create>;
  episodes: Record<number, ReturnType<typeof Episode.create>[]>;
}

export class SerieInfo extends Entity<SerieInfoProps> {
  static create(props: SerieInfoProps, id?: string) {
    return new SerieInfo(props, id).toJSON();
  }

  get seasons() {
    return this.props.seasons;
  }

  get info() {
    return this.props.info;
  }

  get episodes() {
    return this.props.episodes;
  }

  public toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
