import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, ShoppingCart, ArrowRight, Edit2, Building2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const VendorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vendors, bills } = useInventory();

  // Pagination for History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const vendor = vendors.find(v => v.id === id);
  
  if (!vendor) return <div>Vendor not found</div>;

  // Get history
  const vendorHistory = bills
    .filter(b => b.vendorId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination Logic
  const totalPages = Math.ceil(vendorHistory.length / itemsPerPage);
  const paginatedHistory = vendorHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/vendors')}>
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
               <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{vendor.company}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Phone size={14} /> {vendor.phone}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {vendor.address}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" icon={Edit2}>Edit Profile</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-orange-50 border-orange-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-orange-800">Total Payables</p>
              <h3 className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(vendor.balance)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-orange-600">
              <ShoppingCart size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-white">
           <p className="text-sm font-medium text-text-secondary">Total Purchases</p>
           <h3 className="text-2xl font-bold text-text-primary mt-1">
             {formatCurrency(vendorHistory.reduce((sum, bill) => sum + bill.amount, 0))}
           </h3>
        </Card>
        <Card className="bg-white">
           <p className="text-sm font-medium text-text-secondary">Total Bills</p>
           <h3 className="text-2xl font-bold text-text-primary mt-1">{vendorHistory.length}</h3>
        </Card>
      </div>

      {/* History Table */}
      <Card className="overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-text-primary">Purchase History</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-xs text-text-secondary uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Bill #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((bill) => (
                  <tr 
                    key={bill.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/billing/vendor/${bill.id}`, { state: { from: `/vendors/${id}` } })}
                  >
                    <td className="px-6 py-4 text-text-primary">{bill.date}</td>
                    <td className="px-6 py-4 font-mono text-primary font-medium">{bill.billNo}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(bill.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={bill.status === 'Paid' ? 'success' : 'warning'}>{bill.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">
                      <ArrowRight size={16} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">
                    No purchase history found.
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
          totalItems={vendorHistory.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
