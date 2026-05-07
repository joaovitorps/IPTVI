export class DuplicateUsernameError extends Error {
  constructor() {
    super("User already exists!");
  }
}
