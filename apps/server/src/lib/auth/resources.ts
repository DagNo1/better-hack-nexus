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
  file: {
    actions: ["delete", "read", "edit", "share"],
    roles: [
      {
        name: "owner",
        actions: ["delete", "read", "edit", "share"],
        condition: async (userId: string, resourceId: string) => {
          // Inherit from the parent folder: folder owners fully control documents
          const doc = await (prisma as any).file.findFirst({
            select: { folderId: true },
            where: { id: resourceId },
          });

          if (doc?.folderId) {
            return await checkUserHasResourceRole(
              "folder",
              "owner",
              userId,
              doc.folderId
            );
          }

          return false;
        },
      },
      {
        name: "viewer",
        actions: ["read"],
        condition: async (userId: string, resourceId: string) => {
          // Inherit read from the parent folder's viewer
          const doc = await (prisma as any).file.findFirst({
            select: { folderId: true },
            where: { id: resourceId },
          });

          if (doc?.folderId) {
            return await checkUserHasResourceRole(
              "folder",
              "viewer",
              userId,
              doc.folderId
            );
          }

          return false;
        },
      },
      {
        name: "sharer",
        actions: ["read", "share"],
        condition: async (userId: string, resourceId: string) => {
          // Allow sharing if user is project owner of the parent folder's project
          const doc = await (prisma as any).file.findFirst({
            select: { folder: { select: { projectId: true } } },
            where: { id: resourceId },
          });

          const projectId = doc?.folder?.projectId ?? null;

          if (projectId) {
            return await checkUserHasResourceRole(
              "project",
              "owner",
              userId,
              projectId
            );
          }

          return false;
        },
      },
    ],
  },
};
