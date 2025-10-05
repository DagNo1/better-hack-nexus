import type { ResourcePolicies, Resources } from "../plugins/zanzibar";
import {
  checkUserHasRoleForAction,
  checkUserHasRole,
} from "../plugins/zanzibar";
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
      {
        name: "editor",
        actions: ["read", "edit"],
        condition: async (userId: string, resourceId: string) => {
          const project = await prisma.project.findFirst({
            where: { id: resourceId, ownerId: userId },
          });
          return !!project;
        },
      },
      {
        name: "viewer",
        actions: ["read"],
        condition: async (userId: string, resourceId: string) => {
          const project = await prisma.project.findFirst({
            where: { id: resourceId, ownerId: userId },
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
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          if (!folder?.projectId) return false;

          return await checkUserHasRole(
            "project",
            "owner",
            userId,
            folder.projectId
          );
        },
      },
      {
        name: "editor",
        actions: ["read", "edit"],
        condition: async (userId: string, resourceId: string) => {
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          if (!folder?.projectId) return false;

          return await checkUserHasRole(
            "project",
            "editor",
            userId,
            folder.projectId
          );
        },
      },
      {
        name: "viewer",
        actions: ["read"],
        condition: async (userId: string, resourceId: string) => {
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          if (!folder?.projectId) return false;

          return await checkUserHasRole(
            "project",
            "viewer",
            userId,
            folder.projectId
          );
        },
      },
      {
        name: "sharer",
        actions: ["read", "share"],
        condition: async (userId: string, resourceId: string) => {
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          if (!folder?.projectId) return false;

          return await checkUserHasRole(
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
