import type { BetterAuthClientPlugin } from "better-auth/client";
import type { ZanzibarPlugin } from "./server";

export const ZanzibarClientPlugin = () => {
  return {
    id: "zanzibar-plugin",
    $InferServerPlugin: {} as ReturnType<typeof ZanzibarPlugin>,
  } satisfies BetterAuthClientPlugin;
};

export type { AuthorizationResult, PolicyEvaluationOptions } from "./types";
