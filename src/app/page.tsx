"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  BarChart3, 
  Package, 
  ClipboardList, 
  Warehouse, 
  ArrowRightLeft, 
  TrendingUp, 
  FileText, 
  GitCompare, 
  Factory, 
  Receipt, 
  Users, 
  HelpCircle, 
  Settings, 
  Upload, 
  Plus, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Eye,
  Trash2,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Updated interface to match API response
interface InventoryItem {
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

// Display interface for table
interface InventoryDisplayItem extends InventoryItem {
  no: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
  count?: number;
}

const InventoryDashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState<string>('Inventory');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    product_name: '',
    product_id: '',
    category: '',
    location: '',
    available_quantity: '',
    reserved_quantity: '',
    on_hand_quantity: ''
  });

  // Fetch inventory items from API
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/inventory');
      const result: ApiResponse<InventoryItem[]> = await response.json();
      
      if (result.success && result.data) {
        setInventoryItems(result.data);
      } else {
        setError(result.error || 'Failed to fetch inventory items');
      }
    } catch (err) {
      setError('Network error occurred while fetching inventory items');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory items on component mount
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Auto-generate Product ID when modal opens
  useEffect(() => {
    if (showAddModal) {
      const generateProductId = () => {
        const prefix = '#LWL';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
      };
      
      setFormData(prev => ({
        ...prev,
        product_id: generateProductId()
      }));
    }
  }, [showAddModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.product_name || !formData.category || !formData.location || 
        !formData.available_quantity || !formData.reserved_quantity || !formData.on_hand_quantity) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError('');
      
      const requestData = {
        product_name: formData.product_name,
        product_id: formData.product_id,
        category: formData.category,
        location: formData.location,
        available_quantity: parseInt(formData.available_quantity) || 0,
        reserved_quantity: parseInt(formData.reserved_quantity) || 0,
        on_hand_quantity: parseInt(formData.on_hand_quantity) || 0
      };

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result: ApiResponse<InventoryItem> = await response.json();

      if (result.success && result.data) {
        // Add new item to the list
        setInventoryItems(prev => [result.data!, ...prev]);
        
        // Close modal and reset form
        setShowAddModal(false);
        setFormData({
          product_name: '',
          product_id: '',
          category: '',
          location: '',
          available_quantity: '',
          reserved_quantity: '',
          on_hand_quantity: ''
        });
      } else {
        setError(result.error || 'Failed to create inventory item');
      }
    } catch (err) {
      setError('Network error occurred while creating inventory item');
      console.error('Error creating inventory:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse<InventoryItem> = await response.json();

      if (result.success) {
        // Remove item from the list
        setInventoryItems(prev => prev.filter(item => item.id !== id));
      } else {
        setError(result.error || 'Failed to delete inventory item');
      }
    } catch (err) {
      setError('Network error occurred while deleting inventory item');
      console.error('Error deleting inventory:', err);
    }
  };

  // Filter items based on search term
  const filteredItems = inventoryItems.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Convert to display format with row numbers
  const displayItems: InventoryDisplayItem[] = filteredItems.map((item, index) => ({
    ...item,
    no: index + 1
  }));

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', section: 'Main Menu' },
    { icon: Package, label: 'Product', section: 'Main Menu' },
    { icon: ClipboardList, label: 'Inventory', section: 'Main Menu' },
    { icon: Warehouse, label: 'Warehouse', section: 'Main Menu' },
    { icon: ArrowRightLeft, label: 'Transfer Product', section: 'Main Menu' },
    { icon: TrendingUp, label: 'Stock', section: 'Main Menu' },
    { icon: FileText, label: 'Disburse Plan', section: 'Main Menu' },
    { icon: GitCompare, label: 'Reconciliation', section: 'Main Menu' },
    { icon: Factory, label: 'Supplier', section: 'Other Menu' },
    { icon: Receipt, label: 'Invoice', section: 'Other Menu' },
    { icon: Users, label: 'User Management', section: 'Other Menu' },
    { icon: HelpCircle, label: 'Help & Center', section: 'Help & Settings' },
    { icon: Settings, label: 'Settings', section: 'Help & Settings' }
  ];

  const renderNavSection = (sectionName: string) => {
    const sectionItems = navItems.filter(item => item.section === sectionName);
    
    return (
      <div key={sectionName} className="py-2">
        <div className="px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {sectionName}
        </div>
        {sectionItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setActiveNavItem(item.label)}
              className={`w-full flex items-center px-5 py-3 text-sm font-medium transition-all duration-200 ${
                activeNavItem === item.label
                  ? 'bg-orange-50 text-orange-600 border-r-3 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className="mr-3" />
              {item.label}
            </button>
          );
        })}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      'Laptop': '💻',
      'Accessories': '🔌',
      'Watch': '⌚',
      'Headphone': '🎧',
      'Camera': '📷'
    };
    return category in iconMap ? iconMap[category as keyof typeof iconMap] : '📦';
  };

  const getCategoryColor = (category: string) => {
    const colorMap = {
      'Laptop': 'bg-blue-100 text-blue-800',
      'Accessories': 'bg-green-100 text-green-800',
      'Watch': 'bg-purple-100 text-purple-800',
      'Headphone': 'bg-pink-100 text-pink-800',
      'Camera': 'bg-yellow-100 text-yellow-800'
    };
    return colorMap[category as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  // Error Alert Component
  const ErrorAlert = ({ message, onClose }: { message: string; onClose: () => void }) => (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
      <AlertCircle className="text-red-500 mr-3" size={20} />
      <span className="text-red-800 flex-1">{message}</span>
      <button 
        onClick={onClose}
        className="text-red-500 hover:text-red-700 ml-2"
      >
        ×
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-60 bg-white shadow-lg flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W+</span>
            </div>
            <span className="font-semibold text-gray-800">Inventory</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-4 h-[calc(100vh-5rem)]" style={{ overflowY: 'auto' }}>
          <div className="h-full">
            {renderNavSection('Main Menu')}
            {renderNavSection('Other Menu')}
            {renderNavSection('Help & Settings')}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search anything here"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Header Right */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                <Bell size={20} />
              </button>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-orange-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Error Alert */}
          {error && (
            <ErrorAlert message={error} onClose={() => setError('')} />
          )}

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Dashboard / Inventory</div>
              <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <Upload size={16} className="mr-2" />
                Export
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Inventory
              </button>
            </div>
          </div>

          {/* Inventory Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <ClipboardList size={20} className="text-orange-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
                {loading && <Loader2 size={16} className="ml-2 animate-spin text-orange-600" />}
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search anything here"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                  <Filter size={16} className="mr-1" />
                  Filter
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On Hand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Loader2 size={32} className="text-orange-600 animate-spin mb-4" />
                          <p className="text-gray-500">Loading inventory items...</p>
                        </div>
                      </td>
                    </tr>
                  ) : displayItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-400 mb-2">No inventory items found</p>
                          <p className="text-sm text-gray-400">
                            {searchTerm ? 'Try adjusting your search terms' : 'Add your first inventory item to get started'}
                          </p>
                          {!searchTerm && (
                            <button 
                              onClick={() => setShowAddModal(true)}
                              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                              Add First Item
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {String(item.no).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.product_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.product_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.available_quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.reserved_quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.on_hand_quantity.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-1">
                            <button className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                              <Eye size={14} />
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>Show 10</span>
                <span className="mx-4">
                  Showing {displayItems.length > 0 ? '1' : '0'} to {Math.min(10, displayItems.length)} of {displayItems.length} entries
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" disabled={displayItems.length === 0}>
                  <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-2 bg-orange-600 text-white rounded-md">1</button>
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" disabled={displayItems.length === 0}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-orange-500/30 to-orange-600/20 backdrop-blur-sm" 
               onClick={() => setShowAddModal(false)}></div>
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 flex-shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Add New Inventory Item</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                disabled={submitLoading}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm">
                  <AlertCircle className="text-red-500 mr-2" size={16} />
                  <span className="text-red-800">{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    value={formData.product_name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    disabled={submitLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Product ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID *
                  </label>
                  <input
                    type="text"
                    name="product_id"
                    value={formData.product_id}
                    onChange={handleInputChange}
                    placeholder="Auto-generated ID"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-700 placeholder-gray-500 bg-gray-50"
                    readOnly
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={submitLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 disabled:bg-gray-50"
                  >
                    <option value="" disabled className="text-gray-500">Select category</option>
                    <option value="Laptop" className="text-gray-900">Laptop</option>
                    <option value="Accessories" className="text-gray-900">Accessories</option>
                    <option value="Watch" className="text-gray-900">Watch</option>
                    <option value="Headphone" className="text-gray-900">Headphone</option>
                    <option value="Camera" className="text-gray-900">Camera</option>
                  </select>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={submitLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 disabled:bg-gray-50"
                  >
                    <option value="" disabled className="text-gray-500">Select warehouse</option>
                    <option value="Warehouse 1" className="text-gray-900">Warehouse 1</option>
                    <option value="Warehouse 2" className="text-gray-900">Warehouse 2</option>
                    <option value="Warehouse 3" className="text-gray-900">Warehouse 3</option>
                    <option value="Warehouse 4" className="text-gray-900">Warehouse 4</option>
                    <option value="Warehouse 5" className="text-gray-900">Warehouse 5</option>
                  </select>
                </div>

                {/* Available Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Quantity *
                  </label>
                  <input
                    type="number"
                    name="available_quantity"
                    value={formData.available_quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    disabled={submitLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                  />
                </div>

                {/* Reserved Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reserved Quantity *
                  </label>
                  <input
                    type="number"
                    name="reserved_quantity"
                    value={formData.reserved_quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    disabled={submitLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                  />
                </div>

                {/* On Hand Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    On Hand Quantity *
                  </label>
                  <input
                    type="number"
                    name="on_hand_quantity"
                    value={formData.on_hand_quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    disabled={submitLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 flex-shrink-0">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={submitLoading}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Add Item
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;