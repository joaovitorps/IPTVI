import { APICredentialRepository } from "@/core/domain/repositories/api/api-credential-repository";
import { ValidateCredentialsUseCase } from "@/core/domain/use-cases/validate-credentials";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { format } from "date-fns";

describe("Validate credentials e2e", () => {
  let mock: AxiosMockAdapter;

  beforeAll(() => {
    mock = new AxiosMockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  const cred = {
    server: "server.test",
    password: "username",
    username: "safePass",
  };

  const successResponse = {
    user_info: {
      username: cred.username,
      password: cred.password,
      message: "",
      auth: 1,
      status: "Active",
      exp_date: "8435484865",
      is_trial: "0",
      active_cons: "0",
      created_at: "4598740456",
      max_connections: "1",
      allowed_output_formats: ["ts"],
    },
    server_info: {
      url: cred.server,
      port: "80",
      https_port: "443",
      server_protocol: "https",
      rtmp_port: "25462",
      timezone: "America/Sao_Paulo",
      timestamp_now: 1771529938,
      time_now: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    },
  };

  let repository: APICredentialRepository;
  let sut: ValidateCredentialsUseCase;

  it("if data is equal mocked success response", async () => {
    mock.onGet().reply(200, successResponse);

    repository = new APICredentialRepository("server", "username", "pass");
    sut = new ValidateCredentialsUseCase(repository);

    const { isValid } = await sut.execute();

    expect(isValid).toBe(true);
  });

  it("returns 401 invalid credentials", async () => {
    const notAuthorizedResponse = {
      ok: false,
      status: 401,
      data: { error: "Invalid Credentials." },
    };

    mock.onGet().reply(notAuthorizedResponse.status, notAuthorizedResponse);

    const { isValid, error } = await sut.execute();

    expect(isValid).toBe(false);
    expect(error).toBe(notAuthorizedResponse.data.error);
  });

  it("return 400 with invalid host for connection errors", async () => {
    const mockAxiosError = Object.assign(new Error("Network Error"), {
      isAxiosError: true,
      code: "ENOTFOUND",
      request: {},
    });

    mock.onGet().reply(() => {
      return Promise.reject(mockAxiosError);
    });

    const { isValid, error } = await sut.execute();

    expect(isValid).toBe(false);
    expect(error).toBe("Invalid URL.");
  });

  it("returns 503 when the API returns data that fails Zod parsing", async () => {
    const invalidData = { wrongField: "oops" };
    mock.onGet().reply(200, invalidData);

    const { isValid, error } = await sut.execute();

    expect(isValid).toBe(false);
    expect(error).toBe("Service Unavailable");
  });
});
