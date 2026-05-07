import { UserDataResponse } from "@/main/api/requests";
import { axiosInstance } from "@/shared/axios";
import { AccountInfo } from "@/shared/schemas";
import { default as axios } from "axios";

import { Credentials } from "../../entities/object-values/credentials";
import { CredentialRepository } from "../credential-repository";

export class APICredentialRepository implements CredentialRepository {
  constructor(private readonly credentials: Credentials) {}

  async validate(): Promise<UserDataResponse> {
    const { server, username, password } = this.credentials;

    try {
      const response = await axiosInstance(server, {
        username,
        password,
      }).get("/player_api.php");

      const parsed = AccountInfo.safeParse(response.data);

      if (!parsed.success) {
        console.error(parsed.error);
        return {
          ok: false,
          status: 503,
          data: { error: "Service Unavailable" },
        };
      }

      return { ok: true, status: response.status, data: parsed.data };
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          if (err.response.status === 401) {
            return {
              ok: false,
              status: 401,
              data: { error: "Invalid Credentials." },
            };
          }
        } else if (err.request) {
          if (
            err.code === "ENOTFOUND" ||
            err.code === "DEPTH_ZERO_SELF_SIGNED_CERT"
          ) {
            return {
              ok: false,
              status: 400,
              data: { error: "Invalid URL." },
            };
          }
        }
      }

      return { ok: false, status: 500, data: { error: "Unknown error." } };
    }
  }
}
