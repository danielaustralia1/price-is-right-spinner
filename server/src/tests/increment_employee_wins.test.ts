
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { type IncrementWinsInput } from '../schema';
import { incrementEmployeeWins } from '../handlers/increment_employee_wins';
import { eq } from 'drizzle-orm';

describe('incrementEmployeeWins', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should increment wins for existing employee', async () => {
    // Create a test employee
    const employee = await db.insert(employeesTable)
      .values({
        name: 'John Doe',
        wins: 5
      })
      .returning()
      .execute();

    const testInput: IncrementWinsInput = {
      employeeId: employee[0].id
    };

    // Increment wins
    const result = await incrementEmployeeWins(testInput);

    // Verify the result
    expect(result.id).toEqual(employee[0].id);
    expect(result.name).toEqual('John Doe');
    expect(result.wins).toEqual(6);
  });

  it('should increment wins from zero', async () => {
    // Create a test employee with zero wins
    const employee = await db.insert(employeesTable)
      .values({
        name: 'Jane Smith',
        wins: 0
      })
      .returning()
      .execute();

    const testInput: IncrementWinsInput = {
      employeeId: employee[0].id
    };

    // Increment wins
    const result = await incrementEmployeeWins(testInput);

    // Verify the result
    expect(result.id).toEqual(employee[0].id);
    expect(result.name).toEqual('Jane Smith');
    expect(result.wins).toEqual(1);
  });

  it('should save incremented wins to database', async () => {
    // Create a test employee
    const employee = await db.insert(employeesTable)
      .values({
        name: 'Bob Wilson',
        wins: 3
      })
      .returning()
      .execute();

    const testInput: IncrementWinsInput = {
      employeeId: employee[0].id
    };

    // Increment wins
    await incrementEmployeeWins(testInput);

    // Query database to verify the change was persisted
    const updatedEmployee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employee[0].id))
      .execute();

    expect(updatedEmployee).toHaveLength(1);
    expect(updatedEmployee[0].name).toEqual('Bob Wilson');
    expect(updatedEmployee[0].wins).toEqual(4);
  });

  it('should throw error for non-existent employee', async () => {
    const testInput: IncrementWinsInput = {
      employeeId: '550e8400-e29b-41d4-a716-446655440000' // Random UUID
    };

    // Should throw error for non-existent employee
    await expect(incrementEmployeeWins(testInput))
      .rejects
      .toThrow(/Employee with ID .* not found/i);
  });

  it('should handle multiple increments correctly', async () => {
    // Create a test employee
    const employee = await db.insert(employeesTable)
      .values({
        name: 'Multi Winner',
        wins: 10
      })
      .returning()
      .execute();

    const testInput: IncrementWinsInput = {
      employeeId: employee[0].id
    };

    // Increment wins multiple times
    let result = await incrementEmployeeWins(testInput);
    expect(result.wins).toEqual(11);

    result = await incrementEmployeeWins(testInput);
    expect(result.wins).toEqual(12);

    result = await incrementEmployeeWins(testInput);
    expect(result.wins).toEqual(13);

    // Verify final state in database
    const finalEmployee = await db.select()
      .from(employeesTable)
      .where(eq(employeesTable.id, employee[0].id))
      .execute();

    expect(finalEmployee[0].wins).toEqual(13);
  });
});
