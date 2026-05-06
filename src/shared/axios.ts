import axios from "axios";

export const axiosInstance = (
  server: string,
  params: Record<string, string | number>,
) => {
  return axios.create({
    baseURL: `http://${server}`,
    params,
  });
};
