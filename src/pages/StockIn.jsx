import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, ArrowDownRight, CheckCircle, ChevronDown, Plus } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../context/InventoryContext';

export const StockInPage = () => {
  const navigate = useNavigate();
  const { products, stockIn, addProduct } = useInventory();
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    qty: '',
    newPrice: '',
    notes: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  // Quick Add Product State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    inPrice: '',
    vendorPrice: '',
    minVendorPrice: '',
    customerPrice: '',
    minCustomerPrice: ''
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products for dropdown
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleProductSelect = (product) => {
    setSelectedProductId(product.id);
    setFormData(prev => ({
      ...prev,
      newPrice: product.inPrice // Default to current purchase price
    }));
    setSearchQuery(''); 
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProductId || !formData.qty || !formData.newPrice) return;

    stockIn(
      selectedProductId, 
      parseInt(formData.qty), 
      parseFloat(formData.newPrice), 
      formData.notes
    );
    
    setIsSuccess(true);
    
    // Reset form after short delay
    setTimeout(() => {
        setIsSuccess(false);
        setFormData({ qty: '', newPrice: '', notes: '' });
        setSelectedProductId('');
        setSearchQuery('');
    }, 2000);
  };

  // --- Quick Add Product Handlers ---
  const handleOpenAddProduct = () => {
    setNewProduct({
      name: searchQuery, // Pre-fill with whatever they searched for
      category: '',
      inPrice: '',
      vendorPrice: '',
      minVendorPrice: '',
      customerPrice: '',
      minCustomerPrice: ''
    });
    setIsAddProductModalOpen(true);
    setIsDropdownOpen(false);
  };

  const handleQuickAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category || !newProduct.inPrice || !newProduct.customerPrice) {
      return alert('Please fill all required fields');
    }

    const createdProduct = {
      id: faker.string.uuid(),
      name: newProduct.name,
      category: newProduct.category,
      sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase(),
      image: null,
      tags: '',
      stock: 0, // Stock is 0 initially, will be updated by Stock In
      inPrice: parseFloat(newProduct.inPrice),
      vendorPrice: parseFloat(newProduct.vendorPrice || newProduct.customerPrice),
      minVendorPrice: parseFloat(newProduct.minVendorPrice || newProduct.customerPrice),
      customerPrice: parseFloat(newProduct.customerPrice),
      minCustomerPrice: parseFloat(newProduct.minCustomerPrice || newProduct.customerPrice),
      isActive: true,
      lastUpdated: new Date().toLocaleDateString('en-IN')
    };

    addProduct(createdProduct);
    
    // Auto-select the newly created product
    handleProductSelect(createdProduct);
    setIsAddProductModalOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Stock In Entry</h1>
          <p className="text-text-secondary">Add stock and update purchase rates</p>
        </div>
      </div>

      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} />
          <span className="font-medium">Stock added successfully!</span>
        </div>
      )}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Custom Dropdown for Product Selection */}
          <div className="space-y-2 relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-text-primary">Select Product</label>
            
            <div 
              className="w-full px-3 py-2.5 border border-border rounded-md text-sm bg-white cursor-pointer flex items-center justify-between hover:border-primary/50 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className={selectedProduct ? "text-text-primary" : "text-text-secondary"}>
                {selectedProduct ? `${selectedProduct.name} (${selectedProduct.sku})` : "Search and select a product..."}
              </span>
              <ChevronDown size={16} className="text-text-secondary" />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-80 flex flex-col">
                <div className="p-2 border-b border-border sticky top-0 bg-white rounded-t-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                    <input 
                        type="text"
                        placeholder="Type to search..."
                        className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 p-1">
                  {filteredProducts.length > 0 ? (
                      filteredProducts.map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => handleProductSelect(p)}
                          className={`p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-3 ${selectedProductId === p.id ? 'bg-blue-50' : ''}`}
                        >
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                            <Package size={16} className="text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-text-primary">{p.name}</p>
                            <p className="text-xs text-text-secondary">SKU: {p.sku} | Stock: {p.stock}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                      <div className="p-4 text-center text-text-secondary text-sm">No products found matching "{searchQuery}"</div>
                  )}
                </div>

                {/* Always show Add Product button at the bottom of dropdown */}
                <div className="p-2 border-t border-border bg-gray-50 rounded-b-md sticky bottom-0">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full justify-center" 
                    icon={Plus}
                    onClick={handleOpenAddProduct}
                  >
                    Add New Product {searchQuery ? `"${searchQuery}"` : ''}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
               <div className="p-3 bg-white rounded-md text-blue-600 shadow-sm">
                  <Package size={24} />
               </div>
               <div>
                  <h3 className="font-semibold text-text-primary">{selectedProduct.name}</h3>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-text-secondary mt-1">
                      <span>Current Stock: <strong className="text-text-primary">{selectedProduct.stock}</strong></span>
                      <span>Current Buy Price: <strong className="text-text-primary">{formatCurrency(selectedProduct.inPrice)}</strong></span>
                      <span>Selling Price: <strong className="text-text-primary">{formatCurrency(selectedProduct.customerPrice)}</strong></span>
                  </div>
               </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Quantity to Add <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min="1"
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.qty}
                onChange={e => setFormData({...formData, qty: e.target.value})}
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">New Purchase Price (Unit) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    className="w-full pl-7 pr-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.newPrice}
                    onChange={e => setFormData({...formData, newPrice: e.target.value})}
                    placeholder="0.00"
                    required
                />
              </div>
              <p className="text-xs text-text-secondary mt-1">Updates the product's purchase cost.</p>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-text-primary mb-1">Notes / Reference</label>
             <textarea 
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="e.g. Vendor Bill #123, Restock"
             />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
             <Button type="button" variant="secondary" onClick={() => navigate('/inventory')}>Cancel</Button>
             <Button type="submit" icon={ArrowDownRight} disabled={!selectedProductId}>Confirm Stock In</Button>
          </div>
        </form>
      </Card>

      {/* Quick Add Product Modal */}
      <Modal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)}
        title="Quick Add Product"
        className="max-w-2xl"
      >
        <form onSubmit={handleQuickAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Product Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Category <span className="text-red-500">*</span></label>
              <select 
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={newProduct.category}
                onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-semibold text-text-primary mb-4">Pricing Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              
              {/* Purchase Price */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Purchase Price (In) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full pl-6 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newProduct.inPrice}
                    onChange={e => setNewProduct({...newProduct, inPrice: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Vendor Pricing */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div className="col-span-2 pb-1 border-b border-border/50">
                  <span className="text-xs font-semibold text-text-primary">Vendor Pricing (B2B)</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Standard Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full pl-6 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.vendorPrice}
                      onChange={e => setNewProduct({...newProduct, vendorPrice: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full pl-6 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.minVendorPrice}
                      onChange={e => setNewProduct({...newProduct, minVendorPrice: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Pricing */}
              <div className="md:col-start-2 md:col-span-2 grid grid-cols-2 gap-4 mt-2">
                <div className="col-span-2 pb-1 border-b border-border/50">
                  <span className="text-xs font-semibold text-text-primary">Customer Pricing (B2C)</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Standard Price <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full pl-6 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.customerPrice}
                      onChange={e => setNewProduct({...newProduct, customerPrice: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full pl-6 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      value={newProduct.minCustomerPrice}
                      onChange={e => setNewProduct({...newProduct, minCustomerPrice: e.target.value})}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setIsAddProductModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save & Select</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
