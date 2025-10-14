import type { BetterAuthClientPlugin } from "better-auth/client";
import type { ZanzibarPlugin } from "./server";

/**
 * Creates a Zanzibar client plugin for Better Auth that provides authorization checking capabilities.
 *
 * This plugin enables client-side permission checking by making HTTP requests to the server's
 * Zanzibar authorization endpoints. It integrates with the Better Auth client to provide
 * seamless access control functionality.
 *
 * @example
 * ```typescript
 * import { ZanzibarClientPlugin } from './zanzibar/client';
 *
 * const client = betterAuthClient({
 *   plugins: [ZanzibarClientPlugin],
 *   // ... other client configuration
 * });
 *
 * // Use the plugin actions
 * const auth = client.useZanzibarPlugin();
 *
 * // Check if user can read a document
 * const canRead = await auth.check(userId, 'read', 'documents', documentId);
 *
 * // Check if user has editor role for a project
 * const isEditor = await auth.checkRole('projects', 'editor', userId, projectId);
 * ```
 *
 * @param client - The Better Auth client instance to extend with Zanzibar functionality
 * @returns A client plugin object that satisfies BetterAuthClientPlugin interface
 */
export const ZanzibarClientPlugin = (client: any) => {
  return {
    id: "zanzibar-plugin",
    $InferServerPlugin: {} as ReturnType<typeof ZanzibarPlugin>,
  } satisfies BetterAuthClientPlugin;
};

/**
 * Empty export to ensure this file is treated as a module.
 * This is necessary for proper TypeScript module resolution.
 */
export {};
