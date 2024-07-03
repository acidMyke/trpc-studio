import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { findAppRouter } from './utils/trpc';
import { Config } from './config';

export async function startStudio(args: Config) {
  // TODO: Ensure path in args is absolute, and file exists
  // TODO: Find the app router in the file
  // TODO: Parse the router, retrieve the procedures and their input schema
  // TODO: Start Hono Server
}

// const app = new Hono();

// app.get('/', c => {
//   return c.text('Hello Hono!');
// });

// const port = 3000;
// console.log(`Server is running on port ${port}`);

// serve({
//   fetch: app.fetch,
//   port,
// });
