import type { Policies } from "./types";
import NodeCache from "node-cache";

// Global policy engine instance
export let policyEngineInstance: PolicyEngine | null = null;

export function initializePolicyEngine(policies: Policies, cachingEnabled: boolean = true): PolicyEngine {
  policyEngineInstance = new PolicyEngine(policies, cachingEnabled);

  return policyEngineInstance;
}

export class PolicyEngine {
  private policies: Policies;
  private cache: NodeCache;
  private cachingEnabled: boolean;

  constructor(policies: Policies, cachingEnabled: boolean = true) {
    this.policies = policies;
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes TTL
    this.cachingEnabled = cachingEnabled;
  }

  async checkRole(
    resourceType: string,
    roleName: string,
    userId: string,
    resourceId: string
  ): Promise<{ allowed: boolean; message: string }> {
    const cacheKey = `checkRole:${resourceType}:${roleName}:${userId}:${resourceId}`;

    if (this.cachingEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as { allowed: boolean; message: string };
      }
    }

    const resource = this.policies[resourceType];
    if (!resource) {
      const result = {
        allowed: false,
        message: `Unknown resource type '${resourceType}'`,
      };
      if (this.cachingEnabled) this.cache.set(cacheKey, result);
      return result;
    }
    const role = resource.roles.find((r) => r.name === roleName);
    if (!role) {
      const result = {
        allowed: false,
        message: `Unknown role '${roleName}' for resource '${resourceType}'`,
      };
      if (this.cachingEnabled) this.cache.set(cacheKey, result);
      return result;
    }
    const allowed = await role.condition(userId, resourceId);
    const result = {
      allowed,
      message: allowed
        ? `Role '${roleName}' allowed on ${resourceType}`
        : `Role '${roleName}' denied on ${resourceType}`,
    };
    if (this.cachingEnabled) this.cache.set(cacheKey, result);
    return result;
  }

  async check(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string
  ): Promise<{ allowed: boolean; message: string }> {
    const cacheKey = `check:${userId}:${action}:${resourceType}:${resourceId}`;

    if (this.cachingEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached as { allowed: boolean; message: string };
      }
    }

    const resource = this.policies[resourceType];
    if (!resource) {
      const result = {
        allowed: false,
        message: `Unknown resource type '${resourceType}'`,
      };
      if (this.cachingEnabled) this.cache.set(cacheKey, result);
      return result;
    }
    if (!resource.actions.includes(action)) {
      const result = {
        allowed: false,
        message: `Unknown action '${action}' for resource '${resourceType}'`,
      };
      if (this.cachingEnabled) this.cache.set(cacheKey, result);
      return result;
    }
    for (const role of resource.roles) {
      if (!role.actions.includes(action)) continue;
      const allowed = await role.condition(userId, resourceId);
      if (allowed) {
        const result = {
          allowed: true,
          message: `Action '${action}' allowed on ${resourceType}`,
        };
        if (this.cachingEnabled) this.cache.set(cacheKey, result);
        return result;
      }
    }
    const result = {
      allowed: false,
      message: `Action '${action}' denied on ${resourceType}`,
    };
    if (this.cachingEnabled) this.cache.set(cacheKey, result);
    return result;
  }
}
