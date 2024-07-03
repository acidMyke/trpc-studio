// Simple CLI to test the API
// import { main, configSchema } from '.';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv))
  .option('routerPath', {
    alias: 'p',
    type: 'string',
    description:
      'Path to the file to import tRPC router from, only the router with the most procedures will be used',
  })
  .option('trpcEndpoint', {
    alias: 'e',
    type: 'string',
    description: 'Endpoint that handle the trpc requests',
  })
  .help().argv;

// const { success, data, error } = configSchema.safeParse(args);
// if (!success) {
//   console.error('Invalid arguments:', error);
//   process.exit(1);
// }

// main(data).catch(error => {
//   console.error('Error while scanning the file:', error);
//   process.exit(1);
// });
