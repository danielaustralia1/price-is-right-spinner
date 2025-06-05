
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
