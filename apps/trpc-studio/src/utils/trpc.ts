import { register } from 'esbuild-register/dist/node.js';
import type {
  Router as trpcRouter,
  ProcedureRouterRecord,
  AnyProcedure,
} from '@trpc/server';
import { stat } from 'fs/promises';

export async function getAppRouter(routerAbsPath: string) {
  console.log('Registering esbuild');
  // Make sure to register esbuild so that we can import ts files on the fly
  let unregister: () => void = () => {};
  try {
    const result = register({ format: 'cjs', loader: 'ts' });
    unregister = result.unregister;
  } catch (error) {
    console.error('Error while registering esbuild:', error);
    throw error;
  }

  console.log(`Importing ${routerAbsPath}`);
  // Scan all the exports of the files, for unknown reason es6 import doesn't work so have to use require T-T
  const app = require(routerAbsPath);
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
    `Found ${routers.size} routers in ${routerAbsPath}: ${Array.from(
      routers.keys()
    )}`
  );

  if (routers.size === 0) {
    throw new Error(`No routers found in ${routerAbsPath}`);
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

  return appRouter;
}

export function getProcedureType(procedure: any) {
  // Check if the procedure is a TRPC Procedure
  if (!('_def' in procedure)) {
    return null;
  }
  if (typeof procedure._def !== 'object') {
    return null;
  }
  if ('query' in procedure._def && procedure._def.query === true) {
    return 'query';
  } else if ('mutation' in procedure._def && procedure._def.mutation === true) {
    return 'mutation';
  }
  // TODO: Add support for subscription
  else {
    return null;
  }
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
