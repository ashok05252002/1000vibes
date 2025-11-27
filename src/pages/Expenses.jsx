import React, { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, PieChart, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory, EXPENSE_CATEGORIES } from '../context/InventoryContext';

export const ExpensesPage = () => {
  const { expenses, addExpense } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Filter State - Date Range
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    date: today,
    category: '',
    amount: '',
    description: '',
    paymentMode: 'Cash'
  });

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      return exp.date >= fromDate && exp.date <= toDate;
    });
  }, [expenses, fromDate, toDate]);

  // Stats Calculation
  const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpense / filteredExpenses.length : 0;
  
  // Pagination Logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    const newExpense = {
      id: faker.string.uuid(),
      ...formData,
      amount: parseFloat(formData.amount),
      recordedBy: 'Admin User'
    };

    addExpense(newExpense);
    setIsAddModalOpen(false);
    setFormData({
      date: today,
      category: '',
      amount: '',
      description: '',
      paymentMode: 'Cash'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Expenses</h1>
          <p className="text-text-secondary mt-1">Track and manage operational costs</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white border border-border rounded-md px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">From:</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setCurrentPage(1); }}
                className="outline-none bg-transparent text-text-primary"
              />
            </div>
            <ArrowRight size={14} className="text-text-secondary" />
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">To:</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setCurrentPage(1); }}
                className="outline-none bg-transparent text-text-primary"
              />
            </div>
          </div>
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Expense</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-red-50 border-red-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-red-800">Total Expenses (Period)</p>
              <h3 className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(totalExpense)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-red-600">
              <DollarSign size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-800">Transaction Count</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{filteredExpenses.length}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-purple-800">Avg. Transaction</p>
              <h3 className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(averageExpense)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-purple-600">
              <PieChart size={20} />
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card className="overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-text-primary">Expense History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Payment Mode</th>
                <th className="px-6 py-3">Recorded By</th>
                <th className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-text-primary whitespace-nowrap">{exp.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-secondary max-w-xs truncate" title={exp.description}>
                      {exp.description}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{exp.paymentMode}</td>
                    <td className="px-6 py-4 text-text-secondary text-xs">{exp.recordedBy}</td>
                    <td className="px-6 py-4 text-right font-medium text-text-primary">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-text-secondary">
                    No expenses found for this period.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Total Footer Row */}
            {paginatedExpenses.length > 0 && (
              <tfoot className="bg-gray-50 font-semibold text-text-primary border-t border-border">
                <tr>
                  <td colSpan="5" className="px-6 py-3 text-right">Total (This Page):</td>
                  <td className="px-6 py-3 text-right">
                    {formatCurrency(paginatedExpenses.reduce((sum, e) => sum + e.amount, 0))}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredExpenses.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      {/* Add Expense Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Expense"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Date *</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Category *</label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                required
              >
                <option value="">Select Category</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Amount (₹) *</label>
            <input 
              type="number" 
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
              placeholder="Enter details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Payment Mode</label>
            <select 
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-md text-sm"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Expense</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
