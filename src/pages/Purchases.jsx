import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardCheck, PackageCheck, AlertTriangle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { useInventory } from '../context/InventoryContext';

export const PurchasesPage = () => {
  const navigate = useNavigate();
  const { purchaseOrders } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending'); // Default to Pending for check-in
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.poNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.dealerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'All') {
        matchesStatus = true;
    } else if (statusFilter === 'Pending') {
        matchesStatus = po.status === 'Pending';
    } else if (statusFilter === 'Received') {
        matchesStatus = po.status === 'Received';
    } else if (statusFilter === 'Received with Changes') {
        matchesStatus = po.status === 'Received' && po.receivedItems?.some(i => i.receivedQty !== i.orderedQty);
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Purchase Check-in</h1>
          <p className="text-text-secondary mt-1">Verify received quantities against purchase orders</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
          <select 
            className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white w-full sm:w-auto"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="Pending">Pending Check-in</option>
            <option value="Received">Already Received (All)</option>
            <option value="Received with Changes">Received with Changes</option>
            <option value="All">All Orders</option>
          </select>
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
                <th className="px-6 py-3 text-center">Total Items</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedOrders.map((po) => {
                const hasChanges = po.status === 'Received' && po.receivedItems?.some(i => i.receivedQty !== i.orderedQty);
                return (
                  <tr 
                    key={po.id} 
                    className="hover:bg-gray-50 transition-colors"
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
                    <td className="px-6 py-4 text-center">
                      {po.items.reduce((sum, item) => sum + item.qty, 0)} units
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant={po.status === 'Received' ? 'success' : 'warning'}>
                          {po.status}
                        </Badge>
                        {hasChanges && (
                          <AlertTriangle size={14} className="text-orange-500" title="Received with quantity changes" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {po.status === 'Pending' ? (
                          <Button 
                              size="sm" 
                              icon={ClipboardCheck}
                              onClick={() => navigate(`/purchases/${po.id}`)}
                          >
                              Check In
                          </Button>
                      ) : (
                          <Button 
                              size="sm" 
                              variant="secondary"
                              icon={PackageCheck}
                              onClick={() => navigate(`/purchase-orders/${po.id}`)}
                          >
                              View Details
                          </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-secondary">
                    <ClipboardCheck size={32} className="mx-auto mb-3 opacity-20" />
                    No purchase orders found matching your criteria.
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
