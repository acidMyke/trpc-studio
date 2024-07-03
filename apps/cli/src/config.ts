import consola from 'consola';
import JoyCon from 'joycon';
import json5 from 'json5';
import { z } from 'zod';

const joycon = new JoyCon({
  files: [
    'trpcStudio.config.json',
    'trpcStudio.config.json5',
    'trpcStudio.config.jsonc',
    'trpcStudio.config.js',
    'trpcStudio.config.ts',
  ],
  parseJSON: json5.parse,
});

export const configSchema = z.object({
  routerPath: z.string(),
  trpcEndpoint: z
    .string()
    .url('Invalid URL')
    .refine(
      url => url.startsWith('http') || url.startsWith('https'),
      "Endpoint must start with 'http' or 'https'"
    )
    .transform(endpoint =>
      endpoint.endsWith('/') ? endpoint : `${endpoint}/`
    ),
});

export type Config = z.infer<typeof configSchema>;

export async function parseConfigurationFile(): Promise<Partial<Config>> {
  const { path, data } = await joycon.load();
  consola.info(`Loaded configuration from ${path}`);
  return configSchema.partial().safeParse(data).data ?? {};
}
