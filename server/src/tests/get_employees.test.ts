
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { getEmployees } from '../handlers/get_employees';

// For testing, we'll use the existing db instance
// In a full implementation, we would create a test database instance
describe('getEmployees', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no employees exist', async () => {
    const result = await getEmployees();
    
    expect(result).toEqual([]);
  });

  it('should return all employees', async () => {
    // Create test employees
    await db.insert(employeesTable)
      .values([
        { name: 'Alice Johnson', wins: 5 },
        { name: 'Bob Smith', wins: 3 },
        { name: 'Charlie Brown', wins: 7 }
      ])
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(3);
    expect(result.map(e => e.name)).toContain('Alice Johnson');
    expect(result.map(e => e.name)).toContain('Bob Smith');
    expect(result.map(e => e.name)).toContain('Charlie Brown');
  });

  it('should return employees ordered by wins descending', async () => {
    // Create test employees with different win counts
    await db.insert(employeesTable)
      .values([
        { name: 'Low Wins', wins: 2 },
        { name: 'High Wins', wins: 10 },
        { name: 'Medium Wins', wins: 6 }
      ])
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(3);
    expect(result[0].name).toEqual('High Wins');
    expect(result[0].wins).toEqual(10);
    expect(result[1].name).toEqual('Medium Wins');
    expect(result[1].wins).toEqual(6);
    expect(result[2].name).toEqual('Low Wins');
    expect(result[2].wins).toEqual(2);
  });

  it('should handle employees with same win count', async () => {
    // Create employees with same wins
    await db.insert(employeesTable)
      .values([
        { name: 'Employee A', wins: 5 },
        { name: 'Employee B', wins: 5 },
        { name: 'Employee C', wins: 3 }
      ])
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(3);
    // First two should have 5 wins, last should have 3
    expect(result[0].wins).toEqual(5);
    expect(result[1].wins).toEqual(5);
    expect(result[2].wins).toEqual(3);
    expect(result[2].name).toEqual('Employee C');
  });

  it('should return employees with correct field types', async () => {
    await db.insert(employeesTable)
      .values({ name: 'Test Employee', wins: 15 })
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(1);
    expect(typeof result[0].id).toEqual('string');
    expect(typeof result[0].name).toEqual('string');
    expect(typeof result[0].wins).toEqual('number');
    expect(result[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should handle employees with zero wins', async () => {
    await db.insert(employeesTable)
      .values([
        { name: 'New Employee', wins: 0 },
        { name: 'Veteran Employee', wins: 10 }
      ])
      .execute();

    const result = await getEmployees();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Veteran Employee');
    expect(result[0].wins).toEqual(10);
    expect(result[1].name).toEqual('New Employee');
    expect(result[1].wins).toEqual(0);
  });
});
