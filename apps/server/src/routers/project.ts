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
				folders: {
					include: {
						children: true
					}
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
										children: true
									}
								}
							}
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

	create: publicProcedure
		.input(z.object({ name: z.string().min(1) }))
		.mutation(async ({ input }) => {
			return await prisma.project.create({
				data: {
					name: input.name,
				},
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

	getFolders: publicProcedure
		.input(z.object({ projectId: z.string() }))
		.query(async ({ input }) => {
			return await prisma.folder.findMany({
				where: { projectId: input.projectId },
				include: {
					children: {
						include: {
							children: true
						}
					}
				},
				orderBy: {
					createdAt: "asc",
				},
			});
		}),

	createFolder: publicProcedure
		.input(z.object({
			name: z.string().min(1),
			projectId: z.string(),
			parentId: z.string().optional()
		}))
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
		.input(z.object({
			id: z.string(),
			name: z.string().min(1).optional(),
			parentId: z.string().optional()
		}))
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
});
