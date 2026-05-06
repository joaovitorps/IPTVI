import { Credentials } from "@/shared/types";

export interface PlaylistProps {
  id: string;
  name: string;
  credentials: Credentials;
  is_active: number;
  created_at: string;
}

export class Playlist {
  private props: PlaylistProps;

  constructor(props: PlaylistProps) {
    this.props = props;
  }

  static create(props: PlaylistProps) {
    return new Playlist(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get credentials(): Credentials {
    return this.props.credentials;
  }

  get is_active(): number {
    return this.props.is_active;
  }

  get created_at(): string {
    return this.props.created_at;
  }

  /**
   * Returns a plain object for serialization.
   */
  public toJSON(): PlaylistProps {
    return { ...this.props };
  }
}
