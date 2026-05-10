import { Optional } from "@/@types/optional";

import { Entity } from "./entity";

interface PlaylistProps {
  name: string;
  server: string;
  username: string;
  password: string;
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

  get server() {
    return this.props.server;
  }

  get username() {
    return this.props.username;
  }

  get password() {
    return this.props.password;
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
    this.props.name = Playlist.validatePlaylistName(value);
    this.touch();
  }

  set server(value: string) {
    this.props.server = value;
    this.touch();
  }

  set username(value: string) {
    this.props.username = value;
    this.touch();
  }

  set password(value: string) {
    this.props.password = value;
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
