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
  User
} from 'lucide-react';

type InventoryItem = {
  id: number;
  no: number;
  product: string;
  productId: string;
  category: string;
  location: string;
  available: number;
  reserved: number;
  onHand: number;
};

const InventoryDashboard = () => {
  const [activeNavItem, setActiveNavItem] = useState<string>('Inventory');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [formData, setFormData] = useState({
    product: '',
    productId: '',
    category: '',
    location: '',
    available: '',
    reserved: '',
    onHand: ''
  });

  // Sample data to demonstrate the design (uncomment to see populated table)
  useEffect(() => {
    // Uncomment these lines to see the table with sample data like in the reference image
    /*
    const sampleData: InventoryItem[] = [
      {
        id: 1,
        no: 1,
        product: "Macbook Pro M1 2020",
        productId: "#LWL102012",
        category: "Laptop",
        location: "Warehouse 1",
        available: 120,
        reserved: 120,
        onHand: 100
      },
      {
        id: 2,
        no: 2,
        product: "Mechanical Keyboard",
        productId: "#LWL102013",
        category: "Accessories",
        location: "Warehouse 2",
        available: 230,
        reserved: 230,
        onHand: 205
      },
      {
        id: 3,
        no: 3,
        product: "Wired Mouse",
        productId: "#LWL102014",
        category: "Accessories",
        location: "Warehouse 3",
        available: 1230,
        reserved: 1230,
        onHand: 1130
      },
      {
        id: 4,
        no: 4,
        product: "Titan Watch",
        productId: "#LWL102015",
        category: "Watch",
        location: "Warehouse 4",
        available: 600,
        reserved: 600,
        onHand: 560
      },
      {
        id: 5,
        no: 5,
        product: "Sandisk Harddisk 1 TB",
        productId: "#LWL102016",
        category: "Accessories",
        location: "Warehouse 3",
        available: 250,
        reserved: 250,
        onHand: 190
      },
      {
        id: 6,
        no: 6,
        product: "Iwatch 4th Generation 2022",
        productId: "#LWL102017",
        category: "Watch",
        location: "Warehouse 5",
        available: 158,
        reserved: 158,
        onHand: 128
      }
    ];
    setInventoryItems(sampleData);
    */
  }, []);

  // Auto-generate Product ID when modal opens
  useEffect(() => {
    if (showAddModal) {
      const generateProductId = () => {
        const prefix = '#LWL';
        const timestamp = Date.now().toString().slice(-5);
        const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        return `${prefix}${timestamp}${random}`;
      };
      
      setFormData(prev => ({
        ...prev,
        productId: generateProductId()
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

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.product || !formData.category || !formData.location || 
        !formData.available || !formData.reserved || !formData.onHand) {
      return;
    }
    
    // Create new inventory item
    const newItem: InventoryItem = {
      id: Date.now(),
      no: inventoryItems.length + 1,
      product: formData.product,
      productId: formData.productId,
      category: formData.category,
      location: formData.location,
      available: parseInt(formData.available) || 0,
      reserved: parseInt(formData.reserved) || 0,
      onHand: parseInt(formData.onHand) || 0
    };
    
    // Add to inventory list
    setInventoryItems(prev => [...prev, newItem]);
    
    // Close modal and reset form
    setShowAddModal(false);
    setFormData({
      product: '',
      productId: '',
      category: '',
      location: '',
      available: '',
      reserved: '',
      onHand: ''
    });
  };

  const handleDelete = (id: number) => {
    setInventoryItems(prev => prev.filter(item => item.id !== id));
  };

  const filteredItems = inventoryItems.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <Package size={48} className="text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-400 mb-2">No inventory items found</p>
                          <p className="text-sm text-gray-400">Add your first inventory item to get started</p>
                          <button 
                            onClick={() => setShowAddModal(true)}
                            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                          >
                            Add First Item
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{item.product}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.productId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.available.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.reserved.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.onHand.toLocaleString()}</td>
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
                  Showing {filteredItems.length > 0 ? '1' : '0'} to {Math.min(10, filteredItems.length)} of {filteredItems.length} entries
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" disabled={filteredItems.length === 0}>
                  <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-2 bg-orange-600 text-white rounded-md">1</button>
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors" disabled={filteredItems.length === 0}>
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
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Product ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID *
                  </label>
                  <input
                    type="text"
                    name="productId"
                    value={formData.productId}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
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
                    name="available"
                    value={formData.available}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Reserved Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reserved Quantity *
                  </label>
                  <input
                    type="number"
                    name="reserved"
                    value={formData.reserved}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* On Hand Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    On Hand Quantity *
                  </label>
                  <input
                    type="number"
                    name="onHand"
                    value={formData.onHand}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg"
              >
                Add Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;