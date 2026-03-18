import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Store, Search, ChevronDown, Package, RefreshCw, Tag } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TagInput } from '../components/ui/TagInput';
import { formatCurrency } from '../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../context/InventoryContext';

export const AddPurchaseOrderPage = () => {
  const navigate = useNavigate();
  const { dealers, products, addPurchaseOrder, addProduct } = useInventory();
  
  const [poData, setPoData] = useState({
    dealerId: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const [paymentType, setPaymentType] = useState('Unpaid'); // 'Unpaid', 'Partial', 'Paid'
  const [amountPaid, setAmountPaid] = useState('');

  // --- Searchable Dropdown States ---
  const [isDealerOpen, setIsDealerOpen] = useState(false);
  const [dealerSearch, setDealerSearch] = useState('');
  const dealerRef = useRef(null);

  const [isProductOpen, setIsProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const productRef = useRef(null);

  // --- Quick Add Product State ---
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [productTags, setProductTags] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase(),
    category: '',
    inPrice: '',
    vendorPrice: '',
    minVendorPrice: '',
    customerPrice: '',
    minCustomerPrice: ''
  });

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dealerRef.current && !dealerRef.current.contains(event.target)) {
        setIsDealerOpen(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
        setIsProductOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Filter Logic ---
  const filteredDealers = useMemo(() => {
    return dealers.filter(d => 
      d.name.toLowerCase().includes(dealerSearch.toLowerCase()) || 
      d.category.toLowerCase().includes(dealerSearch.toLowerCase())
    );
  }, [dealers, dealerSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const selectedDealer = dealers.find(d => d.id === poData.dealerId);

  // --- Handlers ---
  const handleDealerSelect = (dealer) => {
    setPoData(prev => ({ ...prev, dealerId: dealer.id }));
    setDealerSearch('');
    setIsDealerOpen(false);
  };

  const handleProductSelect = (product) => {
    setPoData(prev => {
      const existingIndex = prev.items.findIndex(i => i.productId === product.id);
      if (existingIndex >= 0) {
        // Increment quantity if already in list
        const newItems = [...prev.items];
        newItems[existingIndex].qty += 1;
        newItems[existingIndex].total = newItems[existingIndex].qty * newItems[existingIndex].price;
        return { ...prev, items: newItems };
      } else {
        // Add new item
        return {
          ...prev,
          items: [
            ...prev.items, 
            { 
              id: Date.now(), 
              productId: product.id, 
              productName: product.name,
              qty: 1, 
              price: product.inPrice, 
              total: product.inPrice 
            }
          ]
        };
      }
    });
    setProductSearch('');
    setIsProductOpen(false);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...poData.items];
    newItems.splice(index, 1);
    setPoData(prev => ({ ...prev, items: newItems }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...poData.items];
    const item = { ...newItems[index] };

    if (field === 'qty') {
      item.qty = parseInt(value) || 0;
    } else if (field === 'price') {
      item.price = parseFloat(value) || 0;
    }

    item.total = item.qty * item.price;
    newItems[index] = item;
    setPoData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => poData.items.reduce((acc, item) => acc + item.total, 0);

  const handleSavePO = () => {
    if (!poData.dealerId) return alert('Please select a dealer');
    if (poData.items.length === 0) return alert('Add at least one item');

    const dealer = dealers.find(d => d.id === poData.dealerId);
    const totalAmount = calculateTotal();
    
    let finalPaidAmount = 0;
    if (paymentType === 'Paid') {
        finalPaidAmount = totalAmount;
    } else if (paymentType === 'Partial') {
        finalPaidAmount = parseFloat(amountPaid) || 0;
    }

    const newPO = {
      id: faker.string.uuid(),
      poNo: 'PO-' + faker.string.numeric(5),
      date: poData.date,
      dealerId: dealer.id,
      dealerName: dealer.name,
      amount: totalAmount,
      paidAmount: finalPaidAmount,
      dueAmount: Math.max(0, totalAmount - finalPaidAmount),
      paymentStatus: paymentType,
      status: 'Pending', // Orders start as pending until received
      items: poData.items
    };

    addPurchaseOrder(newPO);
    navigate('/purchase-orders');
  };

  // --- Quick Add Product Handlers ---
  const handleOpenAddProduct = () => {
    setNewProduct({
      name: productSearch, // Pre-fill with whatever they searched for
      sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase(),
      category: '',
      inPrice: '',
      vendorPrice: '',
      minVendorPrice: '',
      customerPrice: '',
      minCustomerPrice: ''
    });
    setProductTags([]);
    setIsAddProductModalOpen(true);
    setIsProductOpen(false);
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
      sku: newProduct.sku,
      image: null,
      tags: productTags.join(', '),
      stock: 0, // ALWAYS 0 INITIAL STOCK FOR NEW PRODUCTS CREATED HERE
      inPrice: parseFloat(newProduct.inPrice),
      vendorPrice: parseFloat(newProduct.vendorPrice || newProduct.customerPrice),
      minVendorPrice: parseFloat(newProduct.minVendorPrice || newProduct.customerPrice),
      customerPrice: parseFloat(newProduct.customerPrice),
      minCustomerPrice: parseFloat(newProduct.minCustomerPrice || newProduct.customerPrice),
      isActive: true,
      lastUpdated: new Date().toLocaleDateString('en-IN')
    };

    addProduct(createdProduct);
    handleProductSelect(createdProduct); // Auto-add to PO
    setIsAddProductModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 bg-surface z-10 py-4 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Purchase Order</h1>
            <p className="text-sm text-text-secondary">Create order and record payments</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/purchase-orders')}>Cancel</Button>
          <Button icon={Save} onClick={handleSavePO}>Save Order</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Searchable Dealer Dropdown */}
              <div className="relative" ref={dealerRef}>
                <label className="block text-sm font-medium text-text-primary mb-1">Select Dealer</label>
                <div 
                  className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white cursor-pointer flex items-center justify-between hover:border-primary/50 transition-colors"
                  onClick={() => setIsDealerOpen(!isDealerOpen)}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Store className="text-text-secondary shrink-0" size={16} />
                    <span className={`truncate ${selectedDealer ? "text-text-primary" : "text-text-secondary"}`}>
                      {selectedDealer ? `${selectedDealer.name} (${selectedDealer.category})` : "Search and select dealer..."}
                    </span>
                  </div>
                  <ChevronDown size={16} className="text-text-secondary shrink-0" />
                </div>

                {isDealerOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-50 max-h-60 flex flex-col">
                    <div className="p-2 border-b border-border sticky top-0 bg-white rounded-t-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                        <input 
                            type="text"
                            placeholder="Type to search dealers..."
                            className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={dealerSearch}
                            onChange={(e) => setDealerSearch(e.target.value)}
                            autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                      {filteredDealers.length > 0 ? (
                          filteredDealers.map(d => (
                            <div 
                              key={d.id} 
                              onClick={() => handleDealerSelect(d)}
                              className={`p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-3 ${poData.dealerId === d.id ? 'bg-blue-50' : ''}`}
                            >
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                <Store size={16} className="text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-text-primary">{d.name}</p>
                                <p className="text-xs text-text-secondary">{d.category}</p>
                              </div>
                            </div>
                          ))
                      ) : (
                          <div className="p-4 text-center text-text-secondary text-sm">No dealers found matching "{dealerSearch}"</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Order Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={poData.date}
                  onChange={(e) => setPoData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-text-primary">Order Items</h3>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Searchable Product Dropdown to Add Items */}
                <div className="relative w-full sm:w-72" ref={productRef}>
                  <div 
                    className="w-full px-3 py-2 border border-border rounded-md text-sm bg-white cursor-pointer flex items-center justify-between hover:border-primary/50 transition-colors"
                    onClick={() => setIsProductOpen(!isProductOpen)}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="text-text-secondary shrink-0" size={16} />
                      <span className="text-text-secondary">Search product to add...</span>
                    </div>
                    <ChevronDown size={16} className="text-text-secondary shrink-0" />
                  </div>

                  {isProductOpen && (
                    <div className="absolute top-full right-0 mt-1 w-full sm:w-80 bg-white border border-border rounded-md shadow-lg z-50 max-h-80 flex flex-col">
                      <div className="p-2 border-b border-border sticky top-0 bg-white rounded-t-md">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
                          <input 
                              type="text"
                              placeholder="Type to search products..."
                              className="w-full pl-8 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
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
                                className="p-2 hover:bg-gray-50 rounded-md cursor-pointer flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                  <Package size={16} className="text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                                  <p className="text-xs text-text-secondary">SKU: {p.sku} | In Price: {formatCurrency(p.inPrice)}</p>
                                </div>
                                <Plus size={16} className="text-text-secondary shrink-0" />
                              </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-text-secondary text-sm">No products found matching "{productSearch}"</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dedicated Add Product Button */}
                <Button 
                  size="sm" 
                  icon={Plus} 
                  onClick={handleOpenAddProduct} 
                  className="shrink-0 whitespace-nowrap"
                >
                  Add Product
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3 w-[40%]">Product</th>
                    <th className="px-4 py-3 w-[15%] text-right">Qty</th>
                    <th className="px-4 py-3 w-[20%] text-right">Unit Price</th>
                    <th className="px-4 py-3 w-[20%] text-right">Total</th>
                    <th className="px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {poData.items.map((item, index) => (
                    <tr key={index} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          min="1"
                          className="w-full p-2 border border-border rounded-md text-sm text-right outline-none focus:border-primary bg-white"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          className="w-full p-2 border border-border rounded-md text-sm text-right outline-none focus:border-primary bg-white"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          className="text-text-secondary hover:text-red-500 transition-colors p-1"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {poData.items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-12 text-center text-text-secondary">
                        <Package size={32} className="mx-auto mb-3 opacity-20" />
                        No items added. Search and select products above to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Payment & Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h3 className="font-semibold text-text-primary mb-4">Payment Details</h3>
            
            <div className="space-y-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Payment Status</label>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-lg">
                        {['Unpaid', 'Partial', 'Paid'].map(type => (
                            <button 
                                key={type}
                                onClick={() => {
                                    setPaymentType(type);
                                    if(type !== 'Partial') setAmountPaid('');
                                }}
                                className={`py-1.5 text-xs font-medium rounded-md transition-all ${paymentType === type ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {paymentType === 'Partial' && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium text-text-primary mb-1">Amount Paid Now</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                            <input 
                                type="number" 
                                className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={amountPaid}
                                onChange={e => setAmountPaid(e.target.value)}
                                placeholder="0.00"
                                max={calculateTotal()}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-4">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-text-primary mt-2">
                <span>Total Amount</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>

              {paymentType !== 'Paid' && (
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-md text-red-700 mt-4">
                      <span className="font-medium">Balance Due</span>
                      <span className="font-bold">
                          {formatCurrency(Math.max(0, calculateTotal() - (paymentType === 'Partial' ? (parseFloat(amountPaid) || 0) : 0)))}
                      </span>
                  </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Comprehensive Quick Add Product Modal */}
      <Modal 
        isOpen={isAddProductModalOpen} 
        onClose={() => setIsAddProductModalOpen(false)}
        title="Quick Add Product to Inventory"
        className="max-w-3xl"
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

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Product ID / SKU <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={newProduct.sku}
                  onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setNewProduct(prev => ({ ...prev, sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase() }))}
                  className="p-2 border border-border rounded-md hover:bg-gray-50 text-text-secondary"
                  title="Generate Random SKU"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>

            <div>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">Search Tags</label>
              <div className="relative">
                <Tag className="absolute left-3 top-2.5 text-text-secondary" size={16} />
                <div className="pl-10">
                  <TagInput 
                    value={productTags}
                    onChange={setProductTags}
                    placeholder="Type tag and press Enter..."
                  />
                </div>
              </div>
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
            <Button type="submit">Save & Add to Order</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
