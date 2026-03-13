import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Store, CheckCircle, AlertCircle, CreditCard, Calendar, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const PurchaseOrderViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, dealers, recordPOPayment } = useInventory();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'Bank Transfer',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const po = purchaseOrders.find(p => p.id === id);
  const dealer = dealers.find(d => d.id === po?.dealerId);

  if (!po) return <div>Purchase Order not found</div>;

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    
    if (!amount || amount <= 0) return alert('Enter a valid amount');
    if (amount > po.dueAmount) return alert('Amount cannot exceed balance due');

    recordPOPayment(po.id, amount, paymentForm.mode, paymentForm.date, paymentForm.notes);
    setIsPaymentModalOpen(false);
    setPaymentForm({ amount: '', mode: 'Bank Transfer', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Order {po.poNo}</h1>
          <Badge variant={po.status === 'Received' ? 'success' : 'default'}>{po.status}</Badge>
          <Badge variant={po.paymentStatus === 'Paid' ? 'success' : po.paymentStatus === 'Partial' ? 'warning' : 'danger'}>
            {po.paymentStatus}
          </Badge>
        </div>
        <div className="flex gap-3 print:hidden">
          {po.dueAmount > 0 && (
            <Button icon={CreditCard} onClick={() => setIsPaymentModalOpen(true)}>
              Record Payment
            </Button>
          )}
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print PO</Button>
        </div>
      </div>

      <Card className="p-8 print:shadow-none print:border-none mb-6">
        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">PURCHASE ORDER</h2>
            <p className="text-text-secondary"># {po.poNo}</p>
            <p className="text-text-secondary">Date: {po.date}</p>
          </div>
          <div className="text-right">
            <h2 className="font-bold text-xl text-text-primary">Store Admin</h2>
            <p className="text-text-secondary text-sm mt-1">
              123, Main Street, Anna Nagar<br />
              Chennai, Tamil Nadu - 600040
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-2 flex items-center gap-2">
              <Store size={16} /> Vendor / Dealer
          </h3>
          <h4 className="text-lg font-bold text-text-primary">{dealer?.name || po.dealerName}</h4>
          <p className="text-text-secondary text-sm">
            {dealer?.category && <><Badge variant="default" className="mt-1 mb-2">{dealer.category}</Badge><br /></>}
            Phone: {dealer?.phone}<br />
            Email: {dealer?.email}
          </p>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-50 border-y border-border">
              <th className="py-3 px-4 text-left text-xs font-semibold text-text-secondary uppercase">Product</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-text-secondary uppercase">Qty</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-text-secondary uppercase">Unit Price</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-text-secondary uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {po.items && po.items.length > 0 ? (
              po.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 text-sm text-text-primary font-medium">
                    {item.productName}
                  </td>
                  <td className="py-4 px-4 text-sm text-text-primary text-right">{item.qty}</td>
                  <td className="py-4 px-4 text-sm text-text-primary text-right">{formatCurrency(item.price)}</td>
                  <td className="py-4 px-4 text-sm text-text-primary text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-text-secondary italic">
                  No items found for this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-72 space-y-3">
            <div className="flex justify-between text-base font-bold text-text-primary border-b border-border pb-2">
              <span>Total Amount</span>
              <span>{formatCurrency(po.amount)}</span>
            </div>

            <div className="flex justify-between text-sm text-green-700 pt-1">
              <span className="flex items-center gap-1"><CheckCircle size={14}/> Paid Amount</span>
              <span>{formatCurrency(po.paidAmount)}</span>
            </div>

            {po.dueAmount > 0 && (
              <div className="flex justify-between text-base font-bold text-red-600 bg-red-50 p-2 rounded-md border border-red-100 mt-2">
                <span className="flex items-center gap-1"><AlertCircle size={16}/> Balance Due</span>
                <span>{formatCurrency(po.dueAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Payment History Section */}
      <Card className="overflow-hidden print:hidden">
        <div className="p-4 border-b border-border bg-gray-50 flex items-center gap-2">
          <FileText size={18} className="text-text-secondary" />
          <h3 className="font-semibold text-text-primary">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3">Notes / Ref</th>
                <th className="px-6 py-3 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {po.paymentHistory && po.paymentHistory.length > 0 ? (
                po.paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-text-primary flex items-center gap-2">
                      <Calendar size={14} className="text-text-secondary" />
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{payment.mode}</td>
                    <td className="px-6 py-4 text-text-secondary">{payment.notes || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-green-600">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-text-secondary">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record PO Payment"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-blue-800 font-medium">Order #{po.poNo}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-red-600 font-medium">Current Balance Due:</span>
              <span className="font-bold text-red-700">{formatCurrency(po.dueAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount Paying Now *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
              <input 
                type="number" 
                className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={paymentForm.amount}
                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                max={po.dueAmount}
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Payment Mode</label>
            <select 
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={paymentForm.mode}
              onChange={e => setPaymentForm({...paymentForm, mode: e.target.value})}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI / GPay</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Payment Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              value={paymentForm.date}
              onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Notes / Reference</label>
            <textarea 
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
              rows={2}
              value={paymentForm.notes}
              onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
              placeholder="e.g. Cheque No, UTR Number"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
