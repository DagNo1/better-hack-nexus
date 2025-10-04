// Policy function signature
export type PolicyFunction = (userId: string, resourceId: string) => boolean;

// Action policies for a resource type
export interface ActionPolicies {
  [action: string]: PolicyFunction;
}

// Resource policies
export interface ResourcePolicies {
  [resourceType: string]: ActionPolicies;
}

// Authorization result
export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  policy_function?: string;
}

// Policy evaluation options
export interface PolicyEvaluationOptions {
  include_details?: boolean;
  debug?: boolean;
}
