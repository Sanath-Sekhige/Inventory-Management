import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { initializeDatabase } from '@/lib/init-db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

// Initialize database on first API call
let isInitialized = false;

async function ensureInitialized() {
  if (!isInitialized) {
    try {
      await initializeDatabase();
      isInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
}

export interface InventoryItem {
  id: number;
  product_name: string;
  product_id: string;
  category: string;
  location: string;
  available_quantity: number;
  reserved_quantity: number;
  on_hand_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryRequest {
  product_name: string;
  product_id: string;
  category: string;
  location: string;
  available_quantity: number;
  reserved_quantity: number;
  on_hand_quantity: number;
}

// GET - Fetch all inventory items
export async function GET(request: NextRequest) {
  try {
    await ensureInitialized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    let query = `
      SELECT 
        id, product_name, product_id, category, location,
        available_quantity, reserved_quantity, on_hand_quantity,
        created_at, updated_at
      FROM inventory
      WHERE 1=1
    `;
    
    const queryParams: any[] = [];

    // Add search filter
    if (search) {
      query += ` AND (
        product_name LIKE ? OR 
        product_id LIKE ? OR 
        category LIKE ?
      )`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Add category filter
    if (category) {
      query += ` AND category = ?`;
      queryParams.push(category);
    }

    // Add location filter
    if (location) {
      query += ` AND location = ?`;
      queryParams.push(location);
    }

    // Order by created_at DESC to show newest first
    query += ` ORDER BY created_at DESC`;

    const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
    
    const inventoryItems: InventoryItem[] = rows.map(row => ({
      id: row.id,
      product_name: row.product_name,
      product_id: row.product_id,
      category: row.category,
      location: row.location,
      available_quantity: row.available_quantity,
      reserved_quantity: row.reserved_quantity,
      on_hand_quantity: row.on_hand_quantity,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      data: inventoryItems,
      count: inventoryItems.length
    });

  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create new inventory item
export async function POST(request: NextRequest) {
  try {
    await ensureInitialized();

    const body: CreateInventoryRequest = await request.json();

    // Validate required fields
    const requiredFields = [
      'product_name', 'product_id', 'category', 'location',
      'available_quantity', 'reserved_quantity', 'on_hand_quantity'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof CreateInventoryRequest] && body[field as keyof CreateInventoryRequest] !== 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    const numericFields = ['available_quantity', 'reserved_quantity', 'on_hand_quantity'];
    for (const field of numericFields) {
      const value = body[field as keyof CreateInventoryRequest];
      if (typeof value !== 'number' || value < 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} must be a non-negative number` 
          },
          { status: 400 }
        );
      }
    }

    // Check if product_id already exists
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM inventory WHERE product_id = ?',
      [body.product_id]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product ID already exists. Please use a unique Product ID.' 
        },
        { status: 409 }
      );
    }

    // Insert new inventory item
    const insertQuery = `
      INSERT INTO inventory (
        product_name, product_id, category, location,
        available_quantity, reserved_quantity, on_hand_quantity
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(insertQuery, [
      body.product_name,
      body.product_id,
      body.category,
      body.location,
      body.available_quantity,
      body.reserved_quantity,
      body.on_hand_quantity
    ]);

    // Fetch the created item
    const [newItemRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [result.insertId]
    );

    const newItem: InventoryItem = {
      id: newItemRows[0].id,
      product_name: newItemRows[0].product_name,
      product_id: newItemRows[0].product_id,
      category: newItemRows[0].category,
      location: newItemRows[0].location,
      available_quantity: newItemRows[0].available_quantity,
      reserved_quantity: newItemRows[0].reserved_quantity,
      on_hand_quantity: newItemRows[0].on_hand_quantity,
      created_at: newItemRows[0].created_at,
      updated_at: newItemRows[0].updated_at
    };

    return NextResponse.json({
      success: true,
      message: 'Inventory item created successfully',
      data: newItem
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}