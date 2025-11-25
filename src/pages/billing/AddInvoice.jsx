import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, UserPlus, AlertCircle, Search } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const AddInvoicePage = () => {
  const { id } = useParams(); // If editing
  const navigate = useNavigate();
  const { customers, products, addInvoice, updateInvoice, invoices, addCustomer } = useInventory();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  
  // Invoice State
  const [invoiceData, setInvoiceData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    items: []
  });

  // New Customer Form State
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', area: '' });

  // Load data if editing
  useEffect(() => {
    if (id) {
      const existingInvoice = invoices.find(i => i.id === id);
      if (existingInvoice) {
        setInvoiceData(existingInvoice);
        setIsEditMode(true);
      }
    }
  }, [id, invoices]);

  // --- Handlers ---

  const handleCustomerChange = (e) => {
    setInvoiceData(prev => ({ ...prev, customerId: e.target.value }));
  };

  const handleAddItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [
        ...prev.items, 
        { id: Date.now(), productId: '', qty: 1, price: 0, minPrice: 0, total: 0, error: '' }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = [...invoiceData.items];
    newItems.splice(index, 1);
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    const item = { ...newItems[index] };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productId = value;
        item.price = product.customerPrice;
        item.minPrice = product.minCustomerPrice;
        item.qty = 1;
      }
    } else if (field === 'qty') {
      item.qty = parseInt(value) || 0;
    } else if (field === 'price') {
      const newPrice = parseFloat(value) || 0;
      item.price = newPrice;
      
      // Price Validation
      if (newPrice < item.minPrice) {
        item.error = `Min Price: ${item.minPrice}`;
      } else {
        item.error = '';
      }
    }

    item.total = item.qty * item.price;
    newItems[index] = item;
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const handleSaveInvoice = () => {
    // Final Validation
    if (!invoiceData.customerId) return alert('Please select a customer');
    if (invoiceData.items.length === 0) return alert('Add at least one item');
    if (invoiceData.items.some(i => i.error)) return alert('Fix price errors before saving');

    const customer = customers.find(c => c.id === invoiceData.customerId);
    const totalAmount = invoiceData.items.reduce((acc, item) => acc + item.total, 0);

    const payload = {
      ...invoiceData,
      id: isEditMode ? id : faker.string.uuid(),
      invoiceNo: isEditMode ? invoiceData.invoiceNo : 'INV-' + faker.string.numeric(5),
      customerName: customer.name,
      amount: totalAmount,
    };

    if (isEditMode) {
      updateInvoice(id, payload);
    } else {
      addInvoice(payload);
    }
    navigate('/billing/customer');
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
    setInvoiceData(prev => ({ ...prev, customerId: created.id }));
    setIsAddCustomerOpen(false);
    setNewCustomer({ name: '', phone: '', area: '' });
  };

  const calculateTotal = () => invoiceData.items.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-surface z-10 py-4 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/billing/customer')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{isEditMode ? 'Edit Invoice' : 'New Invoice'}</h1>
            <p className="text-sm text-text-secondary">{invoiceData.invoiceNo || 'Draft'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/billing/customer')}>Cancel</Button>
          <Button icon={Save} onClick={handleSaveInvoice}>Save Invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer & Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Customer</label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    value={invoiceData.customerId}
                    onChange={handleCustomerChange}
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                  <Button variant="secondary" size="icon" onClick={() => setIsAddCustomerOpen(true)} title="Add New Customer">
                    <UserPlus size={18} />
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Invoice Date</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={invoiceData.date}
                  onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-text-primary">Line Items</h3>
              <Button size="sm" variant="secondary" icon={Plus} onClick={handleAddItem}>Add Item</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
                  <tr>
                    <th className="px-4 py-3 w-[40%]">Product</th>
                    <th className="px-4 py-3 w-[15%] text-right">Qty</th>
                    <th className="px-4 py-3 w-[20%] text-right">Price</th>
                    <th className="px-4 py-3 w-[20%] text-right">Total</th>
                    <th className="px-4 py-3 w-[5%]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoiceData.items.map((item, index) => (
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">
                        <select 
                          className="w-full p-2 border border-border rounded-md text-sm outline-none focus:border-primary"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        >
                          <option value="">Select Product</option>
                          {products.filter(p => p.isActive).map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          min="1"
                          className="w-full p-2 border border-border rounded-md text-sm text-right outline-none focus:border-primary"
                          value={item.qty}
                          onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <input 
                            type="number" 
                            className={`w-full p-2 border rounded-md text-sm text-right outline-none focus:ring-1 ${item.error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:border-primary'}`}
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          />
                          {item.error && (
                            <div className="absolute right-0 -bottom-5 text-[10px] text-red-600 font-medium flex items-center gap-1 bg-white px-1 z-10">
                              <AlertCircle size={10} /> {item.error}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          className="text-text-secondary hover:text-red-500 transition-colors"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {invoiceData.items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-text-secondary">
                        No items added. Click "Add Item" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24">
            <h3 className="font-semibold text-text-primary mb-4">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax (0%)</span>
                <span>₹0.00</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg text-text-primary">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Customer Modal */}
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
