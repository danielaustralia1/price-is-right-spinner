import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type LeaderboardEntry } from '../schema';
import { desc } from 'drizzle-orm';

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  try {
    const results = await db.select()
      .from(employeesTable)
      .orderBy(desc(employeesTable.wins))
      .execute();

    return results;
  } catch (error) {
    console.error('Get leaderboard failed:', error);
    throw error;
  }
};