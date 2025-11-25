import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const VendorBillViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bills, vendors } = useInventory();

  const bill = bills.find(b => b.id === id);
  const vendor = vendors.find(v => v.id === bill?.vendorId);

  if (!bill) return <div>Bill not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/billing/vendor')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Vendor Bill {bill.billNo}</h1>
          <Badge variant={bill.status === 'Paid' ? 'success' : 'warning'}>{bill.status}</Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Printer}>Print</Button>
          <Button variant="secondary" icon={Download}>Download</Button>
        </div>
      </div>

      <Card className="p-8">
        {/* Bill Header */}
        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <h2 className="font-bold text-xl text-text-primary mb-1">{vendor?.company || bill.vendorName}</h2>
            <p className="text-text-secondary text-sm">
              {vendor?.address}<br />
              GSTIN: {vendor?.gstin}<br />
              Phone: {vendor?.phone}
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-text-primary mb-2">PURCHASE BILL</h2>
            <p className="text-text-secondary"># {bill.billNo}</p>
            <p className="text-text-secondary">Date: {bill.date}</p>
          </div>
        </div>

        {/* Bill To (Our Store) */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-2">Billed To</h3>
          <h4 className="text-lg font-bold text-text-primary">ZohoInv Store</h4>
          <p className="text-text-secondary text-sm">
            123, Main Street, Anna Nagar<br />
            Chennai, Tamil Nadu - 600040
          </p>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-50 border-y border-border">
              <th className="py-3 px-4 text-left text-xs font-semibold text-text-secondary uppercase">Item</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-text-secondary uppercase">Qty</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-text-secondary uppercase">Price</th>
              <th className="py-3 px-4 text-right text-xs font-semibold text-text-secondary uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bill.items && bill.items.length > 0 ? (
              bill.items.map((item, idx) => (
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
                  No items found for this bill.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(bill.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax (0%)</span>
              <span>₹0.00</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-text-primary">
              <span>Total</span>
              <span>{formatCurrency(bill.amount)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
