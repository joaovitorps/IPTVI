export interface ValidateParams {
  server: string;
  username: string;
  password: string;
}

export interface CreatePlaylistParams {
  name: string;
  server: string;
  username: string;
  password: string;
}

//

interface Success {
  isValid: true;
}

interface Failure {
  isValid: false;
  error: string;
}

export type ValidateReturn = Success | Failure;
