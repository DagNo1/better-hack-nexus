import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { auth } from "../lib/auth/auth";
import {
  protectedProcedure,
  publicProcedure,
  router,
  withPermission,
} from "../lib/trpc";

export const userRouter = router({
  getAll: protectedProcedure.query(async () => {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        role: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .use(
      withPermission(({ input }) => ({
        resource: "user",
        action: "read",
        resourceId: input.id,
      }))
    )
    .query(async ({ input }) => {
      try {
        return await prisma.user.findUnique({
          where: { id: input.id },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                sessions: true,
                accounts: true,
              },
            },
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
    }),

  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: input.email },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return user;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to find user",
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        emailVerified: z.boolean().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Use better-auth API to create user with password
        const user = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
        });

        // Update additional fields if provided
        if (input.image || input.emailVerified !== undefined) {
          return await prisma.user.update({
            where: { id: user.user.id },
            data: {
              image: input.image,
              emailVerified: input.emailVerified ?? false,
            },
            select: {
              id: true,
              name: true,
              email: true,
              emailVerified: true,
              image: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        }

        // Fetch the updated user to get all fields
        const createdUser = await prisma.user.findUnique({
          where: { id: user.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        return createdUser!;
      } catch (error: any) {
        if (
          error.code === "P2002" ||
          error.message?.includes("already exists")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "Failed to create user",
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required").optional(),
        email: z.string().email("Invalid email address").optional(),
        emailVerified: z.boolean().optional(),
        image: z.string().optional(),
      })
    )
    .use(
      withPermission(({ input }) => ({
        resource: "user",
        action: "edit",
        resourceId: input.id,
      }))
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      try {
        return await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            emailVerified: true,
            image: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      } catch (error: any) {
        if (error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        if (error.code === "P2002") {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User with this email already exists",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user",
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .use(
      withPermission(({ input }) => ({
        resource: "user",
        action: "delete",
        resourceId: input.id,
      }))
    )
    .mutation(async ({ input }) => {
      try {
        return await prisma.user.delete({
          where: { id: input.id },
          select: {
            id: true,
            name: true,
            email: true,
          },
        });
      } catch (error: any) {
        if (error.code === "P2025") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }
    }),
});
