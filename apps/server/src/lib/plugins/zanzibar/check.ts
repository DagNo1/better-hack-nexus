import { policyEngineInstance } from "./policy-engine";
import type { Resources } from "./types";

// Global resources instance
let resourcesInstance: Resources | null = null;

// Function to set resources
export const setResources = (resources: Resources) => {
  resourcesInstance = resources;
};

// Function to check if user has a specific role on a resource
export const checkUserHasRole = async (
  resourceType: string,
  roleName: string,
  userId: string,
  resourceId: string
): Promise<boolean> => {
  if (!resourcesInstance) {
    throw new Error("Resources not initialized");
  }

  const resource = resourcesInstance[resourceType];
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
};

// Function to check if user has any role that allows the action
export const checkUserHasRoleForAction = async (
  resourceType: string,
  action: string,
  userId: string,
  resourceId: string
): Promise<boolean> => {
  if (!resourcesInstance) {
    throw new Error("Resources not initialized");
  }

  const resource = resourcesInstance[resourceType];
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
};

export const check = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) => {
  if (!policyEngineInstance) {
    throw new Error("Policy engine not initialized");
  }
  return policyEngineInstance.check(userId, action, resourceType, resourceId);
};

export const checkDetailed = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
) => {
  if (!policyEngineInstance) {
    throw new Error("Policy engine not initialized");
  }
  return policyEngineInstance.checkDetailed(
    userId,
    action,
    resourceType,
    resourceId
  );
};
