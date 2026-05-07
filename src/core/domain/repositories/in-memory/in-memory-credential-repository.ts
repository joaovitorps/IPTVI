import { UserDataResponse } from "@/main/api/requests";
import { CredentialRepository } from "../credential-repository";

export class InMemoryCredentialRepository implements CredentialRepository {
  public isValid = true;
  public validationError?: string;

  validate(): Promise<UserDataResponse> {
    if (!this.isValid) {
      return Promise.resolve({
        ok: false,
        status: 401,
        data: { error: this.validationError || "Invalid Credentials." },
      });
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      data: {
        user_info: {
          username: "test",
          password: "test",
          message: "",
          auth: 1,
          status: "Active",
          exp_date: 0,
          is_trial: false,
          active_cons: 0,
          created_at: "",
          max_connections: 1,
          allowed_output_formats: ["ts"],
        },
        server_info: {
          url: "",
          port: 80,
          https_port: 443,
          server_protocol: "http",
          rtmp_port: 0,
          timezone: "",
          timestamp_now: 0,
          time_now: "",
        },
      },
    });
  }
}
