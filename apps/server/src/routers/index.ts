import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { fileRouter } from "./file";
import { folderRouter } from "./folder";
import { projectRouter } from "./project";
import { todoRouter } from "./todo";
import { userRouter } from "./user";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  todo: todoRouter,
  project: projectRouter,
  folder: folderRouter,
  file: fileRouter,
  user: userRouter,
});
export type AppRouter = typeof appRouter;
