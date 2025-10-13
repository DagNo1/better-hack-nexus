import type { Policies } from "./types";

// Global policy engine instance
export let policyEngineInstance: PolicyEngine | null = null;

export function initializePolicyEngine(policies: Policies): PolicyEngine {
  policyEngineInstance = new PolicyEngine(policies);

  return policyEngineInstance;
}

export class PolicyEngine {
  private policies: Policies;

  constructor(policies: Policies) {
    this.policies = policies;
  }

  async checkRole(
    resourceType: string,
    roleName: string,
    userId: string,
    resourceId: string
  ): Promise<{ allowed: boolean; message: string }> {
    const resource = this.policies[resourceType];
    if (!resource) {
      return {
        allowed: false,
        message: `Unknown resource type '${resourceType}'`,
      };
    }
    const role = resource.roles.find((r) => r.name === roleName);
    if (!role) {
      return {
        allowed: false,
        message: `Unknown role '${roleName}' for resource '${resourceType}'`,
      };
    }
    if (await role.condition(userId, resourceId)) {
      return {
        allowed: true,
        message: `Role '${roleName}' allowed on ${resourceType}`,
      };
    }
    return {
      allowed: false,
      message: `Role '${roleName}' denied on ${resourceType}`,
    };
  }

  async check(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string
  ): Promise<{ allowed: boolean; message: string }> {
    const resource = this.policies[resourceType];
    if (!resource) {
      return {
        allowed: false,
        message: `Unknown resource type '${resourceType}'`,
      };
    }
    if (!resource.actions.includes(action)) {
      return {
        allowed: false,
        message: `Unknown action '${action}' for resource '${resourceType}'`,
      };
    }
    for (const role of resource.roles) {
      if (!role.actions.includes(action)) continue;
      if (await role.condition(userId, resourceId)) {
        return {
          allowed: true,
          message: `Action '${action}' allowed on ${resourceType}`,
        };
      }
    }
    return {
      allowed: false,
      message: `Action '${action}' denied on ${resourceType}`,
    };
  }
}
