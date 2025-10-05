import { createAuthClient } from "better-auth/react";
import { ZanzibarClientPlugin } from "../../../server/src/lib/plugins/zanzibar/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [ZanzibarClientPlugin()],
  fetchOptions: {
    credentials: "include",
  },
});
