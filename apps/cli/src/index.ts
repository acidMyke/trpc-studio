import { Procedure, findAppRouter } from './utils/trpc';
import { Config } from './config';

export async function startStudio(args: Config) {
  const { routerPath } = args;
  // Find the app router in the file
  const appRouter = await findAppRouter(routerPath);
  const procedureInfos: Map<string, ReturnType<typeof extractInfo>> = new Map();
  for (const path in appRouter._def.procedures) {
    const procedure = appRouter._def.procedures[path];
    procedureInfos.set(path, extractInfo(procedure));
  }

  console.log(procedureInfos);
  // TODO: Start Hono Server
}

function extractInfo(procedure: Procedure) {
  // TODO: Extract zod schemas from procedure
  // TODO: Extract the schema info from Zod and make it serializable
  console.log(procedure);
  return procedure;
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
