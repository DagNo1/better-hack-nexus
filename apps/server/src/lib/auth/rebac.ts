import prisma from "@/db";

import { createAccessControl } from "better-auth-zanzibar-plugin";

const resources = {
  project: ["delete", "read", "edit", "share"],
  folder: ["delete", "read", "edit", "share"],
  file: ["delete", "read", "edit", "share"],
} as const;

const ac = createAccessControl(resources);

const acRoles = ac.resourceRoles({
  project: [
    { name: "owner", actions: ["delete", "read", "edit", "share"] },
    { name: "editor", actions: ["read", "edit"] },
    { name: "viewer", actions: ["read"] },
  ],
  folder: [
    { name: "owner", actions: ["delete", "read", "edit", "share"] },
    { name: "viewer", actions: ["read"] },
    { name: "sharer", actions: ["read", "share"] },
  ],
  file: [
    { name: "owner", actions: ["delete", "read", "edit", "share"] },
    { name: "viewer", actions: ["read"] },
    { name: "sharer", actions: ["read", "share"] },
  ],
} as const);

const policies = acRoles.roleConditions({
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
            },
          },
        },
      });
      return !!project;
    },
    viewer: async (userId: string, resourceId: string) => {
      const project = await prisma.project.findFirst({
        where: { id: resourceId, ownerId: userId },
      });
      return !!project;
    },
  },
  folder: {
    owner: async (userId: string, resourceId: string) => {
      const folder = await prisma.folder.findFirst({
        select: { projectId: true },
        where: {
          id: resourceId,
        },
      });

      if (folder?.projectId) {
        return await acRoles.checkRole(
          "project",
          "owner",
          userId,
          folder.projectId
        );
      }

      return false;
    },
    viewer: async (userId: string, resourceId: string) => {
      const folder = await prisma.folder.findFirst({
        select: { projectId: true },
        where: {
          id: resourceId,
        },
      });

      if (folder?.projectId) {
        return await acRoles.checkRole(
          "project",
          "viewer",
          userId,
          folder.projectId
        );
      }

      return false;
    },
    sharer: async (userId: string, resourceId: string) => {
      const folder = await prisma.folder.findFirst({
        select: { projectId: true },
        where: {
          id: resourceId,
        },
      });

      if (folder?.projectId) {
        return await acRoles.checkRole(
          "project",
          "owner",
          userId,
          folder.projectId
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
        return await acRoles.checkRole("folder", "owner", userId, doc.folderId);
      }

      return false;
    },
    viewer: async (userId: string, resourceId: string) => {
      const doc = await (prisma as any).file.findFirst({
        select: { folderId: true },
        where: { id: resourceId },
      });

      if (doc?.folderId) {
        return await acRoles.checkRole(
          "folder",
          "viewer",
          userId,
          doc.folderId
        );
      }

      return false;
    },
    sharer: async (userId: string, resourceId: string) => {
      const doc = await (prisma as any).file.findFirst({
        select: { folder: { select: { projectId: true } } },
        where: { id: resourceId },
      });

      const projectId = doc?.folder?.projectId ?? null;

      if (projectId) {
        return await acRoles.checkRole("project", "owner", userId, projectId);
      }

      return false;
    },
  },
} as const);

export default policies;
