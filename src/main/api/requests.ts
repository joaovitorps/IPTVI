import { axiosInstance } from "@/shared/axios";
import { AccountInfo } from "@/shared/schemas";
import * as z from "zod";

type defaultErrorResponse = {
  error: string;
};

export type UserDataResponse =
  | { ok: true; status: number; data: z.infer<typeof AccountInfo> }
  | {
      ok: false;
      status: number;
      data: defaultErrorResponse;
    };

export const getSerieInfo = async (series_id: number) => {
  try {
    const currentPlaylist = getActivePlaylist();
    if (!currentPlaylist) throw new Error("No active playlist");

    const { server, username, password } = currentPlaylist.credentials;

    const response = await axiosInstance(server, {
      username,
      password,
      action: "get_series_info",
      series_id: series_id,
    }).get("/player_api.php");

    return response.data as unknown;
  } catch (error) {
    console.error(error);
    return null;
  }
};
