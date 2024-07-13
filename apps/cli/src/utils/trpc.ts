import { register } from 'esbuild-register/dist/node.js';
import type {
  Router,
  AnyRootTypes,
  ProcedureType,
  RouterRecord,
} from '@trpc/server/unstable-core-do-not-import';
import { defaultTransformer } from '@trpc/server/unstable-core-do-not-import';
import consola from 'consola';
import { AnyZodObject, ZodFirstPartySchemaTypes, ZodType, z } from 'zod';
import { slimZod } from './zod';
import {
  createTRPCUntypedClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  Operation,
  splitLink,
} from '@trpc/client';

// The types below are inspected from the tRPC Router and Procedure objects
// They are not directly imported from tRPC because its somewhat different
export interface Procedure {
  _def: {
    meta: undefined | Record<string, any>;
    inputs: never[] | [Function] | ZodFirstPartySchemaTypes[];
    output?: undefined | Function | ZodFirstPartySchemaTypes;
    type: ProcedureType;
  };
  (opts: any): Promise<any>;
}

type ProcedureRecord = Record<string, Procedure> & RouterRecord;
// Add RouterRecord here so that typescript doesn't complain

type AppRouter = Router<AnyRootTypes, ProcedureRecord>;

export async function findAppRouter(routerAbsPath: string): Promise<AppRouter> {
  consola.verbose('Registering esbuild');
  // Make sure to register esbuild so that we can import ts files on the fly
  let unregister: () => void = () => {};
  try {
    const result = register({ format: 'cjs', loader: 'ts' });
    unregister = result.unregister;
  } catch (error) {
    console.error('Error while registering esbuild:', error);
    throw error;
  }

  consola.verbose(`Importing ${routerAbsPath}`);
  // Scan all the exports of the files, for unknown reason es6 import doesn't work so have to use require T-T
  const app = require(routerAbsPath);
  const routers: Map<string, AppRouter> = new Map();
  // Check default export first
  for (const key in app) {
    consola.verbose('Detected export:', key);
    // Check if the export is tRPC Router
    if (isTRPCRouter(app[key])) {
      routers.set(key, app[key]);
    }
  }

  // Unregister esbuild
  unregister();
  consola.verbose(
    `Found ${routers.size} routers in ${routerAbsPath}: ${Array.from(
      routers.keys()
    )}`
  );

  if (routers.size === 0) {
    throw new Error(`No routers found in ${routerAbsPath}`);
  }

  // Default to the first router
  let appRouter: AppRouter = routers.values().next().value;

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

  consola.info(
    `Router has ${Object.keys(appRouter._def.procedures).length} procedures`
  );

  return appRouter;
}

export function extractInfo(path: string, procedure: Procedure) {
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

function isTRPCRouter(router: any): router is AppRouter {
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

interface createClientOptions {
  url: string;
  useBatching?: boolean;
  methodOverride?: boolean;
  appRouter: AppRouter;
}

export function createClient(opts: createClientOptions) {
  const { url, appRouter, useBatching, methodOverride } = opts;
  const linkOpts:
    | Parameters<typeof httpBatchLink>[0]
    | Parameters<typeof httpLink>[0] = {
    url,
    headers: ({ op }: { op: Operation }) => {
      const { context } = op;
      if (
        'studio-forward-header' in context &&
        typeof context['studio-forward-header'] === 'object'
      ) {
        return context['studio-forward-header'] as Record<string, string>;
      }
      return {} as Record<string, string>;
    },
  };

  // Steal the transformer from the appRouter so that we can use it in the client
  // @ts-ignore - trpc is too tight, i hope it works :]
  linkOpts.transformer = appRouter._def._config.transformer;

  if (methodOverride) {
    linkOpts.methodOverride = 'POST';
  }

  return createTRPCUntypedClient({
    links: [
      loggerLink({ console: consola }),
      splitLink({
        condition: () => !!useBatching,
        // @ts-ignore - trpc is too tight, i hope it works :]
        false: httpLink(linkOpts),
        // @ts-ignore - trpc is too tight, i hope it works :]
        true: httpBatchLink(linkOpts),
      }),
    ],
  });
}

export function isDefaultTransformer(appRouter: AppRouter): boolean {
  return appRouter._def._config.transformer === defaultTransformer;
}
