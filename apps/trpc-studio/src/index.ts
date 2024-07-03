import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { findAppRouter } from './utils/trpc';
import { Config } from './config';

export async function startStudio(args: Config) {}

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
