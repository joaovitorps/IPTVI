import { Credentials } from "@/shared/types";

import { UserDataResponse, getUserData } from "../api/requests";

export const validateCredentials = async (
  credentials: Credentials,
): Promise<UserDataResponse> => {
  return await getUserData(credentials);
};
