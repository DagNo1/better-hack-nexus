import { type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
import logger from "../logger";

export const NexusPlugin = () => {
  const pluginId = "nexus-plugin";

  return {
    id: pluginId,

    // optional: you could define schema extensions if needed
    schema: {
      // e.g. extend user model
      user: {
        fields: {
          // example: customField: { type: "string", required: false, unique: false, references: null }
        },
      },
    },

    // endpoints: custom endpoints offered by the plugin
    endpoints: {
      // a health check / test endpoint to verify plugin is "connected"
      ping: createAuthEndpoint(
        "/nexus/ping",
        { method: "GET" },
        async (ctx) => {
          logger.info("NexusPlugin ping endpoint hit");
          return ctx.json({ status: "ok", plugin: pluginId });
        }
      ),
    },

    // hooks: before / after actions
    hooks: {
      before: [
        {
          matcher: (ctx) => {
            // for demonstration, every request under /auth maybe
            return ctx.path.startsWith("/");
          },
          handler: createAuthMiddleware(async (ctx) => {
            logger.info(`[NexusPlugin] working on path: ${ctx.path}`);
            return { context: ctx };
          }),
        },
      ],
    },
  } satisfies BetterAuthPlugin;
};
