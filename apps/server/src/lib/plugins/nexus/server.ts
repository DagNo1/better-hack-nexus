import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import {
  initializePolicyEngine,
  PolicyEngine,
  policyEngineInstance,
} from "./policy-engine";
import type { ResourcePolicies } from "./types";

export const NexusServerPlugin = (policies?: ResourcePolicies) => {
  const pluginId = "nexus-plugin";

  // Initialize Nexus instance if policies are provided
  if (policies && !policyEngineInstance) {
    initializePolicyEngine(policies);
  }

  return {
    id: pluginId,
    endpoints: {
      // Health check endpoint
      ping: createAuthEndpoint(
        "/nexus/ping",
        { method: "GET" },
        async (ctx) => {
          return ctx.json({
            status: "ok",
            plugin: pluginId,
            nexus_initialized: !!policyEngineInstance,
          });
        }
      ),

      // Authorization check endpoint
      check: createAuthEndpoint(
        "/nexus/check",
        { method: "POST", use: [sessionMiddleware] },
        async (ctx) => {
          try {
            const body = await ctx.request?.json();
            const { userId, action, resourceType, resourceId } = body;
            const session = ctx.context.session;

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Nexus not initialized with policies" },
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
        "/nexus/check-detailed",
        { method: "POST" },
        async (ctx) => {
          try {
            const body = await ctx.request?.json();
            const {
              userId,
              action,
              resourceType,
              resourceId,
              options = {},
            } = body;

            if (!userId || !action || !resourceType || !resourceId) {
              return ctx.json(
                {
                  error:
                    "Missing required fields: userId, action, resourceType, resourceId",
                },
                { status: 400 }
              );
            }

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Nexus not initialized with policies" },
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

export type { PolicyEngine as Nexus } from "./policy-engine";
export type {
  AuthorizationResult,
  PolicyFunction,
  ResourcePolicies,
} from "./types";
