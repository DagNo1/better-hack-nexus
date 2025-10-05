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
          // Direct ownership check
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          // Check if user has project owner role
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
          // Direct ownership check
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          // Check if user has project editor role
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
          // Direct ownership check
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          // Check if user has project viewer role
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
          // Direct ownership check
          const folder = await prisma.folder.findFirst({
            select: { projectId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (folder?.ownerId === userId) return true;

          // Check if user has project owner role (sharing is usually owner-only)
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
          // Direct ownership check
          const file = await prisma.file.findFirst({
            select: { folderId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (file?.ownerId === userId) return true;

          // Check if user has folder owner role
          if (file?.folderId) {
            return await checkUserHasResourceRole(
              "folder",
              "owner",
              userId,
              file.folderId
            );
          }

          return false;
        },
      },
      {
        name: "editor",
        actions: ["read", "edit"],
        condition: async (userId: string, resourceId: string) => {
          // Direct ownership check
          const file = await prisma.file.findFirst({
            select: { folderId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (file?.ownerId === userId) return true;

          // Check if user has folder editor role
          if (file?.folderId) {
            return await checkUserHasResourceRole(
              "folder",
              "editor",
              userId,
              file.folderId
            );
          }

          return false;
        },
      },
      {
        name: "viewer",
        actions: ["read"],
        condition: async (userId: string, resourceId: string) => {
          // Direct ownership check
          const file = await prisma.file.findFirst({
            select: { folderId: true, ownerId: true },
            where: {
              id: resourceId,
            },
          });

          if (file?.ownerId === userId) return true;

          // Check if user has folder viewer role
          if (file?.folderId) {
            return await checkUserHasResourceRole(
              "folder",
              "viewer",
              userId,
              file.folderId
            );
          }

          return false;
        },
      },
    ],
  },
};
