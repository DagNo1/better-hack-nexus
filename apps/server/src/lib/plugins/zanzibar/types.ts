// Policy function signature - can be sync or async
export type PolicyFunction = (
  userId: string,
  resourceId: string
) => boolean | Promise<boolean>;

// Relationship checking function signature
export type RelationshipFunction = (
  userId: string,
  resourceId: string
) => Promise<boolean>;

// Action policies for a resource type
export interface ActionPolicies {
  [action: string]: PolicyFunction;
}

// Relationship policies for a resource type
export interface RelationshipPolicies {
  [relationship: string]: RelationshipFunction;
}

// Resource policies
export interface ResourcePolicies {
  [resourceType: string]: ActionPolicies | RelationshipPolicies;
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
