import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { publicProcedure, router } from "../lib/trpc";

export const folderRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.folder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: true,
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return await prisma.folder.findUnique({
          where: { id: input.id },
          include: {
            project: true,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }
    }),

  getByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.folder.findMany({
        where: { projectId: input.projectId },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          project: true,
        },
      });
    }),

  getByParent: publicProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.folder.findMany({
        where: { parentId: input.parentId },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          project: true,
        },
      });
    }),

  getPath: publicProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      const path: Array<{
        id: string;
        name: string;
        type: "folder" | "project";
      }> = [];
      let currentFolderId: string | null = input.folderId;
      let projectId: string | null = null;

      // Traverse up the folder tree
      while (currentFolderId) {
        const folder: {
          id: string;
          name: string;
          parentId: string | null;
          projectId: string | null;
        } | null = await prisma.folder.findUnique({
          where: { id: currentFolderId },
          select: { id: true, name: true, parentId: true, projectId: true },
        });

        if (!folder) break;

        path.unshift({ id: folder.id, name: folder.name, type: "folder" });

        // Store projectId if found
        if (folder.projectId) {
          projectId = folder.projectId;
        }

        currentFolderId = folder.parentId;
      }

      // Add project at the beginning if found
      if (projectId) {
        const project = await prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, name: true },
        });

        if (project) {
          path.unshift({ id: project.id, name: project.name, type: "project" });
        }
      }

      return path;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Folder name is required")
          .max(100, "Folder name too long"),
        projectId: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if project exists if projectId is provided
      if (input.projectId) {
        const project = await prisma.project.findUnique({
          where: { id: input.projectId },
        });

        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
      }

      // Check if parent exists if parentId is provided
      if (input.parentId) {
        const parent = await prisma.folder.findUnique({
          where: { id: input.parentId },
        });

        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent folder not found",
          });
        }
      }

      // Check for duplicate folder names within the same project or parent
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name: input.name,
          projectId: input.projectId,
          parentId: input.parentId,
        },
      });

      if (existingFolder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A folder with this name already exists in this location",
        });
      }

      return await prisma.folder.create({
        data: {
          name: input.name,
          projectId: input.projectId,
          parentId: input.parentId,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        projectId: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        return await prisma.folder.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.folder.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }
    }),
});
