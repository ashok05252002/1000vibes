import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Printer, Download, Mail } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const InvoiceViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { invoices, customers } = useInventory();

  const invoice = invoices.find(i => i.id === id);
  const customer = customers.find(c => c.id === invoice?.customerId);

  if (!invoice) return <div>Invoice not found</div>;

  const handleBack = () => {
    // Check if we have a specific "from" state (e.g. from Customer Details)
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Default fallback
      navigate('/billing/customer');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={handleBack}>
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
            <div className="mb-4">
              <img 
                src="https://instagram.fmaa14-1.fna.fbcdn.net/v/t51.2885-19/500219006_18001998884783983_3438514892580265006_n.jpg?stp=dst-jpg_s150x150_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLmRqYW5nby4xMDgwLmMyIn0&_nc_ht=instagram.fmaa14-1.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QEfOpbU9ZMKU5TI4Sqc1sH2jDuMNtcv0zK4nPpvUU87zfdsVmfUFJPBHJjO8WOvxkw&_nc_ohc=kuQoul11oXsQ7kNvwH5oVil&_nc_gid=S_R4300eyON5nCMx_JDBLA&edm=ALGbJPMBAAAA&ccb=7-5&oh=00_AfjV91XR_y-RLWj9Krw_qlLv1V_QP97XPGq4VBOuC88fww&oe=692B5125&_nc_sid=7d3ac5" 
                alt="Logo" 
                className="w-16 h-16 rounded-full object-cover border border-border"
              />
            </div>
            <h2 className="font-bold text-xl text-text-primary">Store Admin</h2>
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
                    {item.productName || `Product ID: ${item.productId}`} 
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
