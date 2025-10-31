import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { hasPermission } from "better-auth-zanzibar-plugin";

export const t = initTRPC.context<Context>().create();
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Protected procedure - authentication + optional permissions
 * @example protectedProcedure() // auth only
 * @example protectedProcedure({ resource: "folder", action: "read" }) // + permission
 * @example protectedProcedure({ resource: "project", action: "edit", field: "projectId" }) // custom field
 */
export const protectedProcedure = (
  options?:
    | {
        resource: string;
        action: string;
        field?: string;
      }
    | ((args: { ctx: Context; input: any }) => {
        resource: string;
        action: string;
        field?: string;
      })
) => {
  return t.procedure.use(async ({ ctx, input, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    if (!options) {
      return next({
        ctx: {
          ...ctx,
          session: ctx.session,
          user: ctx.session.user,
        },
      });
    }

    const opts =
      typeof options === "function" ? options({ ctx, input }) : options;
    const field = opts.field || "id";
    const resourceId = getNestedValue(input, field);

    if (!resourceId) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Resource ID is required at field: ${field}`,
      });
    }

    const allowed = await hasPermission(
      ctx.session.user.id,
      opts.action as any,
      opts.resource as any,
      resourceId
    );

    if (!allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have permission to ${opts.action} this ${opts.resource}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
        user: ctx.session.user,
        resourceId,
      },
    });
  });
};
