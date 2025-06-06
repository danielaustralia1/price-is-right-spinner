import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type Employee } from '../schema';
import { desc } from 'drizzle-orm';

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const results = await db.select()
      .from(employeesTable)
      .orderBy(desc(employeesTable.wins))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to get employees:', error);
    throw error;
  }
};