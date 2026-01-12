import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Download, Eye, CreditCard, Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { formatCurrency } from '../../lib/utils';
import { useInventory } from '../../context/InventoryContext';

export const CustomerBillingPage = () => {
  const navigate = useNavigate();
  const { invoices, updateInvoice, recordPayment, customers } = useInventory();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Logic
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Enhanced Phone Search for Invoices
    let matchesPhone = false;
    if (inv.customerId) {
        const customer = customers.find(c => c.id === inv.customerId);
        if (customer && customer.phone) {
             const phoneDigits = customer.phone.replace(/\D/g, '');
             const searchDigits = searchQuery.replace(/\D/g, '');
             
             // Check direct match or stripped match if user typed at least 3 digits
             matchesPhone = customer.phone.includes(searchQuery) || 
                            (searchDigits.length > 3 && phoneDigits.includes(searchDigits));
        }
    }
    
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Paid' ? inv.status === 'Paid' :
      statusFilter === 'Partial' ? inv.status === 'Partial' :
      statusFilter === 'Unpaid' ? (inv.status === 'Pending' || inv.status === 'Overdue') : true;

    return (matchesSearch || matchesPhone) && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.dueAmount || (invoice.amount - (invoice.paidAmount || 0)));
    setPaymentMode('Cash');
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedInvoice || !paymentAmount) return;

    const amountToPay = parseFloat(paymentAmount);
    const currentPaid = selectedInvoice.paidAmount || 0;
    const newPaidAmount = currentPaid + amountToPay;
    const newDueAmount = selectedInvoice.amount - newPaidAmount;
    
    // Determine new status
    let newStatus = selectedInvoice.status;
    if (newDueAmount <= 0) newStatus = 'Paid';
    else newStatus = 'Partial';

    // 1. Update Invoice
    updateInvoice(selectedInvoice.id, {
      ...selectedInvoice,
      paidAmount: newPaidAmount,
      dueAmount: Math.max(0, newDueAmount),
      status: newStatus
    });

    // 2. Record Payment on Customer Ledger
    if (selectedInvoice.customerId) {
      recordPayment(
        selectedInvoice.customerId, 
        amountToPay, 
        paymentMode, 
        `Payment for Invoice ${selectedInvoice.invoiceNo}`
      );
    }

    setIsPaymentModalOpen(false);
    setSelectedInvoice(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customer Invoices</h1>
          <p className="text-text-secondary mt-1">Manage sales and billing for customers</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search invoice, name or phone..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center bg-white border border-border rounded-md px-2">
            <Filter size={16} className="text-text-secondary mr-2" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-sm border-none focus:ring-0 py-2 text-text-primary bg-transparent cursor-pointer outline-none"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partially Paid</option>
              <option value="Unpaid">Unpaid / Pending</option>
            </select>
          </div>

          <Button icon={Plus} onClick={() => navigate('/billing/customer/add')}>New Invoice</Button>
        </div>
      </div>

      <Card className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Invoice #</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-right">Balance Due</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedInvoices.map((inv) => {
                const due = inv.dueAmount !== undefined ? inv.dueAmount : (inv.status === 'Paid' ? 0 : inv.amount);
                return (
                  <tr 
                    key={inv.id} 
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/billing/customer/${inv.id}`)}
                  >
                    <td className="px-6 py-4 text-text-primary whitespace-nowrap">{inv.date}</td>
                    <td className="px-6 py-4 font-mono text-xs text-primary font-medium">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">{inv.customerName}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.amount)}</td>
                    <td className={`px-6 py-4 text-right font-bold ${due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(due)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Partial' ? 'warning' : 'danger'}>
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        {due > 0 && (
                          <button 
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md border border-transparent hover:border-green-200 transition-colors"
                            title="Record Payment"
                            onClick={() => openPaymentModal(inv)}
                          >
                            <CreditCard size={16} />
                          </button>
                        )}
                        <button 
                          className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" 
                          title="View Details"
                          onClick={() => navigate(`/billing/customer/${inv.id}`)}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">
                    No invoices found matching your filters.
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
          totalItems={filteredInvoices.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Invoice Payment"
      >
        {selectedInvoice && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-blue-800 font-medium">Invoice #{selectedInvoice.invoiceNo}</span>
                <span className="text-xs text-blue-600">{selectedInvoice.date}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700">Total Amount:</span>
                <span className="font-bold text-blue-900">{formatCurrency(selectedInvoice.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-red-600 font-medium">Current Balance Due:</span>
                <span className="font-bold text-red-700">{formatCurrency(selectedInvoice.dueAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Amount Receiving Now *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                <input 
                  type="number" 
                  className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  max={selectedInvoice.dueAmount}
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Payment Mode</label>
              <select 
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Payment</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
