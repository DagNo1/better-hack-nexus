import z from "zod";

export const IdSchema = z.object({
  id: z.string().min(1, "id is required"),
});

export const GetAllSchema = z.object({
  page: z.number().int().min(1).optional(),
  take: z.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  searchFields: z.array(z.string()).optional(),
  orderUsing: z.string().optional(),
  orderBy: z.enum(["asc", "desc"]).optional(),
  select: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
  count: z.array(z.string()).optional(),
});

export const GetByIdSchema = IdSchema.extend({
  select: z.array(z.string()).optional(),
  include: z.array(z.string()).optional(),
  count: z.array(z.string()).optional(),
});

export type GetAllInput = z.infer<typeof GetAllSchema>;
export type GetByIdInput = z.infer<typeof GetByIdSchema>;
export type IdInput = z.infer<typeof IdSchema>;
