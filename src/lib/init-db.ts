import pool from './db';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

/**
 * Create database if it doesn't exist
 */
async function createDatabaseIfNotExists(): Promise<void> {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306'),
    // Don't specify database here
  });

  try {
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS inventory_db');
    console.log('Database inventory_db created or already exists');
  } catch (error) {
    console.error('Error creating database:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Initialize the database and create tables if they don't exist
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Initializing database...');
    
    // First create the database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Test database connection
    await testConnection();
    
    // Create inventory table if it doesn't exist
    await createInventoryTable();
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
async function testConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error(`Database connection failed: ${error}`);
  }
}

/**
 * Create inventory table with proper schema
 */
async function createInventoryTable(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_name VARCHAR(255) NOT NULL,
      product_id VARCHAR(50) NOT NULL UNIQUE,
      category VARCHAR(100) NOT NULL,
      location VARCHAR(100) NOT NULL,
      available_quantity INT NOT NULL DEFAULT 0,
      reserved_quantity INT NOT NULL DEFAULT 0,
      on_hand_quantity INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_product_name (product_name),
      INDEX idx_category (category),
      INDEX idx_location (location),
      INDEX idx_product_id (product_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.execute(createTableQuery);
    console.log('Inventory table created or already exists');
    
    // Check table status
    await checkTableStatus();
  } catch (error) {
    console.error('Error creating inventory table:', error);
    throw error;
  }
}

/**
 * Check inventory table status
 */
async function checkTableStatus(): Promise<void> {
  try {
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM inventory');
    const count = rows[0].count;
    
    if (count === 0) {
      console.log('Inventory table is empty and ready for data.');
    } else {
      console.log(`Inventory table has ${count} existing records`);
    }
  } catch (error) {
    console.error('Error checking inventory table status:', error);
  }
}

/**
 * Drop inventory table (for development/testing purposes)
 */
export async function dropInventoryTable(): Promise<void> {
  try {
    await pool.execute('DROP TABLE IF EXISTS inventory');
    console.log('Inventory table dropped successfully');
  } catch (error) {
    console.error('Error dropping inventory table:', error);
    throw error;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  totalRecords: number;
  tableExists: boolean;
}> {
  try {
    // Check if table exists
    const [tables] = await pool.execute<RowDataPacket[]>(
      "SHOW TABLES LIKE 'inventory'"
    );
    const tableExists = tables.length > 0;
    
    let totalRecords = 0;
    if (tableExists) {
      const [rows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as count FROM inventory');
      totalRecords = rows[0].count;
    }
    
    return {
      totalRecords,
      tableExists
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      totalRecords: 0,
      tableExists: false
    };
  }
}