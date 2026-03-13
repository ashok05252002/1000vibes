import React, { useState, useMemo } from 'react';
import { Wallet, Landmark, ArrowUpRight, ArrowDownRight, Search, Filter, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const AccountsPage = () => {
  const { transactions } = useInventory();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All'); // All, Income, Expense
  const [modeFilter, setModeFilter] = useState('All'); // All, Cash, Bank Transfer, UPI, Card
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // --- Calculate Balances ---
  const { cashBalance, bankBalance, totalBalance } = useMemo(() => {
    let cash = 0;
    let bank = 0;

    transactions.forEach(tx => {
      const isCash = tx.mode === 'Cash';
      const amount = tx.type === 'Income' ? tx.amount : -tx.amount;
      
      if (isCash) cash += amount;
      else bank += amount;
    });

    return {
      cashBalance: cash,
      bankBalance: bank,
      totalBalance: cash + bank
    };
  }, [transactions]);

  // --- Process Transactions with Running Balance ---
  const processedTransactions = useMemo(() => {
    // 1. Sort ascending by date to calculate running balance correctly
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let runningBal = 0;
    const withBalance = sorted.map(tx => {
      if (tx.type === 'Income') runningBal += tx.amount;
      else runningBal -= tx.amount;
      return { ...tx, balance: runningBal };
    });

    // 2. Reverse to show newest first
    return withBalance.reverse();
  }, [transactions]);

  // --- Filter Transactions ---
  const filteredTransactions = useMemo(() => {
    return processedTransactions.filter(tx => {
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || tx.type === typeFilter;
      
      const matchesMode = 
        modeFilter === 'All' ? true :
        modeFilter === 'Online' ? tx.mode !== 'Cash' : 
        tx.mode === modeFilter;

      return matchesSearch && matchesType && matchesMode;
    });
  }, [processedTransactions, searchQuery, typeFilter, modeFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Accounts & Ledger</h1>
          <p className="text-text-secondary mt-1">Track cash flow and account balances</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-primary-light/50 border-primary/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Balance</p>
              <h3 className="text-3xl font-bold text-primary mt-1">{formatCurrency(totalBalance)}</h3>
            </div>
            <div className="p-3 bg-white rounded-lg text-primary shadow-sm">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs text-text-secondary">
            Combined Cash and Bank/Online funds
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-green-800">Cash in Hand</p>
              <h3 className="text-2xl font-bold text-green-900 mt-1">{formatCurrency(cashBalance)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-green-600 shadow-sm">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-green-700">
            Physical cash available in drawer
          </div>
        </Card>

        <Card className="bg-blue-50 border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-blue-800">Bank / Online Balance</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{formatCurrency(bankBalance)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-600 shadow-sm">
              <Landmark size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-700">
            UPI, Card, and Bank Transfers
          </div>
        </Card>
      </div>

      {/* Ledger Table */}
      <Card className="overflow-hidden flex flex-col">
        <div className="p-4 border-b border-border bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-semibold text-text-primary">Transaction Ledger</h3>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-64 bg-white"
              />
            </div>
            
            <select 
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Types</option>
              <option value="Income">Income (In)</option>
              <option value="Expense">Expense (Out)</option>
            </select>

            <select 
              value={modeFilter}
              onChange={(e) => { setModeFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Online">Online (Bank/UPI/Card)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Mode</th>
                <th className="px-6 py-3 text-right">In (+)</th>
                <th className="px-6 py-3 text-right">Out (-)</th>
                <th className="px-6 py-3 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-secondary" />
                      {tx.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-text-primary">
                    {tx.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                      {tx.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    {tx.mode}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-green-600">
                    {tx.type === 'Income' ? (
                      <div className="flex items-center justify-end gap-1">
                        <ArrowUpRight size={14} /> {formatCurrency(tx.amount)}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">
                    {tx.type === 'Expense' ? (
                      <div className="flex items-center justify-end gap-1">
                        <ArrowDownRight size={14} /> {formatCurrency(tx.amount)}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-text-primary bg-gray-50/50">
                    {formatCurrency(tx.balance)}
                  </td>
                </tr>
              ))}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-text-secondary">
                    No transactions found matching your filters.
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
          totalItems={filteredTransactions.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
