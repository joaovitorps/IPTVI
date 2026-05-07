import { UserDataResponse } from "@/main/api/requests";

export interface CredentialRepository {
  validate(): Promise<UserDataResponse>;
}
