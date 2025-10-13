import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { initializePolicyEngine, policyEngineInstance } from "./policy-engine";
import type { Resources } from "./types";
import { z } from "zod/v3";

export const ZanzibarServerPlugin = (resources: Resources) => {
  const pluginId = "zanzibar-plugin";

  if (!policyEngineInstance) {
    initializePolicyEngine(resources);
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
        {
          method: "POST",
          use: [sessionMiddleware],
          body: z.object({
            action: z.string(),
            resourceType: z.string(),
            resourceId: z.string(),
            options: z.object({
              include_details: z.boolean().optional(),
            }),
          }),
        },
        async (ctx) => {
          try {
            const body = await ctx.body;
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

      // Get all resources with their actions and roles
      getResources: createAuthEndpoint(
        "/zanzibar/resources",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          try {
            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Zanzibar not initialized with policies" },
                { status: 500 }
              );
            }

            const resources = policyEngineInstance.getResources();
            return ctx.json({ resources });
          } catch (error) {
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 }
            );
          }
        }
      ),

      // Get all roles for a specific resource type
      getResourceRoles: createAuthEndpoint(
        "/zanzibar/resources/:resourceType/roles",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          try {
            const resourceType = ctx.params?.resourceType;

            if (!resourceType) {
              return ctx.json(
                { error: "Resource type is required" },
                { status: 400 }
              );
            }

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Zanzibar not initialized with policies" },
                { status: 500 }
              );
            }

            const roles = policyEngineInstance.getResourceRoles(resourceType);

            if (!roles) {
              return ctx.json(
                { error: `Resource type '${resourceType}' not found` },
                { status: 404 }
              );
            }

            return ctx.json({ resourceType, roles });
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
  Resources,
  UserRoleResponse,
  UserResourceMatrix,
  UserResourceMatrixEntry,
} from "./types";
