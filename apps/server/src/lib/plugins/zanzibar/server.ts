import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { initializePolicyEngine, policyEngineInstance } from "./policy-engine";
import type { ResourcePolicies, Resources } from "./types";
import { z } from "zod/v3";
import prisma from "@/db";

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

      // Returns users with their roles for each resource id (auto-enumerates resources/users)
      getUsersGroupedByResource: createAuthEndpoint(
        "/zanzibar/matrix",
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

            // Enumerate all users and resources
            const [users, projects, folders] = await Promise.all([
              prisma.user.findMany({ select: { id: true }, include:{} }),
              prisma.project.findMany({ select: { id: true } }),
              prisma.folder.findMany({ select: { id: true } }),
            ]);

            const grouped: Record<
              string,
              Array<{
                resourceId: string;
                users: Array<{ userId: string; roles: string[] }>;
              }>
            > = { project: [], folder: [] } as any;

            // Projects
            for (const p of projects) {
              const row: {
                resourceId: string;
                users: Array<{ userId: string; roles: string[] }>;
              } = {
                resourceId: p.id,
                users: [],
              };
              for (const u of users) {
                const res = await policyEngineInstance.getUserRoles(
                  u.id,
                  "project",
                  p.id
                );
                const roleNames = res?.roles.map((r) => r.name) ?? [];
                if (roleNames.length > 0)
                  row.users.push({ userId: u.id, roles: roleNames });
              }
              if (row.users.length > 0) grouped.project.push(row);
            }

            // Folders
            for (const f of folders) {
              const row: {
                resourceId: string;
                users: Array<{ userId: string; roles: string[] }>;
              } = {
                resourceId: f.id,
                users: [],
              };
              for (const u of users) {
                const res = await policyEngineInstance.getUserRoles(
                  u.id,
                  "folder",
                  f.id
                );
                const roleNames = res?.roles.map((r) => r.name) ?? [];
                if (roleNames.length > 0)
                  row.users.push({ userId: u.id, roles: roleNames });
              }
              if (row.users.length > 0) grouped.folder.push(row);
            }

            return ctx.json(grouped);
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
  UserResourceMatrix,
  UserResourceMatrixEntry,
} from "./types";
