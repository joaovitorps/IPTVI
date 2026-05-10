/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
import { CredentialRepository } from "@/core/domain/repositories/credential-repository";
import { UserDataResponse } from "@/main/api/requests";
import { Credentials } from "@/shared/types";

export class InMemoryAPIRepository implements CredentialRepository {
  public isValid: boolean = true;
  public validationError?: string;

  async validate(_credential: Credentials): Promise<UserDataResponse> {
    if (!this.isValid) {
      return {
        ok: false,
        status: 0,
        data: { error: this.validationError || "Invalid Credentials." },
      };
    }

    return {
      ok: true,
      status: 200,
      data: {},
    };
  }
}
