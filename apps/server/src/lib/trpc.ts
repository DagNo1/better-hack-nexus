import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { auth } from "./auth/auth";

export const t = initTRPC.context<Context>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      cause: "No session",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});

export const withPermission = (
  derive: (opts: { input: any; ctx: Context }) => {
    resource: "project" | "folder" | "file" | "user";
    action: string;
    resourceId?: string;
  }
) =>
  t.middleware(async ({ ctx, input, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }
    const { resource, action, resourceId } = derive({ input, ctx });

    const response: {
      allowed: boolean;
      message: string;
    } =
      // @ts-ignore - endpoint provided by Zanzibar plugin
      await auth.api.hasPermission({
        headers: ctx.headers,
        body: {
          action: action as string,
          resourceType: resource as string,
          resourceId: resourceId,
        },
      });

    if (!response.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions: " + response.message,
      });
    }
    return next();
  });

export const withRole = (
  derive: (opts: { input: any; ctx: Context }) => {
    resource: "project" | "folder" | "file" | "user";
    role: string;
    resourceId?: string;
  }
) =>
  t.middleware(async ({ ctx, input, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }
    const { resource, role, resourceId } = derive({ input, ctx });
    const response: { allowed: boolean; message: string } =
      // @ts-ignore - endpoint provided by Zanzibar plugin
      await auth.api.hasRole({
        headers: ctx.headers,
        body: {
          role: role as string,
          resourceType: resource as string,
          resourceId: resourceId,
        },
      });

    if (!response.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient role: " + response.message,
      });
    }
    return next();
  });
