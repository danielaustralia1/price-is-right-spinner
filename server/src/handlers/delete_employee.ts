import { db } from '../db';
import { employeesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type DeleteEmployeeInput } from '../schema';

export const deleteEmployee = async (input: DeleteEmployeeInput): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await db.delete(employeesTable)
      .where(eq(employeesTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error('Employee not found');
    }

    return {
      success: true,
      message: 'Employee deleted successfully',
    };
  } catch (error) {
    console.error('Employee deletion failed:', error);
    throw error;
  }
};