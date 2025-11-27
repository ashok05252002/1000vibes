import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, MoreHorizontal } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const VendorBillingPage = () => {
  const navigate = useNavigate();
  const { bills } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredBills = bills.filter(bill => 
    bill.billNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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

      <Card className="overflow-hidden flex flex-col">
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
              {paginatedBills.map((bill) => (
                <tr 
                  key={bill.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/billing/vendor/${bill.id}`)}
                >
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                    {bill.date}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-primary font-medium">
                    {bill.billNo}
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {bill.vendorName}
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
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" 
                        title="View"
                        onClick={() => navigate(`/billing/vendor/${bill.id}`)}
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
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredBills.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
