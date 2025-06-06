import { db } from '../db';
import { employeesTable } from '../db/schema';

export const seedDatabase = async (): Promise<void> => {
  try {
    // Add some sample employees to demonstrate the application
    await db.insert(employeesTable)
      .values([
        { name: 'Alice Johnson', wins: 15 },
        { name: 'Bob Smith', wins: 8 },
        { name: 'Charlie Brown', wins: 12 },
        { name: 'Diana Prince', wins: 20 },
        { name: 'Edward Norton', wins: 5 },
        { name: 'Fiona Apple', wins: 3 },
        { name: 'George Washington', wins: 18 },
        { name: 'Hannah Montana', wins: 9 },
        { name: 'Isaac Newton', wins: 22 },
        { name: 'Julia Roberts', wins: 11 }
      ])
      .execute();
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
};