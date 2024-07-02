import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

const publicProcedure = t.procedure;
const createTRPCRouter = t.router;

const appRouter = createTRPCRouter({
  ping: publicProcedure.query(async () => 'pong'),
  hello: publicProcedure
    .input(z.string())
    .query(async ({ input }) => `Hello ${input}`),
  greet: publicProcedure
    .input(z.object({ firstName: z.string(), lastName: z.string() }))
    .query(async ({ input }) => `Hello ${input.firstName} ${input.lastName}`),
});

export type AppRouter = typeof appRouter;
export default appRouter;