import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Store } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const AddPurchaseOrderPage = () => {
  const navigate = useNavigate();
  const { dealers, products, addPurchaseOrder } = useInventory();
  
  const [poData, setPoData] = useState({
    dealerId: '',
    date: new Date().toISOString().split('T')[0],
    items: []
  });

  const [paymentType, setPaymentType] = useState('Unpaid'); // 'Unpaid', 'Partial', 'Paid'
  const [amountPaid, setAmountPaid] = useState('');

  // --- Handlers ---
  const handleDealerChange = (e) => {
    setPoData(prev => ({ ...prev, dealerId: e.target.value }));
  };

  const handleAddItem = () => {
    setPoData(prev => ({
      ...prev,
      items: [
        ...prev.items, 
        { id: Date.now(), productId: '', qty: 1, price: 0, total: 0 }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    const newItems = [...poData.items];
    newItems.splice(index, 1);
    setPoData(prev => ({ ...prev, items: newItems }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...poData.items];
    const item = { ...newItems[index] };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productId = value;
        item.price = product.inPrice; // Default to purchase price
        item.qty = 1;
      }
    } else if (field === 'qty') {
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
    if (poData.items.some(i => !i.productId)) return alert('Please select a product for all items');

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
      items: poData.items.map(item => {
        const p = products.find(prod => prod.id === item.productId);
        return {
            productId: item.productId,
            productName: p ? p.name : 'Unknown Product',
            qty: item.qty,
            price: item.price,
            total: item.total
        };
      })
    };

    addPurchaseOrder(newPO);
    navigate('/purchase-orders');
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
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Select Dealer</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                      <select 
                        className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                        value={poData.dealerId}
                        onChange={handleDealerChange}
                      >
                        <option value="">Choose a dealer...</option>
                        {dealers.map(d => (
                          <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                        ))}
                      </select>
                  </div>
                </div>
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
            <div className="p-4 bg-gray-50 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold text-text-primary">Order Items</h3>
              <Button size="sm" variant="secondary" icon={Plus} onClick={handleAddItem}>Add Item</Button>
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
                    <tr key={index} className="bg-white">
                      <td className="px-4 py-3">
                        <select 
                          className="w-full p-2 border border-border rounded-md text-sm outline-none focus:border-primary"
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        >
                          <option value="">Select Product...</option>
                          {products.map(p => (
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
                        <input 
                          type="number" 
                          className="w-full p-2 border border-border rounded-md text-sm text-right outline-none focus:border-primary"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                        />
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
                  {poData.items.length === 0 && (
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
    </div>
  );
};
