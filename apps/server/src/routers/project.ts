import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const projectRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.project.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        folders: {
          include: {
            children: true,
          },
        },
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return await prisma.project.findUnique({
          where: { id: input.id },
          include: {
            folders: {
              include: {
                children: {
                  include: {
                    children: true,
                  },
                },
              },
            },
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const ownerId = ctx.session?.user?.id;
      if (!ownerId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not signed in" });
      }

      const project = await prisma.project.create({
        data: {
          name: input.name,
          ownerId,
        },
      });

      // Auto-assign creator as owner in membership table
      await prisma.projectMember.upsert({
        where: {
          projectId_userId: { projectId: project.id, userId: ownerId },
        },
        update: { role: "owner" },
        create: {
          projectId: project.id,
          userId: ownerId,
          role: "owner",
        },
      });

      return project;
    }),

  update: publicProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.project.update({
          where: { id: input.id },
          data: { name: input.name },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.project.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
    }),

  getFolders: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.folder.findMany({
        where: { projectId: input.projectId },
        include: {
          children: {
            include: {
              children: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });
    }),

  createFolder: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        projectId: z.string(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await prisma.folder.create({
        data: {
          name: input.name,
          projectId: input.projectId,
          parentId: input.parentId,
        },
      });
    }),

  updateFolder: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      try {
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

  deleteFolder: publicProcedure
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

  // User management endpoints for projects
  addUser: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.string().default("viewer"),
      })
    )
    .mutation(async ({ input }) => {
      try {
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
        await prisma.projectMember.upsert({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId: input.userId,
            },
          },
          update: { role: input.role },
          create: {
            projectId: input.projectId,
            userId: input.userId,
            role: input.role,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add user to project",
        });
      }
    }),

  removeUser: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await prisma.projectMember.delete({
          where: {
            projectId_userId: {
              projectId: input.projectId,
              userId: input.userId,
            },
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove user from project",
        });
      }
    }),

  getUsers: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const project = await prisma.project.findUnique({
        where: { id: input.projectId },
      });
      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      const members = await prisma.projectMember.findMany({
        where: { projectId: input.projectId },
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
