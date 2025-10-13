export type RelationshipFunction = (
  userId: string,
  resourceId: string
) => Promise<boolean>;

export interface ResourceRole {
  name: string;
  actions: readonly string[];
  condition: RelationshipFunction;
}

export interface ResourceDefinition {
  actions: readonly string[];
  roles: readonly ResourceRole[];
}

export interface Policies {
  [resourceType: string]: ResourceDefinition;
}

/*
Generic builder to enforce compile-time consistency between
resource types, actions, roles and role-conditions. 
*/

export type ResourcesShape = Record<string, readonly string[]>;

export type RolesShape<TResources extends ResourcesShape> = {
  readonly [R in keyof TResources]?: ReadonlyArray<{
    name: string;
    actions: readonly string[];
  }>;
};

export type ConditionsShape<
  TResources extends ResourcesShape,
  TRoles extends RolesShape<TResources>,
> = {
  readonly [R in keyof TResources]?: Partial<
    Record<
      Extract<
        TRoles[R] extends ReadonlyArray<infer RR>
          ? RR extends { name: infer N }
            ? N
            : never
          : never,
        string
      >,
      RelationshipFunction
    >
  >;
};
