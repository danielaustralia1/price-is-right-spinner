import { db } from '../db';
import { employeesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UpdateEmployeeInput, type Employee } from '../schema';

export const updateEmployee = async (input: UpdateEmployeeInput): Promise<Employee> => {
  try {
    const result = await db.update(employeesTable)
      .set({
        name: input.name,
        wins: input.wins,
      })
      .where(eq(employeesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Employee not found');
    }

    const employee = result[0];
    return {
      id: employee.id,
      name: employee.name,
      wins: employee.wins,
    };
  } catch (error) {
    console.error('Employee update failed:', error);
    throw error;
  }
};