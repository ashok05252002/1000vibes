import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const CustomerBillingPage = () => {
  const navigate = useNavigate();
  const { invoices } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Invoices</h1>
          <p className="text-text-secondary mt-1">Manage sales and billing for customers</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <Button icon={Plus} onClick={() => navigate('/billing/customer/add')}>New Invoice</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((inv) => (
                <tr 
                  key={inv.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/billing/customer/${inv.id}`)}
                >
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">{inv.date}</td>
                  <td className="px-6 py-4 font-mono text-xs text-primary font-medium">{inv.invoiceNo}</td>
                  <td className="px-6 py-4 font-medium text-text-primary">{inv.customerName}</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" 
                        title="View"
                        onClick={() => navigate(`/billing/customer/${inv.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" title="Download">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
