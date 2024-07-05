import { createClient, extractInfo, findAppRouter } from './utils/trpc';
import { Config } from './config';
import consola from 'consola';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { z } from 'zod';
import { TRPCClientError } from '@trpc/client';
import json5 from 'json5';
import { StatusCode } from 'hono/utils/http-status';

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
  // tRPC Client to communicate with the server
  const trpc = createClient({ url: args.trpcEndpoint });

  //Start Hono Server
  const hono = new Hono();

  const apiPath = hono.basePath('/api');

  apiPath.get('/procedures', c => {
    // Return the list of procedures and their types
    return c.json(
      Object.fromEntries(
        (function* () {
          for (const [path, info] of procedureInfos.entries()) {
            yield [path, info.type];
          }
        })()
      )
    );
  });

  apiPath.get('/procedures/:path', c => {
    return c.json(procedureInfos.get(c.req.param('path')));
  });

  const executeSchema = z.object({
    data: z.unknown(),
    method: z.enum(['query', 'mutation'], {
      message: 'Invalid method: only query or mutation allowed',
    }),
  });

  apiPath.post('/procedures/:path/execute', async c => {
    const path = c.req.param('path');
    try {
      const body = json5.parse(await c.req.text());
      const input = executeSchema.parse(body);
      const start = Date.now();
      const res = await trpc[input.method](path, input.data)
        .then(res => ({ success: true as const, data: res }))
        .catch(err => ({ success: false as const, error: err }));
      const end = Date.now();
      let status: StatusCode = res.success ? 200 : 502; // Reserve 500 for users API server errors
      if (!res.success) {
        if (res.error instanceof TRPCClientError) {
          if ('data' in res.error && typeof res.error.data === 'object') {
            status = (res.error.data.httpStatus ?? status) as StatusCode;
            res.error = {
              message:
                res.error.message ??
                (res.error.meta?.responseJSON as any)?.error?.message ??
                'Unknown error',
              ...res.error.data,
            };
          }
        }
      }
      return c.json(
        {
          response: res,
          timeTaken: end - start,
        },
        status
      );
    } catch (err) {
      if (err instanceof SyntaxError) {
        // JSON.parse error
        return c.json(
          { error: 'Invalid JSON', name: err.name, message: err.message },
          400
        );
      } else if (err instanceof z.ZodError) {
        // Zod error
        return c.json({ error: err.errors }, 400);
      } else {
        // Unknown error
        throw err;
      }
    }
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
