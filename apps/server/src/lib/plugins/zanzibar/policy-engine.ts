import type {
  AuthorizationResult,
  PolicyEvaluationOptions,
  ResourcePolicies,
  Resources,
  ResourceRoleResponse,
} from "./types";

// Global policy engine instance
export let policyEngineInstance: PolicyEngine | null = null;

export function initializePolicyEngine(
  policies: ResourcePolicies,
  resources: Resources
): PolicyEngine {
  policyEngineInstance = new PolicyEngine(policies, resources);

  return policyEngineInstance;
}

export class PolicyEngine {
  private policies: ResourcePolicies = {};
  private resources: Resources;

  constructor(policies: ResourcePolicies, resources: Resources) {
    this.policies = policies;
    this.resources = resources;
  }

  /**
   * Check if user has a specific role on a resource
   */
  async checkUserHasResourceRole(
    resourceType: string,
    roleName: string,
    userId: string,
    resourceId: string
  ): Promise<boolean> {
    const resource = this.resources[resourceType];
    if (!resource) {
      return false;
    }

    // Find the specific role
    const role = resource.roles.find((r) => r.name === roleName);
    if (!role) {
      return false;
    }

    // Check if user has this role
    return await role.condition(userId, resourceId);
  }

  /**
   * Check if user has any role that allows the action
   */
  async checkUserHasResourceRoleForAction(
    resourceType: string,
    action: string,
    userId: string,
    resourceId: string
  ): Promise<boolean> {
    const resource = this.resources[resourceType];
    if (!resource) {
      return false;
    }

    // Find all roles that have this action in their permissions
    const relevantRoles = resource.roles.filter((role) =>
      role.actions.includes(action)
    );

    // Check if user satisfies ANY of the relevant roles
    for (const role of relevantRoles) {
      const hasRole = await role.condition(userId, resourceId);
      if (hasRole) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a user can perform an action on a resource
   * This is the main API method that matches your desired interface
   */
  async check(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    options: PolicyEvaluationOptions = {}
  ): Promise<boolean> {
    const result = await this.checkDetailed(
      userId,
      action,
      resourceType,
      resourceId,
      options
    );
    return result.allowed;
  }

  /**
   * Check with detailed result information
   */
  async checkDetailed(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    options: PolicyEvaluationOptions = {}
  ): Promise<AuthorizationResult> {
    try {
      // Get the policy function for this resource type and action

      const resourcePolicies = this.policies[resourceType];
      if (!resourcePolicies) {
        return {
          allowed: false,
          reason: `Resource '${resourceType}' Not found'`,
        };
      }

      const policyFunction = resourcePolicies[action] || null;

      if (!policyFunction) {
        return {
          allowed: false,
          reason: `No policy found for action '${action}' on resource type '${resourceType}'`,
        };
      }
      // Evaluate the policy function with just userId and resourceId
      const allowed = await policyFunction(userId, resourceId);

      const result: AuthorizationResult = {
        allowed,
        reason: allowed
          ? `Action '${action}' allowed on ${resourceType}`
          : `Action '${action}' denied on ${resourceType}`,
      };

      if (options.include_details) {
        result.policy_function = `${resourceType}.${action}`;
      }

      if (options.debug) {
        console.log(`[Nexus] Evaluating ${resourceType}.${action}:`, {
          userId,
          resourceId,
          result: allowed,
        });
      }

      return result;
    } catch (error) {
      return {
        allowed: false,
        reason: `Authorization error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Get all resources with their actions and roles
   */
  getResources(): Resources {
    return this.resources;
  }

  /**
   * Get all actions for a specific resource type
   */
  getResourceActions(resourceType: string): string[] | null {
    const resource = this.resources[resourceType];
    if (!resource) {
      return null;
    }
    return resource.actions;
  }

  /**
   * Get all roles for a specific resource type
   */
  getResourceRoles(resourceType: string): ResourceRoleResponse[] | null {
    const resource = this.resources[resourceType];
    if (!resource) {
      return null;
    }
    return resource.roles.map((role) => ({
      name: role.name,
      actions: role.actions,
      // Don't expose the condition function in the response
    }));
  }

  /**
   * Get actions for a specific role on a resource type
   * Returns null if resource type not found, undefined if role not found
   */
  getRoleActions(
    resourceType: string,
    roleName: string
  ): string[] | null | undefined {
    const resource = this.resources[resourceType];
    if (!resource) {
      return null;
    }

    const role = resource.roles.find((r) => r.name === roleName);
    if (!role) {
      return undefined;
    }

    return role.actions;
  }
}
