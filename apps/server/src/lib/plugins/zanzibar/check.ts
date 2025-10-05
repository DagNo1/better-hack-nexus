import { policyEngineInstance } from "./policy-engine";

// Function to check if user has a specific role on a resource
export const checkUserHasResourceRole = async (
  resourceType: string,
  roleName: string,
  userId: string,
  resourceId: string
): Promise<boolean> => {
  if (!policyEngineInstance) {
    throw new Error("Policy engine not initialized");
  }

  return await policyEngineInstance.checkUserHasResourceRole(
    resourceType,
    roleName,
    userId,
    resourceId
  );
};

// Function to check if user has any role that allows the action
export const checkUserHasResourceRoleForAction = async (
  resourceType: string,
  action: string,
  userId: string,
  resourceId: string
): Promise<boolean> => {
  if (!policyEngineInstance) {
    throw new Error("Policy engine not initialized");
  }

  return await policyEngineInstance.checkUserHasResourceRoleForAction(
    resourceType,
    action,
    userId,
    resourceId
  );
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
