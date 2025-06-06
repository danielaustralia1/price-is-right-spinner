import { z } from 'zod';

// Employee schema
export const employeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  wins: z.number().int().nonnegative(),
});

export type Employee = z.infer<typeof employeeSchema>;

// Input schema for incrementing wins
export const incrementWinsInputSchema = z.object({
  employeeId: z.string().uuid(),
});

export type IncrementWinsInput = z.infer<typeof incrementWinsInputSchema>;

// Leaderboard entry schema (same as employee but for clarity)
export const leaderboardEntrySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  wins: z.number().int().nonnegative(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

// CRUD input schemas
export const createEmployeeInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  wins: z.number().int().nonnegative().default(0),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeInputSchema>;

export const updateEmployeeInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  wins: z.number().int().nonnegative(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeInputSchema>;

export const deleteEmployeeInputSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteEmployeeInput = z.infer<typeof deleteEmployeeInputSchema>;