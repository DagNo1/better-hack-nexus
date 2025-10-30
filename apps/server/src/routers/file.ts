import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { publicProcedure, router } from "../lib/trpc";

export const fileRouter = router({
  getAll: publicProcedure.query(async () => {
    return await prisma.file.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
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

  getByFolder: publicProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.file.findMany({
        where: { folderId: input.folderId },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          folder: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "File name is required")
          .max(255, "File name too long"),
        content: z.string().default(""),
        folderId: z.string().min(1, "Folder ID is required"),
      })
    )
    .mutation(async ({ input }) => {
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

      // Check for duplicate file names within the same folder
      const existingFile = await prisma.file.findFirst({
        where: {
          name: input.name,
          folderId: input.folderId,
        },
      });

      if (existingFile) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A file with this name already exists in this folder",
        });
      }

      return await prisma.file.create({
        data: {
          name: input.name,
          content: input.content,
          folderId: input.folderId,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        content: z.string().optional(),
        folderId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, ...updateData } = input;

        // If changing folder, verify it exists
        if (updateData.folderId) {
          const folder = await prisma.folder.findUnique({
            where: { id: updateData.folderId },
          });

          if (!folder) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Folder not found",
            });
          }
        }

        return await prisma.file.update({
          where: { id },
          data: updateData,
        });
      } catch (error) {
        if (error instanceof TRPCError) throw error;
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
