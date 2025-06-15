import pool from './db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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

export interface CreateInventoryItem {
  product_name: string;
  product_id: string;
  category: string;
  location: string;
  available_quantity: number;
  reserved_quantity: number;
  on_hand_quantity: number;
}

export interface UpdateInventoryItem {
  product_name?: string;
  product_id?: string;
  category?: string;
  location?: string;
  available_quantity?: number;
  reserved_quantity?: number;
  on_hand_quantity?: number;
}

export interface InventoryFilters {
  search?: string;
  category?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

export interface InventoryServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface InventoryStats {
  totalItems: number;
  totalAvailableQuantity: number;
  totalReservedQuantity: number;
  totalOnHandQuantity: number;
  categoriesCount: number;
  locationsCount: number;
  lowStockItems: number;
}

export class InventoryService {
  /**
   * Get all inventory items with optional filtering
   */
  static async getAllItems(filters: InventoryFilters = {}): Promise<InventoryServiceResponse<InventoryItem[]>> {
    try {
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
      if (filters.search) {
        query += ` AND (
          product_name LIKE ? OR 
          product_id LIKE ? OR 
          category LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Add category filter
      if (filters.category) {
        query += ` AND category = ?`;
        queryParams.push(filters.category);
      }

      // Add location filter
      if (filters.location) {
        query += ` AND location = ?`;
        queryParams.push(filters.location);
      }

      // Order by created_at DESC
      query += ` ORDER BY created_at DESC`;

      // Add pagination
      if (filters.limit) {
        query += ` LIMIT ?`;
        queryParams.push(filters.limit);
        
        if (filters.offset) {
          query += ` OFFSET ?`;
          queryParams.push(filters.offset);
        }
      }

      const [rows] = await pool.execute<RowDataPacket[]>(query, queryParams);
      
      const items: InventoryItem[] = rows.map(row => ({
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

      return {
        success: true,
        data: items,
        count: items.length
      };

    } catch (error) {
      console.error('Error fetching inventory items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory items'
      };
    }
  }

  /**
   * Get inventory item by ID
   */
  static async getItemById(id: number): Promise<InventoryServiceResponse<InventoryItem>> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM inventory WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return {
          success: false,
          error: 'Inventory item not found'
        };
      }

      const item: InventoryItem = {
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

      return {
        success: true,
        data: item
      };

    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory item'
      };
    }
  }

  /**
   * Get inventory item by product ID
   */
  static async getItemByProductId(productId: string): Promise<InventoryServiceResponse<InventoryItem>> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT * FROM inventory WHERE product_id = ?',
        [productId]
      );

      if (rows.length === 0) {
        return {
          success: false,
          error: 'Inventory item not found'
        };
      }

      const item: InventoryItem = {
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

      return {
        success: true,
        data: item
      };

    } catch (error) {
      console.error('Error fetching inventory item by product ID:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory item'
      };
    }
  }

  /**
   * Create new inventory item
   */
  static async createItem(itemData: CreateInventoryItem): Promise<InventoryServiceResponse<InventoryItem>> {
    try {
      // Validate required fields
      const requiredFields: (keyof CreateInventoryItem)[] = [
        'product_name', 'product_id', 'category', 'location',
        'available_quantity', 'reserved_quantity', 'on_hand_quantity'
      ];

      for (const field of requiredFields) {
        if (itemData[field] === undefined || itemData[field] === null) {
          return {
            success: false,
            error: `Missing required field: ${field}`
          };
        }
      }

      // Validate numeric fields
      const numericFields: (keyof CreateInventoryItem)[] = ['available_quantity', 'reserved_quantity', 'on_hand_quantity'];
      for (const field of numericFields) {
        const value = itemData[field] as number;
        if (typeof value !== 'number' || value < 0) {
          return {
            success: false,
            error: `${field} must be a non-negative number`
          };
        }
      }

      // Check if product_id already exists
      const existingItem = await this.getItemByProductId(itemData.product_id);
      if (existingItem.success) {
        return {
          success: false,
          error: 'Product ID already exists. Please use a unique Product ID.'
        };
      }

      // Insert new item
      const insertQuery = `
        INSERT INTO inventory (
          product_name, product_id, category, location,
          available_quantity, reserved_quantity, on_hand_quantity
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute<ResultSetHeader>(insertQuery, [
        itemData.product_name,
        itemData.product_id,
        itemData.category,
        itemData.location,
        itemData.available_quantity,
        itemData.reserved_quantity,
        itemData.on_hand_quantity
      ]);

      // Fetch the created item
      const newItem = await this.getItemById(result.insertId);
      
      if (!newItem.success) {
        return {
          success: false,
          error: 'Failed to retrieve created item'
        };
      }

      return {
        success: true,
        data: newItem.data,
        message: 'Inventory item created successfully'
      };

    } catch (error) {
      console.error('Error creating inventory item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create inventory item'
      };
    }
  }

  /**
   * Update inventory item
   */
  static async updateItem(id: number, updateData: UpdateInventoryItem): Promise<InventoryServiceResponse<InventoryItem>> {
    try {
      // Check if item exists
      const existingItem = await this.getItemById(id);
      if (!existingItem.success) {
        return existingItem;
      }

      // Validate numeric fields if provided
      const numericFields: (keyof UpdateInventoryItem)[] = ['available_quantity', 'reserved_quantity', 'on_hand_quantity'];
      for (const field of numericFields) {
        const value = updateData[field];
        if (value !== undefined && (typeof value !== 'number' || value < 0)) {
          return {
            success: false,
            error: `${field} must be a non-negative number`
          };
        }
      }

      // Check if product_id is being updated and if it already exists elsewhere
      if (updateData.product_id) {
        const [duplicateRows] = await pool.execute<RowDataPacket[]>(
          'SELECT id FROM inventory WHERE product_id = ? AND id != ?',
          [updateData.product_id, id]
        );

        if (duplicateRows.length > 0) {
          return {
            success: false,
            error: 'Product ID already exists. Please use a unique Product ID.'
          };
        }
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      if (updateFields.length === 0) {
        return {
          success: false,
          error: 'No fields to update'
        };
      }

      // Add updated_at timestamp
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      const updateQuery = `
        UPDATE inventory 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `;

      await pool.execute<ResultSetHeader>(updateQuery, updateValues);

      // Fetch updated item
      const updatedItem = await this.getItemById(id);
      
      if (!updatedItem.success) {
        return {
          success: false,
          error: 'Failed to retrieve updated item'
        };
      }

      return {
        success: true,
        data: updatedItem.data,
        message: 'Inventory item updated successfully'
      };

    } catch (error) {
      console.error('Error updating inventory item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update inventory item'
      };
    }
  }

  /**
   * Delete inventory item
   */
  static async deleteItem(id: number): Promise<InventoryServiceResponse<InventoryItem>> {
    try {
      // Check if item exists and get its data
      const existingItem = await this.getItemById(id);
      if (!existingItem.success) {
        return existingItem;
      }

      // Delete the item
      const [result] = await pool.execute<ResultSetHeader>(
        'DELETE FROM inventory WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return {
          success: false,
          error: 'Failed to delete inventory item'
        };
      }

      return {
        success: true,
        data: existingItem.data,
        message: 'Inventory item deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete inventory item'
      };
    }
  }

  /**
   * Get unique categories
   */
  static async getCategories(): Promise<InventoryServiceResponse<string[]>> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT DISTINCT category FROM inventory ORDER BY category'
      );

      const categories = rows.map(row => row.category);

      return {
        success: true,
        data: categories,
        count: categories.length
      };

    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories'
      };
    }
  }

  /**
   * Get unique locations
   */
  static async getLocations(): Promise<InventoryServiceResponse<string[]>> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT DISTINCT location FROM inventory ORDER BY location'
      );

      const locations = rows.map(row => row.location);

      return {
        success: true,
        data: locations,
        count: locations.length
      };

    } catch (error) {
      console.error('Error fetching locations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch locations'
      };
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats(): Promise<InventoryServiceResponse<InventoryStats>> {
    try {
      // Get aggregate statistics
      const [statsRows] = await pool.execute<RowDataPacket[]>(`
        SELECT 
          COUNT(*) as totalItems,
          SUM(available_quantity) as totalAvailableQuantity,
          SUM(reserved_quantity) as totalReservedQuantity,
          SUM(on_hand_quantity) as totalOnHandQuantity,
          COUNT(DISTINCT category) as categoriesCount,
          COUNT(DISTINCT location) as locationsCount
        FROM inventory
      `);

      // Get low stock items (assuming low stock is when available_quantity < 50)
      const [lowStockRows] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as lowStockCount FROM inventory WHERE available_quantity < 50'
      );

      const stats: InventoryStats = {
        totalItems: statsRows[0].totalItems || 0,
        totalAvailableQuantity: statsRows[0].totalAvailableQuantity || 0,
        totalReservedQuantity: statsRows[0].totalReservedQuantity || 0,
        totalOnHandQuantity: statsRows[0].totalOnHandQuantity || 0,
        categoriesCount: statsRows[0].categoriesCount || 0,
        locationsCount: statsRows[0].locationsCount || 0,
        lowStockItems: lowStockRows[0].lowStockCount || 0
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Error fetching inventory statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch inventory statistics'
      };
    }
  }

  /**
   * Get low stock items
   */
  static async getLowStockItems(threshold: number = 50): Promise<InventoryServiceResponse<InventoryItem[]>> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        `SELECT * FROM inventory 
         WHERE available_quantity < ? 
         ORDER BY available_quantity ASC`,
        [threshold]
      );

      const items: InventoryItem[] = rows.map(row => ({
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

      return {
        success: true,
        data: items,
        count: items.length
      };

    } catch (error) {
      console.error('Error fetching low stock items:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch low stock items'
      };
    }
  }

  /**
   * Update item quantities (for stock adjustments)
   */
  static async updateQuantities(
    id: number, 
    quantities: {
      available_quantity?: number;
      reserved_quantity?: number;
      on_hand_quantity?: number;
    }
  ): Promise<InventoryServiceResponse<InventoryItem>> {
    try {
      // Validate quantities
      Object.entries(quantities).forEach(([key, value]) => {
        if (value !== undefined && (typeof value !== 'number' || value < 0)) {
          throw new Error(`${key} must be a non-negative number`);
        }
      });

      return await this.updateItem(id, quantities);

    } catch (error) {
      console.error('Error updating quantities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update quantities'
      };
    }
  }

  /**
   * Bulk update items
   */
  static async bulkUpdateItems(updates: Array<{ id: number; data: UpdateInventoryItem }>): Promise<InventoryServiceResponse<InventoryItem[]>> {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const updatedItems: InventoryItem[] = [];
      
      for (const update of updates) {
        const result = await this.updateItem(update.id, update.data);
        if (!result.success) {
          throw new Error(`Failed to update item ${update.id}: ${result.error}`);
        }
        if (result.data) {
          updatedItems.push(result.data);
        }
      }
      
      await connection.commit();
      
      return {
        success: true,
        data: updatedItems,
        count: updatedItems.length,
        message: 'Bulk update completed successfully'
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('Error in bulk update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk update failed'
      };
    } finally {
      connection.release();
    }
  }
}