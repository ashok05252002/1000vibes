import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, ShoppingBag } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const PurchaseOrdersPage = () => {
  const navigate = useNavigate();
  const { purchaseOrders } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = purchaseOrders.filter(po => 
    po.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.dealerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Purchase Orders</h1>
          <p className="text-text-secondary mt-1">Manage orders placed with dealers</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <Button icon={Plus} onClick={() => navigate('/purchase-orders/add')}>New Purchase Order</Button>
        </div>
      </div>

      <Card className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">PO #</th>
                <th className="px-6 py-3">Dealer</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-right">Balance Due</th>
                <th className="px-6 py-3 text-center">Payment Status</th>
                <th className="px-6 py-3 text-center">Order Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrders.map((po) => (
                <tr 
                  key={po.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/purchase-orders/${po.id}`)}
                >
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                    {po.date}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-primary font-medium">
                    {po.poNo}
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {po.dealerName}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {formatCurrency(po.amount)}
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${po.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(po.dueAmount)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge 
                      variant={
                        po.paymentStatus === 'Paid' ? 'success' : 
                        po.paymentStatus === 'Partial' ? 'warning' : 'danger'
                      }
                    >
                      {po.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant={po.status === 'Received' ? 'success' : 'default'}>
                      {po.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" 
                        title="View"
                        onClick={() => navigate(`/purchase-orders/${po.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-text-secondary">
                    No purchase orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
