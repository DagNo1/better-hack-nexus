import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { publicProcedure, router } from "../lib/trpc";

export const fileRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.file.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: true,
        folder: true,
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return await prisma.file.findUnique({
          where: { id: input.id },
          include: {
            project: true,
            folder: true,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }
    }),

  getByProject: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.file.findMany({
        where: { projectId: input.projectId },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          folder: true,
        },
      });
    }),

  getByFolder: publicProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.file.findMany({
        where: { folderId: input.folderId },
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
        name: z.string().min(1),
        projectId: z.string().optional(),
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const data = {
        name: input.name,
      } as const;

      if (input.projectId) {
        (data as any).projectId = input.projectId;
      }

      if (input.folderId) {
        (data as any).folderId = input.folderId;
      }

      return await prisma.file.create({
        data: data as any,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        projectId: z.string().optional(),
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await prisma.file.update({
          where: { id: input.id },
          data: {
            name: input.name,
            projectId: input.projectId,
            folderId: input.folderId,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.file.delete({
          where: { id: input.id },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "File not found",
        });
      }
    }),
});
