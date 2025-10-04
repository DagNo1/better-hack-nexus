import { policyEngineInstance } from "./policy-engine";

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
