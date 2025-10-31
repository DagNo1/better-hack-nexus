import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import { ac, acRoles } from "./auth/rebac";
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

    console.log("Derived: \n", resource, "\n", action, "\n", resourceId);
    // Call better-auth Zanzibar endpoint; user is taken from session

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
          resourceId: (resourceId ?? "") as string,
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
    const has = await acRoles.hasRole(
      resource as any,
      role as any,
      ctx.session.user.id,
      resourceId as any
    );
    if (!has) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Required role missing",
      });
    }
    return next();
  });
