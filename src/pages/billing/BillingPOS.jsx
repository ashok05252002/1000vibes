import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Minus, Trash2, UserPlus, ShoppingCart, Save, RefreshCw, Package, CreditCard, Barcode, X, LayoutGrid, List, ArrowRight, Phone, MapPin, Check, Printer, CheckCircle, ChevronDown, Wallet } from 'lucide-react';
import { faker } from '@faker-js/faker';
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
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  const searchInputRef = useRef(null);
  
  // Customer Search State
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef(null);

  // Cart State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [cart, setCart] = useState([]);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', area: '' });

  // Checkout Modal State
  const [paymentType, setPaymentType] = useState('Full'); // 'Full' or 'Partial'
  const [tenderedAmount, setTenderedAmount] = useState('');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.isActive;
    });
  }, [products, searchQuery, selectedCategory]);

  // Filter Customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customers.slice(0, 5);
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
      c.phone.includes(customerSearchTerm)
    );
  }, [customers, customerSearchTerm]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // --- Handlers ---

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
        standardPrice: product.customerPrice,
        minPrice: product.minCustomerPrice,
        qty: 1,
        total: product.customerPrice,
        image: product.image
      }];
    });
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.sku.toLowerCase() === barcodeInput.toLowerCase() || p.name.toLowerCase() === barcodeInput.toLowerCase());
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('Product not found');
    }
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

  const handleCheckoutClick = () => {
    if (!selectedCustomerId) return alert('Please select a customer');
    if (cart.length === 0) return alert('Cart is empty');
    
    const priceErrors = cart.filter(item => item.price < item.minPrice);
    if (priceErrors.length > 0) {
      return alert(`Price for ${priceErrors[0].name} is below minimum (${formatCurrency(priceErrors[0].minPrice)})`);
    }

    // Reset checkout state
    setPaymentType('Full');
    setTenderedAmount('');
    setIsCheckoutModalOpen(true);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  const processInvoice = (shouldPrint) => {
    const customer = customers.find(c => c.id === selectedCustomerId);
    const invoiceId = faker.string.uuid();
    
    // Determine Paid Amount
    let finalPaidAmount = 0;
    if (paymentType === 'Full') {
        finalPaidAmount = cartTotal;
    } else {
        finalPaidAmount = parseFloat(tenderedAmount) || 0;
    }

    const invoice = {
      id: invoiceId,
      invoiceNo: 'INV-' + faker.string.numeric(5),
      date: new Date().toISOString().split('T')[0],
      customerId: selectedCustomerId,
      customerName: customer.name,
      amount: cartTotal,
      paidAmount: finalPaidAmount,
      // status will be calculated in context based on paidAmount vs amount
      paymentMode: paymentMode,
      items: cart.map(item => ({
        id: faker.string.uuid(),
        productId: item.productId,
        productName: item.name,
        qty: item.qty,
        price: item.price,
        standardPrice: item.standardPrice || item.price,
        total: item.total
      }))
    };

    addInvoice(invoice);
    setIsCheckoutModalOpen(false);
    setIsMobileCartOpen(false);

    setCart([]);
    setSelectedCustomerId('');
    setCustomerSearchTerm('');
    setPaymentMode('Cash');
    setBarcodeInput('');
    setSearchQuery('');

    setSuccessMessage(`Invoice ${invoice.invoiceNo} saved successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);

    if (shouldPrint) {
      window.open(`/billing/customer/${invoiceId}`, '_blank');
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearchTerm(customer.name);
    setIsCustomerDropdownOpen(false);
  };

  const handleAddNewClick = () => {
    const isPhone = /^\d+$/.test(customerSearchTerm);
    setNewCustomer({
      name: isPhone ? '' : customerSearchTerm,
      phone: isPhone ? customerSearchTerm : '',
      area: ''
    });
    setIsAddCustomerOpen(true);
    setIsCustomerDropdownOpen(false);
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
    setCustomerSearchTerm(created.name);
    setIsAddCustomerOpen(false);
    setNewCustomer({ name: '', phone: '', area: '' });
  };

  // --- Cart Content Render Logic ---
  const renderCartContent = () => (
    <div className="flex flex-col h-full">
      {/* Cart Header */}
      <div className="p-4 border-b border-border bg-gray-50 shrink-0">
        <div className="relative mb-3" ref={customerDropdownRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              className="w-full pl-9 pr-10 py-2.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-white shadow-sm"
              placeholder="Search Customer..."
              value={customerSearchTerm}
              onChange={(e) => {
                setCustomerSearchTerm(e.target.value);
                setIsCustomerDropdownOpen(true);
                if(selectedCustomerId && e.target.value !== selectedCustomer?.name) {
                    setSelectedCustomerId('');
                }
              }}
              onFocus={() => setIsCustomerDropdownOpen(true)}
            />
            {selectedCustomerId ? (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600">
                  <Check size={16} />
                </div>
            ) : (
                <button 
                onClick={handleAddNewClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded text-primary"
                title="Add New"
                >
                  <UserPlus size={18} />
                </button>
            )}
          </div>

          {isCustomerDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-border max-h-60 overflow-y-auto z-50">
              {filteredCustomers.length > 0 ? (
                <>
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex justify-between items-center group"
                    >
                      <div>
                        <p className="font-medium text-sm text-text-primary group-hover:text-primary">{c.name}</p>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <Phone size={10} /> {c.phone}
                        </p>
                      </div>
                      <div className="text-right">
                          {c.city && <span className="text-xs text-text-muted bg-gray-100 px-2 py-0.5 rounded block mb-1">{c.city}</span>}
                          {c.balance > 0 && <span className="text-xs text-red-500 font-medium">Due: {formatCurrency(c.balance)}</span>}
                      </div>
                    </button>
                  ))}
                  <div className="p-2 bg-gray-50 border-t border-border sticky bottom-0">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full justify-center" 
                        icon={UserPlus}
                        onClick={handleAddNewClick}
                      >
                        Add "{customerSearchTerm}"
                      </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-text-secondary mb-3">No customer found.</p>
                  <Button className="w-full" icon={Plus} onClick={handleAddNewClick}>Add New Customer</Button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-text-secondary uppercase font-semibold tracking-wider">
            <span>Current Order</span>
            <span>{cart.length} Items</span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.productId} className="flex gap-3 group p-2 rounded-lg border border-transparent hover:border-border hover:bg-gray-50 transition-all">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center shrink-0 overflow-hidden border border-border">
                  {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <Package size={16} className="text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-medium text-text-primary truncate pr-2">{item.name}</h5>
                  <span className="text-sm font-bold text-text-primary">{formatCurrency(item.total)}</span>
                </div>
                
                {/* Price Difference Display */}
                {item.price < item.standardPrice && (
                    <div className="flex items-center gap-1 text-[10px] text-red-500 mb-1">
                        <span className="line-through text-gray-400">{formatCurrency(item.standardPrice)}</span>
                        <span className="font-medium">(-{formatCurrency(item.standardPrice - item.price)})</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-white border border-border rounded-md h-7">
                    <button onClick={() => updateQty(item.productId, -1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-text-secondary"><Minus size={12} /></button>
                    <span className="w-8 text-center text-xs font-semibold border-x border-border h-full flex items-center justify-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, 1)} className="w-7 h-full flex items-center justify-center hover:bg-gray-100 text-text-secondary"><Plus size={12} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={item.price}
                        onChange={(e) => updatePrice(item.productId, e.target.value)}
                        className={`w-16 text-right text-xs font-medium bg-transparent border-b border-dashed focus:outline-none py-1 ${item.price < item.minPrice ? 'text-red-500 border-red-500' : 'text-text-secondary border-gray-300'}`}
                    />
                    <button onClick={() => removeFromCart(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-40 space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={32} />
            </div>
            <p className="text-sm font-medium">Cart is empty</p>
          </div>
        )}
      </div>

      {/* Footer Totals */}
      <div className="p-5 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-text-primary pt-2 border-t border-dashed border-border mt-2">
            <span>Total</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
            {['Cash', 'UPI', 'Card'].map(mode => (
            <button
              key={mode}
              onClick={() => setPaymentMode(mode)}
              className={`py-2 text-xs font-bold rounded-md border transition-all ${
                paymentMode === mode 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-white text-text-secondary border-border hover:border-gray-400'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCart([])} disabled={cart.length === 0} className="px-3">
                <RefreshCw size={18} />
            </Button>
            <Button onClick={handleCheckoutClick} disabled={cart.length === 0} className="flex-1 py-3 text-base shadow-lg shadow-primary/20">
                Checkout <ArrowRight className="ml-2" size={18} />
            </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col overflow-hidden bg-gray-100 -m-4 lg:-m-8 relative">
      
      {/* Success Toast */}
      {successMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-5">
          <CheckCircle size={20} />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Top Bar: Search & Barcode */}
      <div className="bg-white border-b border-border px-4 py-3 flex flex-col md:flex-row items-center gap-3 shrink-0 z-10">
        <div className="w-full md:flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        
        <form onSubmit={handleBarcodeSubmit} className="w-full md:w-64 relative">
          <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Scan Barcode..." 
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 focus:bg-white transition-colors"
          />
        </form>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT: Categories Sidebar */}
        <div className="hidden lg:flex w-20 xl:w-64 bg-white border-r border-border flex-col overflow-y-auto custom-scrollbar shrink-0">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`p-4 flex flex-col xl:flex-row items-center gap-3 transition-colors border-b border-border/50 ${selectedCategory === 'All' ? 'bg-primary/5 text-primary border-r-4 border-r-primary' : 'text-text-secondary hover:bg-gray-50'}`}
          >
            <div className={`p-2 rounded-md ${selectedCategory === 'All' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                <LayoutGrid size={20} />
            </div>
            <span className="text-xs xl:text-sm font-medium text-center xl:text-left">All Items</span>
          </button>
          
          {PRODUCT_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`p-4 flex flex-col xl:flex-row items-center gap-3 transition-colors border-b border-border/50 ${selectedCategory === cat ? 'bg-primary/5 text-primary border-r-4 border-r-primary' : 'text-text-secondary hover:bg-gray-50'}`}
            >
              <div className={`p-2 rounded-md ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-200'}`}>
                  <Package size={20} />
              </div>
              <span className="text-xs xl:text-sm font-medium text-center xl:text-left line-clamp-2">{cat}</span>
            </button>
          ))}
        </div>

        {/* MAIN: Product Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile Categories */}
            <div className="lg:hidden bg-white border-b border-border overflow-x-auto flex items-center gap-2 p-2 shrink-0 no-scrollbar">
                <button 
                    onClick={() => setSelectedCategory('All')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${selectedCategory === 'All' ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border'}`}
                >
                    <LayoutGrid size={14} /> All
                </button>
                {PRODUCT_CATEGORIES.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${selectedCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white text-text-secondary border-border'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-100 pb-24 lg:pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                    {filteredProducts.map(product => (
                    <div 
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="bg-white rounded-xl p-3 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group border border-transparent hover:border-primary/30 relative"
                    >
                        <div className="aspect-[4/3] bg-gray-50 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <Package className="text-gray-300" size={32} />
                            )}
                            <div className="absolute top-2 right-2">
                                <Badge variant={product.stock > 0 ? 'success' : 'danger'} className="text-[10px] px-1.5 shadow-sm bg-white/90 backdrop-blur-sm">
                                    {product.stock}
                                </Badge>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col">
                            <h4 className="font-semibold text-text-primary text-sm line-clamp-2 mb-1 leading-tight" title={product.name}>{product.name}</h4>
                            <p className="text-xs text-text-secondary mb-2">{product.sku}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="font-bold text-base text-primary">{formatCurrency(product.customerPrice)}</span>
                                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                    <Plus size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT: Cart Sidebar (Desktop) */}
        <div className="hidden lg:flex w-96 bg-white border-l border-border flex-col shadow-xl shrink-0 z-20">
            {renderCartContent()}
        </div>

        {/* MOBILE: Bottom Cart Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-3 z-30">
            <div className="flex items-center gap-3">
                <div className="flex-1">
                    <p className="text-xs text-text-secondary">{cart.length} Items</p>
                    <p className="text-lg font-bold text-text-primary">{formatCurrency(cartTotal)}</p>
                </div>
                <Button 
                    className="px-6" 
                    onClick={() => setIsMobileCartOpen(true)}
                    icon={ShoppingCart}
                >
                    View Cart
                </Button>
            </div>
        </div>

        {/* MOBILE: Cart Drawer */}
        {isMobileCartOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)} />
                <div className="absolute inset-x-0 bottom-0 top-10 bg-white rounded-t-2xl flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                            <ShoppingCart size={20} /> Current Order
                        </h3>
                        <button onClick={() => setIsMobileCartOpen(false)} className="p-2 bg-gray-100 rounded-full">
                            <ChevronDown size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {renderCartContent()}
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Quick Add Customer Modal */}
      <Modal 
        isOpen={isAddCustomerOpen} 
        onClose={() => setIsAddCustomerOpen(false)}
        title="Add New Customer"
        className="max-w-2xl"
      >
        <form onSubmit={handleAddCustomer} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-primary mb-1">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2.5 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newCustomer.name}
                    onChange={e => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Amit Sharma"
                    required
                    autoFocus
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <UserPlus size={18} />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2.5 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newCustomer.phone}
                    onChange={e => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="98765 43210"
                    required
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <Phone size={18} />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Area / City</label>
                <div className="relative">
                    <input 
                    type="text" 
                    className="w-full pl-10 pr-3 py-2.5 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={newCustomer.area}
                    onChange={e => setNewCustomer(prev => ({ ...prev, area: e.target.value }))}
                    placeholder="e.g. Anna Nagar"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                        <MapPin size={18} />
                    </div>
                </div>
            </div>
          </div>
          
          <div className="pt-6 flex justify-end gap-3 border-t border-border mt-4">
            <Button type="button" variant="secondary" onClick={() => setIsAddCustomerOpen(false)}>Cancel</Button>
            <Button type="submit" className="px-8">Save & Select Customer</Button>
          </div>
        </form>
      </Modal>

      {/* Checkout Confirmation Modal */}
      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Checkout"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-border space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">Customer</span>
              <span className="font-medium text-text-primary">{selectedCustomer?.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">Total Items</span>
              <span className="font-medium text-text-primary">{cart.length}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-text-secondary text-sm">Payment Mode</span>
              <span className="font-medium text-text-primary">{paymentMode}</span>
            </div>
          </div>

          {/* Payment Type Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg">
              <button 
                  onClick={() => setPaymentType('Full')}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${paymentType === 'Full' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                  Full Payment
              </button>
              <button 
                  onClick={() => setPaymentType('Partial')}
                  className={`py-2 text-sm font-medium rounded-md transition-all ${paymentType === 'Partial' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                  Partial / Credit
              </button>
          </div>

          {/* Partial Payment Input */}
          {paymentType === 'Partial' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Amount Paid Now</label>
                      <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                          <input 
                              type="number" 
                              className="w-full pl-7 pr-3 py-2.5 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                              value={tenderedAmount}
                              onChange={e => setTenderedAmount(e.target.value)}
                              placeholder="0.00"
                              max={cartTotal}
                          />
                      </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-md text-red-700">
                      <span className="text-sm font-medium">Balance Due</span>
                      <span className="font-bold">{formatCurrency(Math.max(0, cartTotal - (parseFloat(tenderedAmount) || 0)))}</span>
                  </div>
              </div>
          )}

          {/* Total Summary */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-text-primary font-medium text-lg">Total Bill Amount</span>
              <span className="font-bold text-primary text-2xl">{formatCurrency(cartTotal)}</span>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              className="w-full py-3 text-base" 
              icon={Printer} 
              onClick={() => processInvoice(true)}
            >
              Confirm & Print Bill
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              icon={Check}
              onClick={() => processInvoice(false)}
            >
              Confirm & Save Only
            </Button>
            <Button 
              variant="ghost" 
              className="w-full text-text-secondary" 
              onClick={() => setIsCheckoutModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
