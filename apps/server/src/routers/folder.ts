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
				project: true
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
		.input(z.object({ name: z.string().min(1), projectId: z.string().optional() }))
		.mutation(async ({ input }) => {
			const data: { name: string; projectId?: string } = {
				name: input.name,
			};

			if (input.projectId) {
				data.projectId = input.projectId;
			}

			
			return await prisma.folder.create({
				data,
			});
		}),

	update: publicProcedure
		.input(z.object({ id: z.string(), name: z.string().min(1), projectId: z.string().optional() }))
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
});
