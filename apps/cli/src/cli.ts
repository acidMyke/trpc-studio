// Simple CLI to test the API
// import { main, configSchema } from '.';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { parseConfigurationFile, configSchema } from './config';
import { startStudio } from '.';
import { fromZodError } from 'zod-validation-error';
import consola from 'consola';

const args = yargs(hideBin(process.argv))
  .usage(
    `tRPC Studio\nProvides a simple Web UI to test tRPC procedures without implementing a client.`
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
  .example([
    [
      '$0 --routerPath ./src/api/root.ts --trpcEndpoint http://localhost:3000/api/trpc',
      'Start tRPC Studio for T3 Stack',
    ],
  ])
  .usage(
    `Configuration can also be provided by any of the following file in the root of your project`
  )
  .help()
  .version()
  .alias('help', 'h')
  .alias('version', 'v').argv;

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

  return startStudio(data);
});
