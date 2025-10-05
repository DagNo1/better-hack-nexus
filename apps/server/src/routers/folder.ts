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

  create: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Folder name is required")
          .max(100, "Folder name too long"),
        projectId: z.string().min(1, "Project ID is required"),
      })
    )
    .mutation(async ({ input }) => {
      // Check if project exists
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check for duplicate folder names within the same project
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name: input.name,
          projectId: input.projectId,
        },
      });

      if (existingFolder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A folder with this name already exists in this project",
        });
      }

      return await prisma.folder.create({
        data: {
          name: input.name,
          projectId: input.projectId,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const data: { name: string; projectId?: string } = {
          name: input.name,
        };

        if (input.projectId !== undefined) {
          data.projectId = input.projectId;
        }

        return await prisma.folder.update({
          where: { id: input.id },
          data,
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

  // User management endpoints
  addUser: publicProcedure
    .input(
      z.object({
        folderId: z.string(),
        userId: z.string(),
        role: z.string().default("viewer"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Check if folder exists
        const folder = await prisma.folder.findUnique({
          where: { id: input.folderId },
        });

        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          });
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
          where: { id: input.userId },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Upsert membership with role
        await prisma.folderMember.upsert({
          where: {
            folderId_userId: { folderId: input.folderId, userId: input.userId },
          },
          update: { role: input.role },
          create: {
            folderId: input.folderId,
            userId: input.userId,
            role: input.role,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add user to folder",
        });
      }
    }),

  removeUser: publicProcedure
    .input(
      z.object({
        folderId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await prisma.folderMember.delete({
          where: {
            folderId_userId: { folderId: input.folderId, userId: input.userId },
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove user from folder",
        });
      }
    }),

  getUsers: publicProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      const folder = await prisma.folder.findUnique({
        where: { id: input.folderId },
      });
      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      const members = await prisma.folderMember.findMany({
        where: { folderId: input.folderId },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      });

      return members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        image: m.user.image,
        role: m.role,
      }));
    }),
});
