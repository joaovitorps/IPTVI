export class Credentials {
  constructor(
    public readonly server: string,
    public readonly username: string,
    public readonly password: string,
  ) {
    this.server = server.trim();
    this.username = username.trim();
    this.password = password.trim();
  }

  static create(server: string, username: string, password: string) {
    return new Credentials(server, username, password);
  }
}
