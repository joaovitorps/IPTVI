import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { format } from "date-fns";

import { getUserData } from "@main/api/requests";

let mock: AxiosMockAdapter;

beforeAll(() => {
  mock = new AxiosMockAdapter(axios);
});

beforeEach(() => {});

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

it("if data is equal mocked success response", async () => {
  mock.onGet().reply(200, successResponse);

  const response = await getUserData(cred);

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
});

it("returns 401 invalid credentials", async () => {
  const notAuthorizedResponse = {
    ok: false,
    status: 401,
    data: { error: "Invalid Credentials." },
  };

  mock.onGet().reply(notAuthorizedResponse.status, notAuthorizedResponse);

  const response = await getUserData(cred);

  expect(response.ok).toBe(notAuthorizedResponse.ok);
  expect(response.status).toBe(notAuthorizedResponse.status);
  expect(response.data).toEqual(notAuthorizedResponse.data);
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

  const response = await getUserData(cred);

  expect(response.ok).toBe(false);
  expect(response.status).toBe(400);
  expect(response.data).toEqual({ error: "Invalid URL." });
});

it("returns 503 when the API returns data that fails Zod parsing", async () => {
  const invalidData = { wrongField: "oops" };
  mock.onGet().reply(200, invalidData);

  const result = await getUserData(cred);

  expect(result).toEqual({
    ok: false,
    status: 503,
    data: { error: "Service Unavailable" },
  });
});
