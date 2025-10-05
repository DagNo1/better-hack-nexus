import type { ResourcePolicies } from "../plugins/zanzibar";
import { allRelationships } from "./relationships";

export const examplePolicies: ResourcePolicies = {
  // Project policies
  project: {
    // Action policies
    delete: async (userId: string, resourceId: string) => {
      return await allRelationships.project.owner(userId, resourceId);
    },
    read: async (userId: string, resourceId: string) => {
      return await allRelationships.project.member(userId, resourceId);
    },
    edit: async (userId: string, resourceId: string) => {
      return await allRelationships.project.owner(userId, resourceId);
    },
    share: async (userId: string, resourceId: string) => {
      return await allRelationships.project.owner(userId, resourceId);
    },
    // Relationship policies
    owner: allRelationships.project.owner,
    member: allRelationships.project.member,
  },

  // Folder policies
  folder: {
    // Action policies
    delete: async (userId: string, resourceId: string) => {
      return await allRelationships.folder.owner(userId, resourceId);
    },
    read: async (userId: string, resourceId: string) => {
      return await allRelationships.folder.member(userId, resourceId);
    },
    edit: async (userId: string, resourceId: string) => {
      return await allRelationships.folder.owner(userId, resourceId);
    },
    share: async (userId: string, resourceId: string) => {
      return await allRelationships.folder.owner(userId, resourceId);
    },
    // Relationship policies
    owner: allRelationships.folder.owner,
    projectOwner: allRelationships.folder.projectOwner,
    member: allRelationships.folder.member,
  },

  // File policies
  file: {
    // Action policies
    delete: async (userId: string, resourceId: string) => {
      return await allRelationships.file.owner(userId, resourceId);
    },
    read: async (userId: string, resourceId: string) => {
      return await allRelationships.file.member(userId, resourceId);
    },
    edit: async (userId: string, resourceId: string) => {
      return await allRelationships.file.owner(userId, resourceId);
    },
    share: async (userId: string, resourceId: string) => {
      return await allRelationships.file.owner(userId, resourceId);
    },
    // Relationship policies
    owner: allRelationships.file.owner,
    projectOwner: allRelationships.file.projectOwner,
    folderOwner: allRelationships.file.folderOwner,
    member: allRelationships.file.member,
  },

  // Todo policies
  todo: {
    // Action policies
    delete: async (userId: string, resourceId: string) => {
      return await allRelationships.todo.owner(userId, resourceId);
    },
    read: async (userId: string, resourceId: string) => {
      return await allRelationships.todo.member(userId, resourceId);
    },
    edit: async (userId: string, resourceId: string) => {
      return await allRelationships.todo.owner(userId, resourceId);
    },
    share: async (userId: string, resourceId: string) => {
      return await allRelationships.todo.owner(userId, resourceId);
    },
    // Relationship policies
    owner: allRelationships.todo.owner,
    projectOwner: allRelationships.todo.projectOwner,
    member: allRelationships.todo.member,
  },

  // User policies
  user: {
    // Action policies
    delete: async (userId: string, resourceId: string) => {
      return await allRelationships.user.self(userId, resourceId);
    },
    read: async (userId: string, resourceId: string) => {
      return await allRelationships.user.self(userId, resourceId);
    },
    edit: async (userId: string, resourceId: string) => {
      return await allRelationships.user.self(userId, resourceId);
    },
    // Relationship policies
    self: allRelationships.user.self,
  },
};
