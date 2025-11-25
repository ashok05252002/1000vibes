import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Plus, Search, ShoppingCart, Filter, Download, Eye, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/utils';

// Dummy Data
const generateBills = (count) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    billNo: 'BILL-' + faker.string.numeric(5),
    date: faker.date.recent({ days: 45 }).toLocaleDateString('en-IN'),
    vendor: faker.company.name(),
    amount: parseFloat(faker.finance.amount({ min: 2000, max: 80000, dec: 2 })),
    status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
    items: faker.number.int({ min: 5, max: 20 })
  })).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const VendorBillingPage = () => {
  const [bills] = useState(() => generateBills(8));
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vendor Bills</h1>
          <p className="text-text-secondary mt-1">Manage purchases and vendor payments</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search bills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <Button icon={Plus}>New Bill</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-purple-50 border-purple-100 p-4">
          <p className="text-sm font-medium text-purple-800">Total Purchases</p>
          <h3 className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(320000)}</h3>
        </Card>
        <Card className="bg-red-50 border-red-100 p-4">
          <p className="text-sm font-medium text-red-800">Overdue Bills</p>
          <h3 className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(12000)}</h3>
        </Card>
        <Card className="bg-gray-50 border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-800">Active Vendors</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">12</h3>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Bill #</th>
                <th className="px-6 py-3">Vendor</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                    {bill.date}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-primary font-medium">
                    {bill.billNo}
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {bill.vendor}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatCurrency(bill.amount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge 
                      variant={
                        bill.status === 'Paid' ? 'success' : 
                        bill.status === 'Overdue' ? 'danger' : 'warning'
                      }
                    >
                      {bill.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" title="Download">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 text-text-secondary hover:bg-gray-100 rounded-md">
                        <MoreHorizontal size={16} />
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
