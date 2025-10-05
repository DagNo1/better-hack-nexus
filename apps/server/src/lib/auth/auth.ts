import prisma from "@/db";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ZanzibarServerPlugin, setResources } from "../plugins/zanzibar";
import { examplePolicies, resources } from "./policies";

// Initialize resources in the check module
setResources(resources);

export const auth = betterAuth<BetterAuthOptions>({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  plugins: [ZanzibarServerPlugin(examplePolicies, resources)],
});
