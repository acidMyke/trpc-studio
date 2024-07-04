import { extractInfo, findAppRouter } from './utils/trpc';
import { Config } from './config';
import consola from 'consola';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

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

  //Start Hono Server

  const hono = new Hono();

  const apiPath = hono.basePath('/api');

  apiPath.get('/procedures', c => {
    return c.json(Array.from(procedureInfos.keys()));
  });

  apiPath.get('/procedures/:procedure', c => {
    return c.json(procedureInfos.get(c.req.param('procedure')));
  });

  serve(
    {
      fetch: hono.fetch,
      port: 2348,
    },
    info => {
      consola.info(`tRPC Studio serving on http://localhost:${info.port}`);
    }
  );
}
