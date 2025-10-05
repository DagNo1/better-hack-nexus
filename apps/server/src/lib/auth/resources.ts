import prisma from "@/db";
import type { Resources } from "../plugins/zanzibar";
import { checkUserHasResourceRole } from "../plugins/zanzibar";

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
          // Check if user has project owner role for the folder's project
          const folder = await prisma.folder.findFirst({
            select: { projectId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.projectId) {
            return await checkUserHasResourceRole(
              "project",
              "owner",
              userId,
              folder.projectId
            );
          }

          return false;
        },
      },
      {
        name: "editor",
        actions: ["read", "edit"],
        condition: async (userId: string, resourceId: string) => {
          // Check if user has project editor role for the folder's project
          const folder = await prisma.folder.findFirst({
            select: { projectId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.projectId) {
            return await checkUserHasResourceRole(
              "project",
              "editor",
              userId,
              folder.projectId
            );
          }

          return false;
        },
      },
      {
        name: "viewer",
        actions: ["read"],
        condition: async (userId: string, resourceId: string) => {
          // Check if user has project viewer role for the folder's project
          const folder = await prisma.folder.findFirst({
            select: { projectId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.projectId) {
            return await checkUserHasResourceRole(
              "project",
              "viewer",
              userId,
              folder.projectId
            );
          }

          return false;
        },
      },
      {
        name: "sharer",
        actions: ["read", "share"],
        condition: async (userId: string, resourceId: string) => {
          // Check if user has project owner role for the folder's project (sharing is usually owner-only)
          const folder = await prisma.folder.findFirst({
            select: { projectId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.projectId) {
            return await checkUserHasResourceRole(
              "project",
              "owner",
              userId,
              folder.projectId
            );
          }

          return false;
        },
      },
    ],
  },
};
