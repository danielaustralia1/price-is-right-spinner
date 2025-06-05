import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { incrementWinsInputSchema } from './schema';
import { getEmployees } from './handlers/get_employees';
import { getLeaderboard } from './handlers/get_leaderboard';
import { incrementEmployeeWins } from './handlers/increment_employee_wins';
import { getRandomEmployee } from './handlers/get_random_employee';
import { db } from './db';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  getEmployees: publicProcedure
    .query(async () => {
      return getEmployees(db);
    }),
  getLeaderboard: publicProcedure
    .query(async () => {
      return getLeaderboard(db);
    }),
  getRandomEmployee: publicProcedure
    .query(async () => {
      return getRandomEmployee(db);
    }),
  incrementEmployeeWins: publicProcedure
    .input(incrementWinsInputSchema)
    .mutation(async ({ input }) => {
      return incrementEmployeeWins(db, input);
    }),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors({
        origin: true,
        credentials: true,
        exposedHeaders: ['x-supabase-url', 'x-supabase-key'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-supabase-url', 'x-supabase-key'],
      })(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();