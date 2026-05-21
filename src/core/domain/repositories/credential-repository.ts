import { Credentials, UserDataResponse } from "@/shared/types";

export interface CredentialRepository {
  validate(credentials: Credentials): Promise<UserDataResponse>;
}
