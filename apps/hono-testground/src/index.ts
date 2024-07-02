import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import appRouter from './router';
import { trpcServer } from '@hono/trpc-server';

const app = new Hono();

app.use('/trpc/*', trpcServer({ router: appRouter }));

app.get('/', c => {
  return c.text('Hello Hono!');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
