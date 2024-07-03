import { register } from 'esbuild-register';
import type { Router as trpcRouter } from '@trpc/server';
import { z } from 'zod';

export const configSchema = z.object({
  path: z.string(),
});

export type Config = z.infer<typeof configSchema>;

export async function main(config: Config) {
  console.log(`Building ${config.path}`);
  // Make sure to register esbuild so that we can import ts files on the fly
  let unregister: () => void = () => {};
  try {
    const result = register({ format: 'esm', loader: 'ts' });
    unregister = result.unregister;
  } catch (error) {
    console.error('Error while registering esbuild:', error);
    throw error;
  }

  // Scan all the exports of the files
  const app = await import(config.path);
  const routers: Map<string, trpcRouter<any>> = new Map();
  // Check default export first
  for (const key in app) {
    console.log('Detected export:', key);
    // Check if the export is tRPC Router
    if (isTRPCRouter(app[key])) {
      routers.set(key, app[key]);
    }
  }

  // Unregister esbuild
  unregister();
  console.log(
    `Found ${routers.size} routers in ${config.path}: ${Array.from(
      routers.keys()
    )}`
  );

  if (routers.size === 0) {
    throw new Error(`No routers found in ${config.path}`);
  }

  // Default to the first router
  let appRouter: trpcRouter<any> = routers.values().next().value;

  if (routers.size > 1) {
    // If there are multiple routers exported, find the one with the most procedures
    let maxProcedures = Object.keys(appRouter._def.procedures).length;
    for (const [name, router] of routers) {
      const numberOfProcedures = Object.keys(router._def.procedures).length;
      if (numberOfProcedures > maxProcedures) {
        maxProcedures = numberOfProcedures;
        appRouter = router;
      }
    }
  }

  console.log(
    `Router has ${Object.keys(appRouter._def.procedures).length} procedures`
  );
}

function isTRPCRouter(router: any): router is trpcRouter<any> {
  // router is a TRPC Router if it has a _def property, and _def has a router property set to true
  if (typeof router !== 'object') {
    return false;
  }
  if (!('_def' in router)) {
    return false;
  }
  if (typeof router._def !== 'object') {
    return false;
  }
  if (!('router' in router._def)) {
    return false;
  }
  if (router._def.router !== true) {
    return false;
  }
  return true;
}
