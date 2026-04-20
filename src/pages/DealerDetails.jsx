import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Store, ShoppingBag, ArrowRight, Edit2, Wallet, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const DealerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dealers, purchaseOrders } = useInventory();

  // Pagination for History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const dealer = dealers.find(d => d.id === id);
  
  if (!dealer) return <div>Dealer not found</div>;

  // Get history (Purchase Orders)
  const dealerHistory = purchaseOrders
    .filter(po => po.dealerId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination Logic
  const totalPages = Math.ceil(dealerHistory.length / itemsPerPage);
  const paginatedHistory = dealerHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/dealers')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
               <Store size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{dealer.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                <Badge variant="default">{dealer.category}</Badge>
                {dealer.email !== '-' && (
                  <span className="flex items-center gap-1"><Mail size={14} /> {dealer.email}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" icon={Edit2}>Edit Profile</Button>
           <Button icon={Plus} onClick={() => navigate('/purchase-orders/add')}>New Order</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-800">Pending Balance</p>
              <h3 className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(dealer.balance)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-red-600">
              <Wallet size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-white">
           <p className="text-sm font-medium text-text-secondary">Total Order Value</p>
           <h3 className="text-2xl font-bold text-text-primary mt-1">
             {formatCurrency(dealerHistory.reduce((sum, po) => sum + po.amount, 0))}
           </h3>
        </Card>
        <Card className="bg-white">
           <p className="text-sm font-medium text-text-secondary">Total Orders</p>
           <h3 className="text-2xl font-bold text-text-primary mt-1">{dealerHistory.length}</h3>
        </Card>
      </div>

      {/* History Table */}
      <Card className="overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border bg-gray-50 flex items-center gap-2">
          <ShoppingBag size={18} className="text-text-secondary" />
          <h3 className="font-semibold text-text-primary">Purchase Order History</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-xs text-text-secondary uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">PO #</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-right">Balance Due</th>
                <th className="px-6 py-3 text-center">Payment Status</th>
                <th className="px-6 py-3 text-center">Order Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((po) => (
                  <tr 
                    key={po.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/purchase-orders/${po.id}`)}
                  >
                    <td className="px-6 py-4 text-text-primary">{po.date}</td>
                    <td className="px-6 py-4 font-mono text-primary font-medium">{po.poNo}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(po.amount)}</td>
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
                      <Badge variant={po.status === 'Received' ? 'success' : 'warning'}>
                        {po.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">
                      <ArrowRight size={16} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">
                    No purchase orders found for this dealer.
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
          totalItems={dealerHistory.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
