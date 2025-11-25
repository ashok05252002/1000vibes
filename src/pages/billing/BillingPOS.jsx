import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, UserPlus, ShoppingCart, Save, RefreshCw, Package, Image as ImageIcon } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../../context/InventoryContext';

export const BillingPOS = () => {
  const navigate = useNavigate();
  const { products, customers, addInvoice, addCustomer } = useInventory();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  // Cart State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [cart, setCart] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', area: '' });

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.isActive;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.customerPrice,
        minPrice: product.minCustomerPrice,
        qty: 1,
        total: product.customerPrice,
        image: product.image
      }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const updatePrice = (productId, newPrice) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const price = parseFloat(newPrice) || 0;
        return { ...item, price, total: item.qty * price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSaveInvoice = () => {
    if (!selectedCustomerId) return alert('Please select a customer');
    if (cart.length === 0) return alert('Cart is empty');
    
    // Validate Min Price
    const priceErrors = cart.filter(item => item.price < item.minPrice);
    if (priceErrors.length > 0) {
      return alert(`Price for ${priceErrors[0].name} is below minimum (${formatCurrency(priceErrors[0].minPrice)})`);
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);

    const invoice = {
      id: faker.string.uuid(),
      invoiceNo: 'INV-' + faker.string.numeric(5),
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomerId,
      customerName: customer.name,
      amount: totalAmount,
      status: 'Paid', // Assuming POS is immediate payment usually
      items: cart.map(item => ({
        id: faker.string.uuid(),
        productId: item.productId,
        productName: item.name,
        qty: item.qty,
        price: item.price,
        total: item.total
      }))
    };

    addInvoice(invoice);
    navigate('/history/sales');
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) return;
    
    const created = {
      id: faker.string.uuid(),
      ...newCustomer,
      balance: 0,
      status: 'Active',
      history: []
    };
    addCustomer(created);
    setSelectedCustomerId(created.id);
    setIsAddCustomerOpen(false);
    setNewCustomer({ name: '', phone: '', area: '' });
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 overflow-hidden">
      
      {/* LEFT: Product Catalog */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg border border-border shadow-sm flex flex-col gap-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
            >
              All Items
            </button>
            {PRODUCT_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary hover:bg-gray-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-white border border-border rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all flex flex-col h-full group"
              >
                <div className="aspect-square bg-gray-50 rounded-md mb-3 flex items-center justify-center relative overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-gray-300" size={32} />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>
                <div className="flex-1 flex flex-col">
                  <h4 className="font-medium text-text-primary text-sm line-clamp-2 mb-1" title={product.name}>{product.name}</h4>
                  <p className="text-xs text-text-secondary mb-2">{product.sku}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-primary">{formatCurrency(product.customerPrice)}</span>
                    <Badge variant={product.stock > 0 ? 'success' : 'danger'} className="text-[10px] px-1.5">
                      {product.stock} Left
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-40 text-text-secondary">
                <Search size={32} className="mb-2 opacity-20" />
                <p>No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart & Checkout */}
      <div className="w-full lg:w-[400px] bg-white border border-border rounded-lg shadow-sm flex flex-col h-full shrink-0">
        {/* Customer Selection */}
        <div className="p-4 border-b border-border bg-gray-50 rounded-t-lg">
          <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">Bill To</label>
          <div className="flex gap-2">
            <select 
              className="flex-1 px-3 py-2.5 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
              ))}
            </select>
            <Button variant="primary" size="icon" onClick={() => setIsAddCustomerOpen(true)} title="New Customer">
              <UserPlus size={18} />
            </Button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div key={item.productId} className="flex gap-3 items-start pb-3 border-b border-border last:border-0">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                   {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <Package size={16} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className="text-sm font-medium text-text-primary truncate pr-2">{item.name}</h5>
                    <button onClick={() => removeFromCart(item.productId)} className="text-text-secondary hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border rounded-md">
                      <button onClick={() => updateQty(item.productId, -1)} className="px-2 py-1 hover:bg-gray-100 text-text-secondary"><Minus size={12} /></button>
                      <span className="px-2 text-xs font-medium w-8 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, 1)} className="px-2 py-1 hover:bg-gray-100 text-text-secondary"><Plus size={12} /></button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-text-secondary">₹</span>
                      <input 
                        type="number" 
                        value={item.price}
                        onChange={(e) => updatePrice(item.productId, e.target.value)}
                        className={`w-16 text-right text-sm font-medium border-b border-dashed focus:outline-none ${item.price < item.minPrice ? 'text-red-500 border-red-500' : 'text-text-primary border-gray-300'}`}
                      />
                    </div>
                  </div>
                  {item.price < item.minPrice && (
                    <p className="text-[10px] text-red-500 mt-1">Below Min Price: {formatCurrency(item.minPrice)}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
              <ShoppingCart size={48} className="mb-3" />
              <p>Cart is empty</p>
            </div>
          )}
        </div>

        {/* Footer Totals */}
        <div className="p-4 bg-gray-50 border-t border-border rounded-b-lg">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-text-primary pt-2 border-t border-border">
              <span>Total</span>
              <span>{formatCurrency(cartTotal)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => setCart([])} disabled={cart.length === 0}>
              <RefreshCw size={16} className="mr-2" /> Clear
            </Button>
            <Button onClick={handleSaveInvoice} disabled={cart.length === 0}>
              <Save size={16} className="mr-2" /> Checkout
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Add Customer Modal */}
      <Modal 
        isOpen={isAddCustomerOpen} 
        onClose={() => setIsAddCustomerOpen(false)}
        title="Quick Add Customer"
      >
        <form onSubmit={handleAddCustomer} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Name *</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={newCustomer.name}
              onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Phone *</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={newCustomer.phone}
              onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Area</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              value={newCustomer.area}
              onChange={e => setNewCustomer(prev => ({ ...prev, area: e.target.value }))}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancel</Button>
            <Button type="submit">Save & Select</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
