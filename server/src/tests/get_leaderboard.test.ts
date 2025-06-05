
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { employeesTable } from '../db/schema';
import { getLeaderboard } from '../handlers/get_leaderboard';

describe('getLeaderboard', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no employees exist', async () => {
    const result = await getLeaderboard();
    expect(result).toEqual([]);
  });

  it('should return single employee', async () => {
    // Create test employee
    await db.insert(employeesTable)
      .values({
        name: 'John Doe',
        wins: 5
      })
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('John Doe');
    expect(result[0].wins).toEqual(5);
    expect(result[0].id).toBeDefined();
  });

  it('should return employees ordered by wins descending', async () => {
    // Create multiple employees with different win counts
    await db.insert(employeesTable)
      .values([
        { name: 'Alice', wins: 10 },
        { name: 'Bob', wins: 25 },
        { name: 'Charlie', wins: 5 },
        { name: 'Diana', wins: 15 }
      ])
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(4);
    
    // Verify correct ordering by wins (descending)
    expect(result[0].name).toEqual('Bob');
    expect(result[0].wins).toEqual(25);
    
    expect(result[1].name).toEqual('Diana');
    expect(result[1].wins).toEqual(15);
    
    expect(result[2].name).toEqual('Alice');
    expect(result[2].wins).toEqual(10);
    
    expect(result[3].name).toEqual('Charlie');
    expect(result[3].wins).toEqual(5);
  });

  it('should handle employees with same win count', async () => {
    // Create employees with identical win counts
    await db.insert(employeesTable)
      .values([
        { name: 'Employee A', wins: 10 },
        { name: 'Employee B', wins: 10 },
        { name: 'Employee C', wins: 15 }
      ])
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(3);
    
    // First employee should have highest wins
    expect(result[0].name).toEqual('Employee C');
    expect(result[0].wins).toEqual(15);
    
    // Next two should have same wins (order may vary)
    expect(result[1].wins).toEqual(10);
    expect(result[2].wins).toEqual(10);
    
    // Both names should be present
    const names = [result[1].name, result[2].name].sort();
    expect(names).toEqual(['Employee A', 'Employee B']);
  });

  it('should handle employees with zero wins', async () => {
    // Create employees including some with zero wins
    await db.insert(employeesTable)
      .values([
        { name: 'Winner', wins: 5 },
        { name: 'New Employee', wins: 0 },
        { name: 'Another New Employee', wins: 0 }
      ])
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(3);
    
    // Winner should be first
    expect(result[0].name).toEqual('Winner');
    expect(result[0].wins).toEqual(5);
    
    // Zero-win employees should be at the end
    expect(result[1].wins).toEqual(0);
    expect(result[2].wins).toEqual(0);
  });

  it('should return all required fields for each employee', async () => {
    await db.insert(employeesTable)
      .values({
        name: 'Test Employee',
        wins: 3
      })
      .execute();

    const result = await getLeaderboard();

    expect(result).toHaveLength(1);
    const employee = result[0];
    
    // Verify all required fields are present
    expect(employee.id).toBeDefined();
    expect(typeof employee.id).toBe('string');
    expect(employee.name).toBeDefined();
    expect(typeof employee.name).toBe('string');
    expect(employee.wins).toBeDefined();
    expect(typeof employee.wins).toBe('number');
    expect(employee.wins).toBeGreaterThanOrEqual(0);
  });
});
