import type { BetterAuthClientPlugin } from "better-auth/client";
import type { ZanzibarServerPlugin } from "./server";

export const ZanzibarClientPlugin = () => {
  return {
    id: "zanzibar-plugin",
    $InferServerPlugin: {} as ReturnType<typeof ZanzibarServerPlugin>,
  } satisfies BetterAuthClientPlugin;
};

// Export types for external use
export type { AuthorizationResult, PolicyEvaluationOptions } from "./types";
