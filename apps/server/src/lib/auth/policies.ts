import type { ResourcePolicies } from "../plugins/zanzibar";
import { checkUserHasRoleForAction } from "../plugins/zanzibar";

export const policies: ResourcePolicies = {
  project: {
    delete: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "project",
        "delete",
        userId,
        resourceId
      );
    },
    read: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "project",
        "read",
        userId,
        resourceId
      );
    },
    edit: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "project",
        "edit",
        userId,
        resourceId
      );
    },
    share: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "project",
        "share",
        userId,
        resourceId
      );
    },
  },
  folder: {
    delete: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "folder",
        "delete",
        userId,
        resourceId
      );
    },
    read: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "folder",
        "read",
        userId,
        resourceId
      );
    },
    edit: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "folder",
        "edit",
        userId,
        resourceId
      );
    },
    share: async (userId: string, resourceId: string) => {
      return await checkUserHasRoleForAction(
        "folder",
        "share",
        userId,
        resourceId
      );
    },
  },
};
