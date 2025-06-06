import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { 
  incrementWinsInputSchema, 
  createEmployeeInputSchema, 
  updateEmployeeInputSchema, 
  deleteEmployeeInputSchema 
} from './schema';
import { getEmployees } from './handlers/get_employees';
import { getLeaderboard } from './handlers/get_leaderboard';
import { incrementEmployeeWins } from './handlers/increment_employee_wins';
import { getRandomEmployee } from './handlers/get_random_employee';
import { seedDatabase } from './handlers/seed_database';
import { createEmployee } from './handlers/create_employee';
import { updateEmployee } from './handlers/update_employee';
import { deleteEmployee } from './handlers/delete_employee';

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
    .query(() => getEmployees()),
  getLeaderboard: publicProcedure
    .query(() => getLeaderboard()),
  getRandomEmployee: publicProcedure
    .query(() => getRandomEmployee()),
  incrementEmployeeWins: publicProcedure
    .input(incrementWinsInputSchema)
    .mutation(async ({ input }) => {
      return incrementEmployeeWins(input);
    }),
  createEmployee: publicProcedure
    .input(createEmployeeInputSchema)
    .mutation(async ({ input }) => {
      return createEmployee(input);
    }),
  updateEmployee: publicProcedure
    .input(updateEmployeeInputSchema)
    .mutation(async ({ input }) => {
      return updateEmployee(input);
    }),
  deleteEmployee: publicProcedure
    .input(deleteEmployeeInputSchema)
    .mutation(async ({ input }) => {
      return deleteEmployee(input);
    }),
});

export type AppRouter = typeof appRouter;

async function start() {
  // Seed database with sample data if empty
  try {
    const employees = await getEmployees();
    if (employees.length === 0) {
      console.log('Database is empty, seeding with sample data...');
      await seedDatabase();
      console.log('Database seeded successfully');
    }
  } catch (error) {
    console.warn('Could not check or seed database:', error);
  }

  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors({
        origin: true,
        credentials: true,
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