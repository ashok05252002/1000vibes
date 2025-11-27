import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, FileText, ArrowRight, Edit2, Wallet } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const CustomerDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, invoices } = useInventory();
  
  // Pagination for History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const customer = customers.find(c => c.id === id);
  
  if (!customer) return <div>Customer not found</div>;

  // Get history
  const customerHistory = invoices
    .filter(inv => inv.customerId === id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination Logic
  const totalPages = Math.ceil(customerHistory.length / itemsPerPage);
  const paginatedHistory = customerHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/customers')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{customer.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
              <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {customer.city}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" icon={Edit2}>Edit Profile</Button>
           <Button icon={FileText} onClick={() => navigate('/billing')}>New Invoice</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-800">Outstanding Balance</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(customer.balance)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-600">
              <Wallet size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-white">
           <p className="text-sm font-medium text-text-secondary">Total Spent</p>
           <h3 className="text-2xl font-bold text-text-primary mt-1">
             {formatCurrency(customerHistory.reduce((sum, inv) => sum + inv.amount, 0))}
           </h3>
        </Card>
        <Card className="bg-white">
           <p className="text-sm font-medium text-text-secondary">Total Invoices</p>
           <h3 className="text-2xl font-bold text-text-primary mt-1">{customerHistory.length}</h3>
        </Card>
      </div>

      {/* History Table */}
      <Card className="overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-text-primary">Transaction History</h3>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="bg-white text-xs text-text-secondary uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedHistory.length > 0 ? (
                paginatedHistory.map((inv) => (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/billing/customer/${inv.id}`, { state: { from: `/customers/${id}` } })}
                  >
                    <td className="px-6 py-4 text-text-primary">{inv.date}</td>
                    <td className="px-6 py-4 font-mono text-primary font-medium">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">
                      <ArrowRight size={16} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">
                    No transaction history found.
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
          totalItems={customerHistory.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
