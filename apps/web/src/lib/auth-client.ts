import { createAuthClient } from "better-auth/react";
import { ZanzibarClientPlugin } from "better-auth-zanzibar-plugin";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  plugins: [ZanzibarClientPlugin()],
  fetchOptions: {
    credentials: "include",
  },
});
