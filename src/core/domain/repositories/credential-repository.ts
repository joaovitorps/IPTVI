import { UserDataResponse } from "@/main/api/requests";
import { Credentials } from "@/shared/types";

export interface CredentialRepository {
  validate(credentials: Credentials): Promise<UserDataResponse>;
}
