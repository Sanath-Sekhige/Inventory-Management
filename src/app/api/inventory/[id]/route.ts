import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface UpdateInventoryRequest {
  product_name?: string;
  product_id?: string;
  category?: string;
  location?: string;
  available_quantity?: number;
  reserved_quantity?: number;
  on_hand_quantity?: number;
}

// GET - Fetch single inventory item by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [itemId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    const item = {
      id: rows[0].id,
      product_name: rows[0].product_name,
      product_id: rows[0].product_id,
      category: rows[0].category,
      location: rows[0].location,
      available_quantity: rows[0].available_quantity,
      reserved_quantity: rows[0].reserved_quantity,
      on_hand_quantity: rows[0].on_hand_quantity,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at
    };

    return NextResponse.json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update inventory item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const body: UpdateInventoryRequest = await request.json();

    // Check if item exists
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM inventory WHERE id = ?',
      [itemId]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Validate numeric fields if provided
    const numericFields = ['available_quantity', 'reserved_quantity', 'on_hand_quantity'];
    for (const field of numericFields) {
      const value = body[field as keyof UpdateInventoryRequest];
      if (value !== undefined && (typeof value !== 'number' || value < 0)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `${field} must be a non-negative number` 
          },
          { status: 400 }
        );
      }
    }

    // Check if product_id is being updated and if it already exists elsewhere
    if (body.product_id) {
      const [duplicateRows] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM inventory WHERE product_id = ? AND id != ?',
        [body.product_id, itemId]
      );

      if (duplicateRows.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Product ID already exists. Please use a unique Product ID.' 
          },
          { status: 409 }
        );
      }
    }

    // Build dynamic update query based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(itemId);

    const updateQuery = `
      UPDATE inventory 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    await pool.execute<ResultSetHeader>(updateQuery, updateValues);

    // Fetch updated item
    const [updatedRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [itemId]
    );

    const updatedItem = {
      id: updatedRows[0].id,
      product_name: updatedRows[0].product_name,
      product_id: updatedRows[0].product_id,
      category: updatedRows[0].category,
      location: updatedRows[0].location,
      available_quantity: updatedRows[0].available_quantity,
      reserved_quantity: updatedRows[0].reserved_quantity,
      on_hand_quantity: updatedRows[0].on_hand_quantity,
      created_at: updatedRows[0].created_at,
      updated_at: updatedRows[0].updated_at
    };

    return NextResponse.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete inventory item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    // Check if item exists
    const [existingRows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM inventory WHERE id = ?',
      [itemId]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    // Store item data before deletion for response
    const deletedItem = {
      id: existingRows[0].id,
      product_name: existingRows[0].product_name,
      product_id: existingRows[0].product_id,
      category: existingRows[0].category,
      location: existingRows[0].location,
      available_quantity: existingRows[0].available_quantity,
      reserved_quantity: existingRows[0].reserved_quantity,
      on_hand_quantity: existingRows[0].on_hand_quantity,
      created_at: existingRows[0].created_at,
      updated_at: existingRows[0].updated_at
    };

    // Delete the item
    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM inventory WHERE id = ?',
      [itemId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete inventory item' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inventory item deleted successfully',
      data: deletedItem
    });

  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete inventory item',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}