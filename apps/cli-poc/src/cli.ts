// Simple CLI to test the API
import { main, configSchema } from '.';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const args = yargs(hideBin(process.argv))
  .option('path', {
    alias: 'p',
    type: 'string',
    description: 'Path to the file to scan for tRPC routers',
    demandOption: true,
  })
  .option('endpoint', {
    alias: 'e',
    type: 'string',
    description: 'Endpoint to the server handling the trpc requests',
    demandOption: true,
  })
  .help().argv;

const { success, data, error } = configSchema.safeParse(args);
if (!success) {
  console.error('Invalid arguments:', error);
  process.exit(1);
}

main(data).catch(error => {
  console.error('Error while scanning the file:', error);
  process.exit(1);
});
