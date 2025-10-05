import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { initializePolicyEngine, policyEngineInstance } from "./policy-engine";
import type { ResourcePolicies, Resources } from "./types";
import { z } from "zod/v3";

export const ZanzibarServerPlugin = (
  policies: ResourcePolicies,
  resources: Resources
) => {
  const pluginId = "zanzibar-plugin";

  if (!policyEngineInstance) {
    initializePolicyEngine(policies, resources);
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

      // Get all actions for a specific resource type
      getResourceActions: createAuthEndpoint(
        "/zanzibar/resources/:resourceType/actions",
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

            const actions =
              policyEngineInstance.getResourceActions(resourceType);

            if (!actions) {
              return ctx.json(
                { error: `Resource type '${resourceType}' not found` },
                { status: 404 }
              );
            }

            return ctx.json({ resourceType, actions });
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

      // Get actions for a specific role on a resource type
      getRoleActions: createAuthEndpoint(
        "/zanzibar/resources/:resourceType/roles/:roleName/actions",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          try {
            const resourceType = ctx.params?.resourceType;
            const roleName = ctx.params?.roleName;

            if (!resourceType || !roleName) {
              return ctx.json(
                { error: "Resource type and role name are required" },
                { status: 400 }
              );
            }

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Zanzibar not initialized with policies" },
                { status: 500 }
              );
            }

            const actions = policyEngineInstance.getRoleActions(
              resourceType,
              roleName
            );

            if (actions === null) {
              return ctx.json(
                { error: `Resource type '${resourceType}' not found` },
                { status: 404 }
              );
            }

            if (actions === undefined) {
              return ctx.json(
                {
                  error: `Role '${roleName}' not found on resource type '${resourceType}'`,
                },
                { status: 404 }
              );
            }

            return ctx.json({ resourceType, roleName, actions });
          } catch (error) {
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 }
            );
          }
        }
      ),

      // Get all roles for a user on a specific resource
      getUserRoles: createAuthEndpoint(
        "/zanzibar/users/:userId/roles",
        {
          method: "POST",
          use: [sessionMiddleware],
          body: z.object({
            resourceType: z.string(),
            resourceId: z.string(),
          }),
        },
        async (ctx) => {
          try {
            const userId = ctx.params?.userId;
            const body = await ctx.request?.json();
            const { resourceType, resourceId } = body;

            if (!userId || !resourceType || !resourceId) {
              return ctx.json(
                {
                  error: "User ID, resource type, and resource ID are required",
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

            const userRoles = await policyEngineInstance.getUserRoles(
              userId,
              resourceType,
              resourceId
            );

            if (!userRoles) {
              return ctx.json(
                { error: `Resource type '${resourceType}' not found` },
                { status: 404 }
              );
            }

            return ctx.json(userRoles);
          } catch (error) {
            return ctx.json(
              { error: "Internal server error" },
              { status: 500 }
            );
          }
        }
      ),

      // Get all roles for a user across all resource types
      getAllUserRoles: createAuthEndpoint(
        "/zanzibar/users/:userId/roles/all",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          try {
            const userId = ctx.params?.userId;

            if (!userId) {
              return ctx.json(
                { error: "User ID is required" },
                { status: 400 }
              );
            }

            if (!policyEngineInstance) {
              return ctx.json(
                { error: "Zanzibar not initialized with policies" },
                { status: 500 }
              );
            }

            const allUserRoles =
              await policyEngineInstance.getAllUserRoles(userId);

            return ctx.json({ userId, roles: allUserRoles });
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
  Resources,
  UserRoleResponse,
} from "./types";
