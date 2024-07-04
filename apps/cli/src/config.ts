import consola from 'consola';
import { cosmiconfig, cosmiconfigSync } from 'cosmiconfig';
import json5 from 'json5';
import { z } from 'zod';
import { resolve as resolvePath } from 'path';
import { statSync } from 'fs';

export const usableConfigFileNames = [
  'json',
  'json5',
  'jsonc',
  'js',
  'ts',
  // 'mjs',
  'cjs',
].map(ext => `trpcStudio.config.${ext}`);

const explorer = cosmiconfigSync('trpcStudio', {
  searchPlaces: usableConfigFileNames,
  loaders: {
    '.json5': (_p, c) => json5.parse(c),
    '.jsonc': (_p, c) => json5.parse(c),
  },
});

export const configSchema = z.object({
  routerPath: z
    .string()
    .refine(
      path => ['.ts', '.js', '.mjs', '.cjs'].some(ext => path.endsWith(ext)),
      'Only .ts, .js, .mjs, .cjs files are supported'
    )
    .transform(path => resolvePath(path))
    .refine(path => {
      try {
        statSync(path);
        return true;
      } catch {
        return false;
      }
    }, 'File does not exist'),
  trpcEndpoint: z
    .string()
    .url('Invalid URL')
    .refine(
      url => url.startsWith('http') || url.startsWith('https'),
      "Endpoint must start with 'http' or 'https'"
    )
    .transform(endpoint =>
      endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint
    ),
  verbose: z.boolean().optional(),
  debug: z.boolean().optional(),
  silent: z.boolean().optional(),
});

export type Config = z.infer<typeof configSchema>;

export async function parseConfigurationFile() {
  try {
    const res = explorer.search();
    if (!res) {
      consola.info('No configuration file found');
      return {};
    }
    const { config, filepath } = res;
    consola.info(`Loaded configuration from ${filepath}`);
    return config as Record<string, unknown>;
  } catch (error) {
    consola.error('Error while loading configuration file', error);
    return {};
  }
}
