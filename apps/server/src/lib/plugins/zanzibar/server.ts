import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { initializePolicyEngine, policyEngineInstance } from "./policy-engine";
import type { ResourcePolicies } from "./types";

export const ZanzibarServerPlugin = (policies?: ResourcePolicies) => {
  const pluginId = "zanzibar-plugin";

  if (policies && !policyEngineInstance) {
    initializePolicyEngine(policies);
  }

  return {
    id: pluginId,
    endpoints: {
      // Health check endpoint
      ping: createAuthEndpoint(
        "/zanzibar/ping",
        { method: "GET" },
        async (ctx) => {
          return ctx.json({
            status: "ok",
            plugin: pluginId,
            zanzibar_initialized: !!policyEngineInstance,
          });
        }
      ),

      // Authorization check endpoint
      check: createAuthEndpoint(
        "/zanzibar/check",
        { method: "POST", use: [sessionMiddleware] },
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

            return ctx.json({ allowed });
          } catch (error) {
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 }
            );
          }
        }
      ),

      // Detailed authorization check endpoint
      checkDetailed: createAuthEndpoint(
        "/zanzibar/check-detailed",
        { method: "POST", use: [sessionMiddleware] },
        async (ctx) => {
          try {
            const body = await ctx.request?.json();
            const { action, resourceType, resourceId, options = {} } = body;
            const userId = ctx.context.session?.user.id;

            if (!action || !resourceType || !resourceId) {
              return ctx.json(
                {
                  error:
                    "Missing required fields: action, resourceType, resourceId",
                },
                { status: 400 }
              );
            }

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Zanzibar not initialized with policies" },
                { status: 500 }
              );
            }

            const result = await policyEngineInstance.checkDetailed(
              userId,
              action,
              resourceType,
              resourceId,
              options
            );

            return ctx.json(result);
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
export type {
  AuthorizationResult,
  PolicyFunction,
  ResourcePolicies,
} from "./types";
