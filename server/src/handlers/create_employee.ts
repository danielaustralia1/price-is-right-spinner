import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type CreateEmployeeInput, type Employee } from '../schema';

export const createEmployee = async (input: CreateEmployeeInput): Promise<Employee> => {
  try {
    const result = await db.insert(employeesTable)
      .values({
        name: input.name,
        wins: input.wins,
      })
      .returning()
      .execute();

    const employee = result[0];
    return {
      id: employee.id,
      name: employee.name,
      wins: employee.wins,
    };
  } catch (error) {
    console.error('Employee creation failed:', error);
    throw error;
  }
};