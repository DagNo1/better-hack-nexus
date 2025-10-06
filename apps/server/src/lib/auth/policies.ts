import {
  checkUserHasResourceRoleForAction,
  type ResourcePolicies,
} from "../plugins/zanzibar";

export const policies: ResourcePolicies = {
  project: {
    delete: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "project",
        "delete",
        userId,
        resourceId
      );
    },
    read: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "project",
        "read",
        userId,
        resourceId
      );
    },
    edit: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "project",
        "edit",
        userId,
        resourceId
      );
    },
    share: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "project",
        "share",
        userId,
        resourceId
      );
    },
  },
  folder: {
    delete: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "folder",
        "delete",
        userId,
        resourceId
      );
    },
    read: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "folder",
        "read",
        userId,
        resourceId
      );
    },
    edit: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "folder",
        "edit",
        userId,
        resourceId
      );
    },
    share: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "folder",
        "share",
        userId,
        resourceId
      );
    },
  },
  document: {
    delete: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "document",
        "delete",
        userId,
        resourceId
      );
    },
    read: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "document",
        "read",
        userId,
        resourceId
      );
    },
    edit: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "document",
        "edit",
        userId,
        resourceId
      );
    },
    share: async (userId: string, resourceId: string) => {
      return await checkUserHasResourceRoleForAction(
        "document",
        "share",
        userId,
        resourceId
      );
    },
  },
};
