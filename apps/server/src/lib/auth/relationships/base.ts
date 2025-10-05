import prisma from "@/db";
import type { RelationshipFunction } from "../../plugins/zanzibar";

/**
 * Base relationship functions to eliminate repetition across resource types
 */

// Generic owner check for any resource with ownerId
export const createOwnerRelationship = (
  model: keyof typeof prisma,
  idField: string = "id"
): RelationshipFunction => {
  return (async (userId: string, resourceId: string): Promise<boolean> => {
    const resource = await (prisma[model] as any).findFirst({
      where: {
        [idField]: idField === "id" ? resourceId : parseInt(resourceId),
        ownerId: userId,
      },
    });
    return !!resource;
  }) as RelationshipFunction;
};

// Generic project owner check for any resource with project relation
export const createProjectOwnerRelationship = (
  model: keyof typeof prisma,
  idField: string = "id"
): RelationshipFunction => {
  return (async (userId: string, resourceId: string): Promise<boolean> => {
    const resource = await (prisma[model] as any).findFirst({
      where: {
        [idField]: idField === "id" ? resourceId : parseInt(resourceId),
        project: {
          ownerId: userId,
        },
      },
    });
    return !!resource;
  }) as RelationshipFunction;
};

// Generic folder owner check for any resource with folder relation
export const createFolderOwnerRelationship = (
  model: keyof typeof prisma,
  idField: string = "id"
): RelationshipFunction => {
  return (async (userId: string, resourceId: string): Promise<boolean> => {
    const resource = await (prisma[model] as any).findFirst({
      where: {
        [idField]: idField === "id" ? resourceId : parseInt(resourceId),
        folder: {
          ownerId: userId,
        },
      },
    });
    return !!resource;
  }) as RelationshipFunction;
};

// Generic member check that combines owner and project owner
export const createMemberRelationship = (
  model: keyof typeof prisma,
  idField: string = "id",
  additionalChecks: Array<{ relation: string; ownerField: string }> = []
): RelationshipFunction => {
  return (async (userId: string, resourceId: string): Promise<boolean> => {
    const orConditions: any[] = [
      { ownerId: userId },
      {
        project: {
          ownerId: userId,
        },
      },
    ];

    // Add additional checks (like folder owner for files)
    additionalChecks.forEach(({ relation, ownerField }) => {
      orConditions.push({
        [relation]: {
          [ownerField]: userId,
        },
      });
    });

    const resource = await (prisma[model] as any).findFirst({
      where: {
        [idField]: idField === "id" ? resourceId : parseInt(resourceId),
        OR: orConditions,
      },
    });
    return !!resource;
  }) as RelationshipFunction;
};

// Self relationship for user resources
export const createSelfRelationship = (): RelationshipFunction => {
  return (async (userId: string, resourceId: string): Promise<boolean> => {
    return userId === resourceId;
  }) as RelationshipFunction;
};
