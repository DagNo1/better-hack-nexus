import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const userRouter = router({
	getAll: protectedProcedure.query(async () => {
		return await prisma.user.findMany({
			select: {
				id: true,
				name: true,
				email: true,
				emailVerified: true,
				image: true,
				createdAt: true,
				updatedAt: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
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

	create: publicProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				email: z.string().email("Invalid email address"),
				emailVerified: z.boolean().optional(),
				image: z.string().optional(),
			})
		)
		.mutation(async ({ input }) => {
			try {
				return await prisma.user.create({
					data: {
						name: input.name,
						email: input.email,
						emailVerified: input.emailVerified || false,
						image: input.image,
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
			} catch (error: any) {
				if (error.code === "P2002") {
					throw new TRPCError({
						code: "CONFLICT",
						message: "User with this email already exists",
					});
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create user",
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
