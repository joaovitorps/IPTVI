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

// const getActivePlaylist = (): Playlist | null => {
//   const activeId = store.get("activePlaylistId");
//   const playlists = store.get("playlists") || [];
//   return playlists.find((p) => p.id === activeId) || null;
// };

// export const getUserData = async (
//   credentials: Credentials,
// ): Promise<UserDataResponse> => {
//   const { server, username, password } = credentials;

//   try {
//     const response = await axiosInstance(server, { username, password }).get(
//       "/player_api.php",
//     );

//     const parsed = AccountInfo.safeParse(response.data);

//     if (!parsed.success) {
//       console.error(parsed.error);
//       return { ok: false, status: 503, data: { error: "Service Unavailable" } };
//     }

//     return { ok: true, status: response.status, data: parsed.data };
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       if (err.response) {
//         if (err.response.status === 401) {
//           return {
//             ok: false,
//             status: 401,
//             data: { error: "Invalid Credentials." },
//           };
//         }
//       } else if (err.request) {
//         if (
//           err.code === "ENOTFOUND" ||
//           err.code === "DEPTH_ZERO_SELF_SIGNED_CERT"
//         ) {
//           return {
//             ok: false,
//             status: 400,
//             data: { error: "Invalid URL." },
//           };
//         }
//       }
//     }
//     return { ok: false, status: 500, data: { error: "Unknown error." } };
//   }
// };

// export const getSeriesCategories = async () => {
//   try {
//     const currentPlaylist = getActivePlaylist();
//     if (!currentPlaylist) throw new Error("No active playlist");

//     const { server, username, password } = currentPlaylist.credentials;

//     const response = await axiosInstance(server, {
//       username,
//       password,
//       action: "get_series_categories",
//     }).get("/player_api.php");

//     const parsed = SeriesCategories.safeParse(response.data);

//     if (!parsed.success) {
//       console.error(parsed.error);
//       return [];
//     }

//     return parsed.data;
//   } catch (error) {
//     console.error(error);
//     return [];
//   }
// };

// export const getSeriesCategory = async (category_id: number) => {
//   try {
//     const currentPlaylist = getActivePlaylist();
//     if (!currentPlaylist) throw new Error("No active playlist");

//     const { server, username, password } = currentPlaylist.credentials;

//     const response = await axiosInstance(server, {
//       username,
//       password,
//       action: "get_series",
//       category_id: category_id,
//     }).get("/player_api.php");

//     const parsed = Series.safeParse(response.data);

//     if (!parsed.success) {
//       console.error(parsed.error);
//       return [];
//     }

//     return parsed.data;
//   } catch (error) {
//     console.error(error);
//     return [];
//   }
// };

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
