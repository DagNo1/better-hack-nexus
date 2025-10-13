import { policyEngineInstance } from "./policy-engine";

export const checkRole = async (
  resourceType: string,
  roleName: string,
  userId: string,
  resourceId: string
): Promise<boolean> => {
  if (!policyEngineInstance) throw new Error("Policy engine not initialized");
  return (
    await policyEngineInstance.checkRole(
      resourceType,
      roleName,
      userId,
      resourceId
    )
  ).allowed;
};

export const check = async (
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string
): Promise<boolean> => {
  if (!policyEngineInstance) throw new Error("Policy engine not initialized");
  return (
    await policyEngineInstance.check(userId, action, resourceType, resourceId)
  ).allowed;
};
