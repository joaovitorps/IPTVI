import { Optional } from "@/@types/optional";
import { Credentials } from "@/shared/types";

import { Entity } from "./entity";

interface PlaylistProps {
  name: string;
  credentials: Credentials;
  isActive?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export class Playlist extends Entity<PlaylistProps> {
  static create(
    props: Optional<PlaylistProps, "isActive" | "createdAt">,
    id?: string,
  ) {
    return new Playlist({ ...props, isActive: 0, createdAt: new Date() }, id);
  }

  get name() {
    return this.props.name;
  }

  get credentials() {
    return this.props.credentials;
  }

  get isActive() {
    return this.props.isActive;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  /**
   * Returns a plain object for serialization.
   */
  public toJSON() {
    return { ...this.props };
  }
}
