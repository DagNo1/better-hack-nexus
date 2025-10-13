import type { Resources, ResourceRole } from "./types";
import { checkUserHasResourceRole as runtimeCheckUserHasResourceRole } from "./check";

// Generic builder to enforce compile-time consistency between
// resource types, actions, roles and role-conditions.

// Derive the action union for a given resource type key K
type ActionsOf<
  RA extends Record<string, readonly string[]>,
  K extends keyof RA,
> = RA[K][number];

// Roles definition per resource: array of { name, actions[] } where actions are subset of allowed actions for that resource
type RolesDefForResource<AllowedAction extends string> = readonly Readonly<{
  name: string;
  actions: readonly AllowedAction[];
}>[];

// Roles map across all resources
type RolesDef<RA extends Record<string, readonly string[]>> = {
  readonly [K in keyof RA]: RolesDefForResource<ActionsOf<RA, K>>;
};

// For a resource K, extract the union of role names defined in RolesDef[K]
type RoleNamesOf<
  RA extends Record<string, readonly string[]>,
  RR extends RolesDef<RA>,
  K extends keyof RA,
> = RR[K][number]["name"];

// Conditions map: for each resource, an object whose keys are the exact role names defined for that resource
type ConditionsDef<
  RA extends Record<string, readonly string[]>,
  RR extends RolesDef<RA>,
> = {
  readonly [K in keyof RA]: {
    readonly [R in RoleNamesOf<RA, RR, K>]: (
      userId: string,
      resourceId: string
    ) => boolean | Promise<boolean>;
  };
};

export function createAccessControl<
  RA extends Record<string, readonly string[]>,
>(resourceActions: RA) {
  function resourceRoles<RR extends RolesDef<RA>>(rolesDef: RR) {
    function roleConditions<RC extends ConditionsDef<RA, RR>>(
      conditionsDef: RC
    ) {
      // Build Resources structure consumed by the Zanzibar server plugin
      const resources = Object.keys(resourceActions).reduce(
        (acc, resourceType) => {
          type K = keyof RA & string;
          const k = resourceType as K;
          const actions = [...resourceActions[k]] as string[];
          const conditionMap = conditionsDef as unknown as Record<
            string,
            Record<
              string,
              (userId: string, resourceId: string) => boolean | Promise<boolean>
            >
          >;

          const roleEntries: ResourceRole[] = (
            rolesDef[k] as ReadonlyArray<{
              name: string;
              actions: readonly string[];
            }>
          ).map((role) => {
            const cond = conditionMap[k][role.name]!;
            return {
              name: role.name,
              actions: [...role.actions],
              // Ensure the condition strictly returns a Promise<boolean>
              condition: async (
                userId: string,
                resourceId: string
              ): Promise<boolean> => {
                return await cond(userId, resourceId);
              },
            };
          });

          (acc as any)[k] = { actions, roles: roleEntries };
          return acc;
        },
        {} as Resources
      );

      return resources;
    }

    // A typed check proxy that is aware of resource type keys and role names per resource
    async function checkRole<
      K extends keyof RA & keyof RR,
      R extends RoleNamesOf<RA, RR, K>,
    >(
      resourceType: K,
      roleName: R,
      userId: string,
      resourceId: string
    ): Promise<boolean> {
      // Delegate to runtime engine (stringly-typed at runtime, type-safe at compile-time)
      return runtimeCheckUserHasResourceRole(
        resourceType as string,
        roleName as string,
        userId,
        resourceId
      );
    }

    return {
      roleConditions,
      checkRole,
    } as const;
  }

  return {
    resourceRoles,
  } as const;
}

export type AccessControlFrom<RA extends Record<string, readonly string[]>> =
  ReturnType<typeof createAccessControl<RA>>;
