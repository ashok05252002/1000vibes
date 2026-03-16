import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search, User, FileText, Package } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const AddReturnPage = () => {
  const navigate = useNavigate();
  const { customers, invoices, addReturn } = useInventory();
  
  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedItemStr, setSelectedItemStr] = useState(''); // We'll store a stringified JSON to pass multiple values easily
  const [returnQty, setReturnQty] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [reason, setReason] = useState('');
  
  // Get purchased items for selected customer
  const purchasedItems = useMemo(() => {
    if (!selectedCustomerId) return [];
    
    const customerInvoices = invoices.filter(inv => inv.customerId === selectedCustomerId);
    
    // Flatten all items from all invoices
    let items = [];
    customerInvoices.forEach(inv => {
        inv.items.forEach(item => {
            items.push({
                invoiceId: inv.id,
                invoiceNo: inv.invoiceNo,
                date: inv.date,
                productId: item.productId,
                productName: item.productName || 'Unknown Product',
                purchasedQty: item.qty,
                price: item.price,
                // Create a unique key for the dropdown
                uniqueKey: JSON.stringify({
                    invoiceId: inv.id,
                    invoiceNo: inv.invoiceNo,
                    productId: item.productId,
                    productName: item.productName,
                    maxQty: item.qty,
                    price: item.price
                })
            });
        });
    });
    
    // Sort by date descending
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedCustomerId, invoices]);

  // Selected Item Object
  const selectedItem = useMemo(() => {
      if (!selectedItemStr) return null;
      try {
          return JSON.parse(selectedItemStr);
      } catch (e) {
          return null;
      }
  }, [selectedItemStr]);

  // Auto-calculate refund amount when qty changes
  const handleQtyChange = (e) => {
      const qty = parseInt(e.target.value) || 0;
      setReturnQty(e.target.value);
      
      if (selectedItem && qty > 0) {
          // Suggest full refund for the returned qty
          setRefundAmount((qty * selectedItem.price).toString());
      } else {
          setRefundAmount('');
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCustomerId) return alert("Please select a customer.");
    if (!selectedItem) return alert("Please select a product to return.");
    
    const qty = parseInt(returnQty);
    if (!qty || qty <= 0 || qty > selectedItem.maxQty) {
        return alert(`Invalid quantity. Must be between 1 and ${selectedItem.maxQty}`);
    }

    const customer = customers.find(c => c.id === selectedCustomerId);

    const newReturn = {
        id: faker.string.uuid(),
        date: new Date().toISOString().split('T')[0],
        customerId: selectedCustomerId,
        customerName: customer?.name || 'Unknown',
        invoiceId: selectedItem.invoiceId,
        invoiceNo: selectedItem.invoiceNo,
        productId: selectedItem.productId,
        productName: selectedItem.productName,
        qty: qty,
        refundAmount: parseFloat(refundAmount) || 0,
        reason: reason,
        status: 'Pending' // Always starts as pending
    };

    addReturn(newReturn);
    navigate('/returns');
  };

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" size="icon" onClick={() => navigate('/returns')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Process Return</h1>
          <p className="text-text-secondary">Log a returned item and issue refund</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Select Customer */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">1. Select Customer</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                <select 
                    className="w-full pl-9 pr-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                    value={selectedCustomerId}
                    onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        setSelectedItemStr('');
                        setReturnQty('');
                        setRefundAmount('');
                    }}
                    required
                >
                    <option value="">Choose a customer...</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                </select>
            </div>
          </div>

          {/* Step 2: Select Product (Only visible if customer has purchases) */}
          {selectedCustomerId && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">2. Select Purchased Product</label>
                {purchasedItems.length > 0 ? (
                    <div className="relative">
                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
                        <select 
                            className="w-full pl-9 pr-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                            value={selectedItemStr}
                            onChange={(e) => {
                                setSelectedItemStr(e.target.value);
                                setReturnQty('');
                                setRefundAmount('');
                            }}
                            required
                        >
                            <option value="">Select an item from past invoices...</option>
                            {purchasedItems.map((item, idx) => (
                                <option key={idx} value={item.uniqueKey}>
                                    {item.productName} — Inv: {item.invoiceNo} ({item.date}) — Purchased Qty: {item.purchasedQty} @ {formatCurrency(item.price)}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-100 text-sm">
                        This customer has no recorded purchases.
                    </div>
                )}
              </div>
          )}

          {/* Step 3: Return Details (Only visible if product is selected) */}
          {selectedItem && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Return Quantity <span className="text-red-500">*</span></label>
                          <input 
                              type="number" 
                              min="1"
                              max={selectedItem.maxQty}
                              className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                              value={returnQty}
                              onChange={handleQtyChange}
                              placeholder={`Max: ${selectedItem.maxQty}`}
                              required
                          />
                          <p className="text-xs text-text-secondary mt-1">Maximum allowed: {selectedItem.maxQty}</p>
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-text-primary mb-1">Refund Amount <span className="text-red-500">*</span></label>
                          <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                              <input 
                                  type="number" 
                                  step="0.01"
                                  min="0"
                                  className="w-full pl-7 pr-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                  value={refundAmount}
                                  onChange={e => setRefundAmount(e.target.value)}
                                  placeholder="0.00"
                                  required
                              />
                          </div>
                          <p className="text-xs text-text-secondary mt-1">Suggested: {formatCurrency((parseInt(returnQty) || 0) * selectedItem.price)}</p>
                      </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">Reason for Return <span className="text-red-500">*</span></label>
                      <select 
                          className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white mb-2"
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          required
                      >
                          <option value="">Select a reason...</option>
                          <option value="Defective / Damaged">Defective / Damaged</option>
                          <option value="Wrong Item Supplied">Wrong Item Supplied</option>
                          <option value="Customer Changed Mind">Customer Changed Mind</option>
                          <option value="Size / Fit Issue">Size / Fit Issue</option>
                          <option value="Other">Other</option>
                      </select>
                  </div>
              </div>
          )}

          <div className="pt-4 border-t border-border flex justify-end gap-3">
             <Button type="button" variant="secondary" onClick={() => navigate('/returns')}>Cancel</Button>
             <Button type="submit" icon={Save} disabled={!selectedItem}>Submit Return</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
