
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { sql } from 'drizzle-orm';
import { type Employee } from '../schema';

export const getRandomEmployee = async (): Promise<Employee> => {
  try {
    // Use PostgreSQL's RANDOM() function to get a random employee
    const result = await db.select()
      .from(employeesTable)
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .execute();

    if (result.length === 0) {
      throw new Error('No employees found in database');
    }

    const employee = result[0];
    return {
      id: employee.id,
      name: employee.name,
      wins: employee.wins
    };
  } catch (error) {
    console.error('Failed to get random employee:', error);
    throw error;
  }
};
