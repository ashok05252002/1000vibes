import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Printer, Download, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const InvoiceViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, customers } = useInventory();

  const invoice = invoices.find(i => i.id === id);
  const customer = customers.find(c => c.id === invoice?.customerId);

  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/billing/customer')}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">Invoice {invoice.invoiceNo}</h1>
          <Badge variant={invoice.status === 'Paid' ? 'success' : 'warning'}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Printer}>Print</Button>
          <Button icon={Edit2} onClick={() => navigate(`/billing/customer/edit/${id}`)}>Edit</Button>
        </div>
      </div>

      <Card className="p-8">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-border pb-8 mb-8">
          <div>
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xl mb-4">
              Z
            </div>
            <h2 className="font-bold text-xl text-text-primary">ZohoInv Store</h2>
            <p className="text-text-secondary text-sm mt-1">
              123, Main Street, Anna Nagar<br />
              Chennai, Tamil Nadu - 600040<br />
              Phone: +91 98765 43210
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-text-primary mb-2">INVOICE</h2>
            <p className="text-text-secondary"># {invoice.invoiceNo}</p>
            <p className="text-text-secondary">Date: {invoice.date}</p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-text-secondary uppercase mb-2">Bill To</h3>
          <h4 className="text-lg font-bold text-text-primary">{customer?.name || invoice.customerName}</h4>
          <p className="text-text-secondary text-sm">
            {customer?.company && <>{customer.company}<br /></>}
            {customer?.city}<br />
            {customer?.phone}
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
            {invoice.items && invoice.items.length > 0 ? (
              invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 px-4 text-sm text-text-primary font-medium">
                    {/* In a real app, we'd lookup product name if only ID is stored, 
                        but assuming we store snapshot or lookup here */}
                    Product ID: {item.productId} 
                  </td>
                  <td className="py-4 px-4 text-sm text-text-primary text-right">{item.qty}</td>
                  <td className="py-4 px-4 text-sm text-text-primary text-right">{formatCurrency(item.price)}</td>
                  <td className="py-4 px-4 text-sm text-text-primary text-right font-medium">{formatCurrency(item.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="py-8 text-center text-text-secondary italic">
                  No specific items (Legacy Data)
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
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-text-secondary">
              <span>Tax (0%)</span>
              <span>₹0.00</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between text-lg font-bold text-text-primary">
              <span>Total</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
