import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { initializePolicyEngine, policyEngineInstance } from "./policy-engine";
import type { Policies } from "./types";
import { z } from "zod/v3";

export const ZanzibarPlugin = (policies: Policies) => {
  const pluginId = "zanzibar-plugin";

  if (!policyEngineInstance) {
    initializePolicyEngine(policies);
  }

  return {
    id: pluginId,
    endpoints: {
      check: createAuthEndpoint(
        "/zanzibar/check",
        {
          method: "POST",
          use: [sessionMiddleware],
          body: z.object({
            action: z.string(),
            resourceType: z.string(),
            resourceId: z.string(),
          }),
        },
        async (ctx) => {
          try {
            const body = await ctx.request?.json();
            const { action, resourceType, resourceId } = body;
            const userId = ctx.context.session?.user.id;

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Zanzibar not initialized with policies" },
                { status: 500 }
              );
            }

            const allowed = await policyEngineInstance.check(
              userId,
              action,
              resourceType,
              resourceId
            );
            return ctx.json({
              allowed,
              message: allowed
                ? `Action '${action}' allowed on ${resourceType}`
                : `Action '${action}' denied on ${resourceType}`,
            });
          } catch (error) {
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 }
            );
          }
        }
      ),
    },
  } satisfies BetterAuthPlugin;
};

export type { PolicyEngine } from "./policy-engine";
