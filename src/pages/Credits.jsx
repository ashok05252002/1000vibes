import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CreditCard, ArrowUpRight, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const CreditsPage = () => {
  const navigate = useNavigate();
  const { customers, recordPayment } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'Cash',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Filter customers with outstanding balance
  const debtors = customers.filter(c => c.balance > 0);
  
  const filteredDebtors = debtors.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  // Stats
  const totalReceivables = debtors.reduce((sum, c) => sum + c.balance, 0);
  const overdueAmount = totalReceivables * 0.3; // Mock calculation

  // Pagination
  const totalPages = Math.ceil(filteredDebtors.length / itemsPerPage);
  const paginatedDebtors = filteredDebtors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openPaymentModal = (customer) => {
    setSelectedCustomer(customer);
    setPaymentForm({
      amount: '',
      mode: 'Cash',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer || !paymentForm.amount) return;

    const amount = parseFloat(paymentForm.amount);
    if (amount <= 0) return alert("Amount must be greater than 0");
    if (amount > selectedCustomer.balance) return alert("Amount cannot exceed outstanding balance");

    recordPayment(selectedCustomer.id, amount, paymentForm.mode, paymentForm.notes);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Credits & Receivables</h1>
          <p className="text-text-secondary mt-1">Track and collect outstanding payments</p>
        </div>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search debtors..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-800">Total Receivables</p>
              <h3 className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(totalReceivables)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-red-600">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-3 text-xs text-red-700 flex items-center">
            <ArrowUpRight size={14} className="mr-1" /> 12% increase from last month
          </div>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-orange-800">Overdue (> 30 Days)</p>
              <h3 className="text-2xl font-bold text-orange-900 mt-1">{formatCurrency(overdueAmount)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-orange-600">
              <AlertCircle size={20} />
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-800">Collected Today</p>
              <h3 className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(12500)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-green-600">
              <CheckCircle size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Debtors Table */}
      <Card className="overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-gray-50">
          <h3 className="font-semibold text-text-primary">Outstanding Balances</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-right">Balance Amount</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedDebtors.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/customers/${customer.id}`)}
                >
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {customer.phone}
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {customer.city}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">
                    {formatCurrency(customer.balance)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openPaymentModal(customer);
                      }}
                    >
                      Record Payment
                    </Button>
                  </td>
                </tr>
              ))}
              {paginatedDebtors.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">
                    No outstanding credits found.
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
          totalItems={filteredDebtors.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
      >
        {selectedCustomer && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
              <p className="text-sm text-blue-800">Recording payment for <span className="font-bold">{selectedCustomer.name}</span></p>
              <p className="text-xs text-blue-600 mt-1">Current Balance: {formatCurrency(selectedCustomer.balance)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Amount Received *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                <input 
                  type="number" 
                  className="w-full pl-7 pr-3 py-2 border border-border rounded-md text-sm"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                  max={selectedCustomer.balance}
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Payment Mode</label>
              <select 
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                value={paymentForm.mode}
                onChange={e => setPaymentForm({...paymentForm, mode: e.target.value})}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Payment Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                value={paymentForm.date}
                onChange={e => setPaymentForm({...paymentForm, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Notes</label>
              <textarea 
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                rows={2}
                value={paymentForm.notes}
                onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                placeholder="Reference ID, Cheque No, etc."
              />
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
