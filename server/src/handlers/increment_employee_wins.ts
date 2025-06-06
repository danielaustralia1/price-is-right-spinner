import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type IncrementWinsInput, type Employee } from '../schema';
import { eq } from 'drizzle-orm';

export const incrementEmployeeWins = async (input: IncrementWinsInput): Promise<Employee> => {
  try {
    // First, check if the employee exists
    const existingEmployee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, input.employeeId))
      .execute();

    if (existingEmployee.length === 0) {
      throw new Error(`Employee with ID ${input.employeeId} not found`);
    }

    // Increment the wins count
    const result = await db.update(employeesTable)
      .set({
        wins: existingEmployee[0].wins + 1
      })
      .where(eq(employeesTable.id, input.employeeId))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Failed to increment employee wins:', error);
    throw error;
  }
};