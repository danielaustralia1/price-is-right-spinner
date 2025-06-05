
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { getRandomEmployee } from '../handlers/get_random_employee';

describe('getRandomEmployee', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a random employee when employees exist', async () => {
    // Create test employees
    await db.insert(employeesTable)
      .values([
        { name: 'Alice', wins: 5 },
        { name: 'Bob', wins: 3 },
        { name: 'Charlie', wins: 8 }
      ])
      .execute();

    const result = await getRandomEmployee();

    // Verify the result structure
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe('string');
    expect(typeof result.wins).toBe('number');
    expect(result.wins).toBeGreaterThanOrEqual(0);

    // Verify it's one of our test employees
    const expectedNames = ['Alice', 'Bob', 'Charlie'];
    expect(expectedNames).toContain(result.name);
  });

  it('should return different employees across multiple calls', async () => {
    // Create multiple test employees to increase randomness likelihood
    await db.insert(employeesTable)
      .values([
        { name: 'Alice', wins: 1 },
        { name: 'Bob', wins: 2 },
        { name: 'Charlie', wins: 3 },
        { name: 'David', wins: 4 },
        { name: 'Eve', wins: 5 }
      ])
      .execute();

    // Get multiple random employees
    const results = await Promise.all([
      getRandomEmployee(),
      getRandomEmployee(),
      getRandomEmployee(),
      getRandomEmployee(),
      getRandomEmployee()
    ]);

    // Verify we got valid employees
    results.forEach(result => {
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(typeof result.wins).toBe('number');
    });

    // Check that we got at least some variation (not all the same employee)
    // Note: This test could theoretically fail due to randomness, but it's very unlikely
    const uniqueNames = new Set(results.map(r => r.name));
    expect(uniqueNames.size).toBeGreaterThan(1);
  });

  it('should return employee with correct wins count', async () => {
    // Create employee with specific wins count
    const insertResult = await db.insert(employeesTable)
      .values({ name: 'Test Employee', wins: 42 })
      .returning()
      .execute();

    const employee = insertResult[0];

    const result = await getRandomEmployee();

    // Since there's only one employee, we should get this one
    expect(result.id).toBe(employee.id);
    expect(result.name).toBe('Test Employee');
    expect(result.wins).toBe(42);
  });

  it('should throw error when no employees exist', async () => {
    // Database is empty, so this should throw
    await expect(getRandomEmployee()).rejects.toThrow(/no employees found/i);
  });

  it('should handle employee with zero wins', async () => {
    // Create employee with zero wins
    await db.insert(employeesTable)
      .values({ name: 'New Employee', wins: 0 })
      .execute();

    const result = await getRandomEmployee();

    expect(result.name).toBe('New Employee');
    expect(result.wins).toBe(0);
  });

  it('should return employee with all required fields', async () => {
    // Create test employee
    await db.insert(employeesTable)
      .values({ name: 'Complete Employee', wins: 10 })
      .execute();

    const result = await getRandomEmployee();

    // Verify all required schema fields are present
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('wins');

    // Verify field types match schema expectations
    expect(typeof result.id).toBe('string');
    expect(typeof result.name).toBe('string');
    expect(typeof result.wins).toBe('number');
    expect(Number.isInteger(result.wins)).toBe(true);
    expect(result.wins).toBeGreaterThanOrEqual(0);
  });
});
