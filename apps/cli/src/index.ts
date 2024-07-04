import { Procedure, findAppRouter } from './utils/trpc';
import { Config } from './config';
import { slimZod } from './utils/zod';
import { AnyZodObject, ZodType, z } from 'zod';
import consola from 'consola';

export async function startStudio(args: Config) {
  const { routerPath } = args;
  // Find the app router in the file
  const appRouter = await findAppRouter(routerPath);
  const procedureInfos: Map<string, ReturnType<typeof extractInfo>> = new Map();
  for (const path in appRouter._def.procedures) {
    const procedure = appRouter._def.procedures[path];
    procedureInfos.set(path, extractInfo(path, procedure));
  }
  consola.info(`Found ${procedureInfos.size} procedures`);

  // TODO: Start Hono Server
}

function extractInfo(path: string, procedure: Procedure) {
  // Extract zod schemas from procedure
  // Extract the schema info from Zod and make it serializable

  // Process input schemas
  const inputInfo =
    procedure._def.inputs.length === 0
      ? slimZod(z.never())
      : typeof procedure._def.inputs[0] === 'function'
      ? slimZod(z.unknown())
      : procedure._def.inputs.length === 1
      ? slimZod(procedure._def.inputs[0])
      : slimZod(
          (procedure._def.inputs as AnyZodObject[]).reduce((acc, schema) =>
            schema.merge(acc)
          )
        );

  const outputInfo =
    procedure._def.output && procedure._def.output instanceof ZodType
      ? slimZod(procedure._def.output)
      : slimZod(z.unknown());

  return {
    path,
    type: procedure._def.type,
    meta: procedure._def.meta,
    inputInfo,
    outputInfo,
  };
}

// const app = new Hono();

// app.get('/', c => {
//   return c.text('Hello Hono!');
// });

// const port = 3000;
// console.log(`Server is running on port ${port}`);

// serve({
//   fetch: app.fetch,
//   port,
// });
