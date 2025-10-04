import { TRPCError } from "@trpc/server";
import z from "zod";
import prisma from "../db";
import { publicProcedure, router } from "../lib/trpc";

export const projectRouter = router({
	getAll: publicProcedure.query(async () => {
		return await prisma.project.findMany({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				files: true,
				folders: true,
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
						files: true,
						folders: true,
					},
				});
			} catch (error) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Project not found",
				});
			}
		}),

	create: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input }) => {
			return await prisma.project.create({
				data: {
					name: input.name,
				} as any,
			});
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
});
