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
