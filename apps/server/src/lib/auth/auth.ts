import prisma from "@/db";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ZanzibarServerPlugin, setResources } from "../plugins/zanzibar";
import { policies } from "./policies";
import { resources } from "./resources";

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
  plugins: [ZanzibarServerPlugin(policies, resources)],
});
