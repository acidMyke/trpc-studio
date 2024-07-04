import { extractInfo, findAppRouter } from './utils/trpc';
import { Config } from './config';
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

  //TODO: Start Hono Server
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
