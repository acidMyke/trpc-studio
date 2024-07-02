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
  mut: publicProcedure
    .input(z.object({ age: z.number() }))
    .mutation(async ({ input }) => `You are ${input.age}`),
  nested: createTRPCRouter({
    q: publicProcedure.query(async () => 'nested query'),
    qTwo: publicProcedure.query(async () => 'nested query two'),
  }),
  meta: publicProcedure
    .meta({ trpcStudio: { info: 'hello trpcStudio' } })
    .query(async () => 'its meta not Meta'),
  withOutput: publicProcedure
    .output(z.object({ theOutputSchema: z.string() }))
    .query(async () => ({ theOutputSchema: 'is defined' })),
  customValidation: publicProcedure
    .input(i => typeof i === 'string' && i.length > 3)
    .query(async ({ input }) => `Hello ${input}`),
  combinedInputs: publicProcedure
    .input(z.object({ a: z.number() }))
    .input(z.object({ b: z.number() }))
    .query(async ({ input }) => input.a + input.b),
});

export type AppRouter = typeof appRouter;
export default appRouter;
