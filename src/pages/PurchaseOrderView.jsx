import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Store, CheckCircle, AlertCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const PurchaseOrderViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, dealers } = useInventory();

  const po = purchaseOrders.find(p => p.id === id);
  const dealer = dealers.find(d => d.id === po?.dealerId);

  if (!po) return <div>Purchase Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Order {po.poNo}</h1>
          <Badge variant={po.status === 'Received' ? 'success' : 'default'}>{po.status}</Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print PO</Button>
        </div>
      </div>

      <Card className="p-8 print:shadow-none print:border-none">
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
    </div>
  );
};
