import type {
  ConditionsShape,
  RelationshipFunction,
  ResourcesShape,
} from "./types";
import type { Policies, ResourceRole } from "./types";
import { checkRole as runtimeCheckRole } from "./check";

export function createAccessControl<TResources extends ResourcesShape>(
  resources: TResources
) {
  function resourceRoles<
    TRoles extends {
      readonly [K in keyof TResources]?: ReadonlyArray<{
        name: string;
        actions: ReadonlyArray<TResources[K][number]>;
      }>;
    },
  >(roles: TRoles) {
    // Runtime validation: resources and actions
    for (const [resource, roleList] of Object.entries(roles)) {
      if (!(resource in resources)) {
        throw new Error(`Unknown resource '${resource}' in roles`);
      }
      const allowedActions = new Set(resources[resource as keyof TResources]);
      for (const role of roleList ?? []) {
        for (const action of role.actions) {
          if (!allowedActions.has(action as string)) {
            throw new Error(
              `Unknown action '${action}' for resource '${resource}'`
            );
          }
        }
      }
    }

    type RoleNameMap = {
      [K in keyof TResources]: TRoles[K] extends ReadonlyArray<infer RR>
        ? RR extends { name: infer N }
          ? Extract<N, string>
          : never
        : never;
    };

    function roleConditions(conditions: ConditionsShape<TResources, TRoles>) {
      // Runtime validation: referenced resources/roles exist
      for (const [resource, roleMap] of Object.entries(conditions)) {
        if (!(resource in resources)) {
          throw new Error(`Unknown resource '${resource}' in conditions`);
        }
        const definedRoles = new Set(
          (roles as any)[resource]?.map((r: any) => r.name) ?? []
        );
        for (const roleName of Object.keys(roleMap ?? {})) {
          if (!definedRoles.has(roleName)) {
            throw new Error(
              `Unknown role '${roleName}' for resource '${resource}' in conditions`
            );
          }
        }
      }

      // Build Policies object for ZanzibarPlugin
      const policy = Object.keys(resources).reduce((acc, resourceType) => {
        const actions = [...(resources as any)[resourceType]] as string[];
        const roleDefs = ((roles as any)[resourceType] ?? []) as ReadonlyArray<{
          name: string;
          actions: readonly string[];
        }>;
        const resourceConditions = (conditions as any)[resourceType] ?? {};
        const roleEntries: ResourceRole[] = roleDefs.map((role) => ({
          name: role.name,
          actions: [...role.actions],
          condition: async (userId: string, resourceId: string) => {
            const cond = resourceConditions[role.name] as
              | RelationshipFunction
              | undefined;
            if (!cond) return false;
            return cond(userId, resourceId);
          },
        }));
        (acc as any)[resourceType] = { actions, roles: roleEntries };
        return acc;
      }, {} as Policies);

      return policy;
    }

    async function checkRole<
      K extends keyof TResources & keyof RoleNameMap & string,
      R extends RoleNameMap[K],
    >(
      resourceType: K,
      roleName: R,
      userId: string,
      resourceId: string
    ): Promise<boolean> {
      if (!(resourceType in resources)) {
        throw new Error(`Unknown resource '${resourceType}'`);
      }
      const definedRoles = new Set(
        (roles as any)[resourceType]?.map((r: any) => r.name) ?? []
      );
      if (!definedRoles.has(roleName)) {
        throw new Error(
          `Unknown role '${String(roleName)}' for resource '${String(resourceType)}'`
        );
      }
      return runtimeCheckRole(
        resourceType as string,
        roleName as string,
        userId,
        resourceId
      );
    }

    return { roleConditions, checkRole } as const;
  }

  return { resourceRoles } as const;
}
