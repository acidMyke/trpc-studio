// Simple CLI to test the API
// import { main, configSchema } from '.';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import {
  parseConfigurationFile,
  configSchema,
  usableConfigFileNames,
} from './config';
import { startStudio } from '.';
import { fromZodError } from 'zod-validation-error';
import consola from 'consola';

const args = yargs(hideBin(process.argv))
  .usage(
    `tRPC Studio
Provides a simple Web UI to test tRPC procedures without implementing a client.

Configuration can be provided via any of the following files:
${usableConfigFileNames.join('\n')}
`
  )
  .option('routerPath', {
    alias: 'p',
    type: 'string',
    description: 'Path to the file to import tRPC router from',
  })
  .option('trpcEndpoint', {
    alias: 'e',
    type: 'string',
    description: 'Endpoint that handle the trpc requests',
  })
  .options('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .options('debug', {
    type: 'boolean',
    description: 'Run with debug logging',
  })
  .options('silent', {
    type: 'boolean',
    description: 'Run with no logging',
  })
  .help()
  .version()
  .alias('help', 'h')
  .alias('version', 'V').argv;

parseConfigurationFile().then(configFromFile => {
  // Combine the configuration from the file and the arguments, arguments will override the file
  const { success, error, data } = configSchema.safeParse({
    ...configFromFile,
    ...args,
  });
  if (!success) {
    consola.error(
      fromZodError(error, {
        issueSeparator: '\n',
        prefix: 'Invalid configuration:\n',
        prefixSeparator: '',
      }).toString()
    );
    consola.info(
      'Use --help to see the options or check the configuration file.'
    );
    process.exit(1);
  }
  consola.level = data.verbose ? +999 : data.debug ? 4 : data.silent ? -999 : 3;

  consola.info('Starting tRPC Studio');
  return startStudio(data);
});
