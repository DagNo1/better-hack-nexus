import type { BetterAuthClientPlugin } from "better-auth/client";
import type { BetterFetchOption } from "@better-fetch/fetch";
import type { ZanzibarServerPlugin } from "./server";
import type { PolicyEvaluationOptions } from "./types";

export const ZanzibarClientPlugin = () => {
  return {
    id: "zanzibar-plugin",
    $InferServerPlugin: {} as ReturnType<typeof ZanzibarServerPlugin>,

    getActions: ($fetch) => {
      return {
        check: async (
          data: {
            userId: string;
            action: string;
            resourceType: string;
            resourceId: string;
          },
          fetchOptions?: BetterFetchOption
        ) => {
          const res = await $fetch("/zanzibar/check", {
            method: "POST",
            body: data,
            ...fetchOptions,
          });
          return res;
        },

        // Detailed authorization check with options
        checkDetailed: async (
          data: {
            userId: string;
            action: string;
            resourceType: string;
            resourceId: string;
            options?: PolicyEvaluationOptions;
          },
          fetchOptions?: BetterFetchOption
        ) => {
          const res = await $fetch("/zanzibar/check-detailed", {
            method: "POST",
            body: data,
            ...fetchOptions,
          });
          return res;
        },

        // Get available policies (structure only)
        getPolicies: async (fetchOptions?: BetterFetchOption) => {
          const res = await $fetch("/zanzibar/policies", {
            method: "GET",
            ...fetchOptions,
          });
          return res;
        },

        // Health check
        ping: async (fetchOptions?: BetterFetchOption) => {
          const res = await $fetch("/zanzibar/ping", {
            method: "GET",
            ...fetchOptions,
          });
          return res;
        },
      };
    },

    // Override path methods if needed
    pathMethods: {
      "/zanzibar/check": "POST",
      "/zanzibar/check-detailed": "POST",
      "/zanzibar/policies": "GET",
      "/zanzibar/ping": "GET",
    },
  } satisfies BetterAuthClientPlugin;
};

// Export types for external use
export type { AuthorizationResult, PolicyEvaluationOptions } from "./types";
