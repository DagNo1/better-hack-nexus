import prisma from "../../db";
import { createAccessControl } from "better-auth-zanzibar-plugin";

const resources = {
  project: ["delete", "read", "edit", "share", "manage-members"],
  folder: ["delete", "read", "edit", "share", "view"],
  file: ["delete", "read", "edit", "share"],
  user: ["create", "delete", "read", "edit"],
} as const;

export const ac = createAccessControl(resources);

export const acRoles = ac.resourceRoles({
  project: [
    {
      name: "owner",
      actions: ["delete", "read", "edit", "share", "manage-members"],
    },
    { name: "editor", actions: ["read", "edit"] },
    { name: "viewer", actions: ["read"] },
  ],
  folder: [
    { name: "owner", actions: ["delete", "read", "edit", "share", "view"] },
    { name: "editor", actions: ["read", "edit", "view"] },
    { name: "viewer", actions: ["read", "view"] },
  ],
  file: [
    { name: "owner", actions: ["delete", "read", "edit", "share"] },
    { name: "editor", actions: ["read", "edit"] },
    { name: "viewer", actions: ["read"] },
  ],
  user: [
    { name: "admin", actions: ["create", "delete", "read", "edit"] },
    { name: "self", actions: ["read", "edit"] },
  ],
} as const);

export const policies = acRoles.roleConditions({
  project: {
    owner: async (userId: string, resourceId: string) => {
      const project = await prisma.project.findFirst({
        where: {
          id: resourceId,
          ownerId: userId,
        },
      });
      return !!project;
    },
    editor: async (userId: string, resourceId: string) => {
      const project = await prisma.project.findFirst({
        where: {
          id: resourceId,
          members: {
            some: {
              userId: userId,
              role: "editor",
            },
          },
        },
      });
      return !!project;
    },
    viewer: async (userId: string, resourceId: string) => {
      const project = await prisma.project.findFirst({
        where: {
          id: resourceId,
          members: {
            some: {
              userId: userId,
              role: "viewer",
            },
          },
        },
      });
      return !!project;
    },
  },
  folder: {
    owner: async (userId: string, resourceId: string) => {
      const folder = await prisma.folder.findFirst({
        select: { projectId: true, parentId: true },
        where: { id: resourceId },
      });

      if (!folder) return false;

      // If folder has direct project, check project ownership
      if (folder.projectId) {
        return await acRoles.hasRole(
          "project",
          "owner",
          userId,
          folder.projectId
        );
      }

      // If folder has parent, inherit from parent folder
      if (folder.parentId) {
        return await acRoles.hasRole(
          "folder",
          "owner",
          userId,
          folder.parentId
        );
      }

      return false;
    },
    editor: async (userId: string, resourceId: string) => {
      const folder = await prisma.folder.findFirst({
        select: { projectId: true, parentId: true },
        where: { id: resourceId },
      });

      if (!folder) return false;

      // If folder has direct project, check project editor role
      if (folder.projectId) {
        return await acRoles.hasRole(
          "project",
          "editor",
          userId,
          folder.projectId
        );
      }

      // If folder has parent, inherit from parent folder
      if (folder.parentId) {
        return await acRoles.hasRole(
          "folder",
          "editor",
          userId,
          folder.parentId
        );
      }

      return false;
    },
    viewer: async (userId: string, resourceId: string) => {
      const folder = await prisma.folder.findFirst({
        select: { projectId: true, parentId: true },
        where: { id: resourceId },
      });

      if (!folder) return false;

      // If folder has direct project, check project viewer role
      if (folder.projectId) {
        return await acRoles.hasRole(
          "project",
          "viewer",
          userId,
          folder.projectId
        );
      }

      // If folder has parent, inherit from parent folder
      if (folder.parentId) {
        return await acRoles.hasRole(
          "folder",
          "viewer",
          userId,
          folder.parentId
        );
      }

      return false;
    },
  },
  file: {
    owner: async (userId: string, resourceId: string) => {
      const doc = await (prisma as any).file.findFirst({
        select: { folderId: true },
        where: { id: resourceId },
      });

      if (doc?.folderId) {
        return await acRoles.hasRole("folder", "owner", userId, doc.folderId);
      }

      return false;
    },
    editor: async (userId: string, resourceId: string) => {
      const doc = await (prisma as any).file.findFirst({
        select: { folderId: true },
        where: { id: resourceId },
      });
      if (doc?.folderId) {
        return await acRoles.hasRole("folder", "editor", userId, doc.folderId);
      }
      return false;
    },
    viewer: async (userId: string, resourceId: string) => {
      const doc = await (prisma as any).file.findFirst({
        select: { folderId: true },
        where: { id: resourceId },
      });

      if (doc?.folderId) {
        return await acRoles.hasRole("folder", "viewer", userId, doc.folderId);
      }

      return false;
    },
  },
  user: {
    admin: async (userId: string, _resourceId?: string) => {
      const user = await prisma.user.findFirst({
        where: { id: userId, role: "admin" },
      });
      return !!user;
    },
    self: async (userId: string, resourceId: string) => {
      if (userId !== resourceId) return false;
      const user = await prisma.user.findFirst({
        where: { id: userId },
      });
      return !!user;
    },
  },
} as const);

export default policies;
