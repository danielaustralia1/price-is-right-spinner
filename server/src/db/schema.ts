
import { pgTable, uuid, text, integer } from 'drizzle-orm/pg-core';

export const employeesTable = pgTable('employees', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  wins: integer('wins').notNull().default(0),
});

// TypeScript types for the table schema
export type Employee = typeof employeesTable.$inferSelect;
export type NewEmployee = typeof employeesTable.$inferInsert;

// Export all tables for proper query building
export const tables = { employees: employeesTable };
