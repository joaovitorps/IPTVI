import { Optional } from "@/@types/optional";

import { Entity } from "./entity";
import { Credentials } from "./object-values/credentials";

interface PlaylistProps {
  name: string;
  credentials: Credentials;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export class Playlist extends Entity<PlaylistProps> {
  static create(
    props: Optional<PlaylistProps, "name" | "isActive" | "createdAt">,
    id?: string,
  ) {
    return new Playlist(
      {
        ...props,
        name: this.validatePlaylistName(props.name),
        isActive: props.isActive ?? false,
        createdAt: new Date(),
      },
      id,
    );
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

  set name(value: string) {
    console.log("object", value);
    this.props.name = Playlist.validatePlaylistName(value);
    console.log("object2", this.props.name);
    this.touch();
  }

  set credentials(credentials: Credentials) {
    this.props.credentials = credentials;
    this.touch();
  }

  set isActive(value: boolean) {
    this.props.isActive = value;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private static validatePlaylistName(name: string | undefined) {
    return name?.trim() === "" || !name ? "Unnamed Profile" : name;
  }

  toJSON() {
    return {
      id: this.id,
      ...this.props,
    };
  }
}
