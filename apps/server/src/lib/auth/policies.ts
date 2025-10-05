import type { ResourcePolicies, Resources } from "../plugins/zanzibar";
import { checkUserHasRoleForAction } from "../plugins/zanzibar";
import prisma from "@/db";

export const resources: Resources = {
  project: {
    actions: ["delete", "read", "edit", "share"],
    roles: [
      {
        name: "owner",
        actions: ["delete", "read", "edit", "share"],
        condition: async (userId: string, resourceId: string) => {
          const project = await prisma.project.findFirst({
            where: {
              id: resourceId,
              ownerId: userId,
            },
          });
          return !!project;
        },
      },
    ],
  },
  folder: {
    actions: ["delete", "read", "edit", "share"],
    roles: [
      {
        name: "owner",
        actions: ["delete", "read", "edit", "share"],
        condition: async (userId: string, resourceId: string) => {
          const folder = await prisma.folder.findFirst({
            where: {
              id: resourceId,
              OR: [
                { ownerId: userId },
                {
                  project: {
                    ownerId: userId,
                  },
                },
              ],
            },
          });
          return !!folder;
        },
      },
      {
        name: "editor",
        actions: ["read", "edit"],
        condition: async (userId: string, resourceId: string) => {
          // First check: Direct folder ownership
          const directOwner = await prisma.folder.findFirst({
            where: {
              id: resourceId,
              ownerId: userId,
            },
          });

          if (directOwner) return true;

          // Second check: Cascade up - check project ownership
          const folder = await prisma.folder.findFirst({
            where: { id: resourceId },
            select: { projectId: true },
          });

          if (!folder?.projectId) return false;

          return await checkUserHasRoleForAction(
            "project",
            "owner",
            userId,
            folder.projectId
          );
        },
      },
      {
        name: "viewer",
        actions: ["read"],
        condition: async (userId: string, resourceId: string) => {
          // First check: Direct folder ownership
          const directOwner = await prisma.folder.findFirst({
            where: {
              id: resourceId,
              ownerId: userId,
            },
          });

          if (directOwner) return true;

          // Second check: Cascade up - check project ownership
          const folder = await prisma.folder.findFirst({
            where: { id: resourceId },
            select: { projectId: true },
          });

          if (!folder?.projectId) return false;

          return await checkUserHasRoleForAction(
            "project",
            "owner",
            userId,
            folder.projectId
          );
        },
      },
      {
        name: "sharer",
        actions: ["read", "share"],
        condition: async (userId: string, resourceId: string) => {
          // First check: Direct folder ownership
          const directOwner = await prisma.folder.findFirst({
            where: {
              id: resourceId,
              ownerId: userId,
            },
          });

          if (directOwner) return true;

          // Second check: Cascade up - check project ownership
          const folder = await prisma.folder.findFirst({
            where: { id: resourceId },
            select: { projectId: true },
          });

          if (!folder?.projectId) return false;

          return await checkUserHasRoleForAction(
            "project",
            "owner",
            userId,
            folder.projectId
          );
        },
      },
    ],
  },
};

export const examplePolicies: ResourcePolicies = {
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
