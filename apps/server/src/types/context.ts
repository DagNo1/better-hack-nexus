import type { User } from "better-auth";
import type { Context } from "elysia";

export type ContextStore = {
  user: User;
};

export type ContextWithAuth = Context & { store: ContextStore };
