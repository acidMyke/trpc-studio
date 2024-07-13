import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';

const t = initTRPC.create({ transformer: superjson });

const publicProcedure = t.procedure;
const createTRPCRouter = t.router;

export const fullnameSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
});
export const arrayOfFullnameSchema = z.array(fullnameSchema);
export const nestedFullNameSchema = z.object({
  layerOne: z.object({ layerTwo: fullnameSchema }),
});
export const unionSchema = z.union([z.string(), fullnameSchema]);
export const joinedSchema = fullnameSchema.and(z.object({ age: z.number() }));

const appRouter = createTRPCRouter({
  ping: publicProcedure.query(async () => 'pong'),
  hello: publicProcedure
    .input(z.string())
    .query(async ({ input }) => `Hello ${input}`),
  greet: publicProcedure
    .input(fullnameSchema)
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
