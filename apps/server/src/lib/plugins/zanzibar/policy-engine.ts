import type {
  AuthorizationResult,
  PolicyEvaluationOptions,
  ResourcePolicies,
} from "./types";

// Global policy engine instance
export let policyEngineInstance: PolicyEngine | null = null;

export function initializePolicyEngine(
  policies: ResourcePolicies
): PolicyEngine {
  policyEngineInstance = new PolicyEngine(policies);
  return policyEngineInstance;
}

export class PolicyEngine {
  private policies: ResourcePolicies = {};

  constructor(policies: ResourcePolicies) {
    this.policies = policies;
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
}
