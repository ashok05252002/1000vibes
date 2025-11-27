import React, { useState, useMemo } from 'react';
import { TrendingUp, Package, DollarSign, Filter, Download, Search, Calendar, X } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { SlideOver } from '../components/ui/SlideOver';
import { formatCurrency } from '../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../context/InventoryContext';

export const ReportsPage = () => {
  const { invoices, expenses, products, customers } = useInventory();
  const [activeReport, setActiveReport] = useState('sales'); // 'sales', 'stock', 'pnl'
  
  // --- Common Filters ---
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Advanced Filters State ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    category: 'All',
    paymentMode: 'All',
    status: 'All',
    minAmount: '',
    maxAmount: ''
  });

  // --- Reset Pagination on Tab Change ---
  const handleTabChange = (tab) => {
    setActiveReport(tab);
    setCurrentPage(1);
    setSearchQuery('');
    // Reset advanced filters on tab change for cleaner UX
    setAdvancedFilters({
        category: 'All',
        paymentMode: 'All',
        status: 'All',
        minAmount: '',
        maxAmount: ''
    });
  };

  // --- Report Data Logic ---

  // 1. Sales Register Logic
  const filteredSales = useMemo(() => {
    return invoices.filter(inv => {
        const inDate = inv.date >= dateRange.from && inv.date <= dateRange.to;
        const matchesSearch = 
          inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) || 
          inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Advanced Filters
        const matchesPayment = advancedFilters.paymentMode === 'All' || inv.paymentMode === advancedFilters.paymentMode;
        const matchesStatus = advancedFilters.status === 'All' || inv.status === advancedFilters.status;
        const matchesMin = !advancedFilters.minAmount || inv.amount >= parseFloat(advancedFilters.minAmount);
        const matchesMax = !advancedFilters.maxAmount || inv.amount <= parseFloat(advancedFilters.maxAmount);

        return inDate && matchesSearch && matchesPayment && matchesStatus && matchesMin && matchesMax;
      });
  }, [invoices, dateRange, searchQuery, advancedFilters]);

  // 2. Stock Valuation Logic
  const filteredStock = useMemo(() => {
    return products.filter(p => {
        const matchesSearch = 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Advanced Filters
        const matchesCategory = advancedFilters.category === 'All' || p.category === advancedFilters.category;
        const matchesStatus = advancedFilters.status === 'All' ? true : (advancedFilters.status === 'Active' ? p.isActive : !p.isActive);

        return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, advancedFilters]);

  // 3. P&L Logic
  const pnlData = useMemo(() => {
    // Filter Invoices (Revenue)
    const periodInvoices = invoices.filter(i => i.date >= dateRange.from && i.date <= dateRange.to && i.status !== 'Cancelled');
    const revenue = periodInvoices.reduce((sum, i) => sum + i.amount, 0);
    
    // Filter Expenses
    const periodExpenses = expenses.filter(e => e.date >= dateRange.from && e.date <= dateRange.to);
    const expenseTotal = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate COGS
    let cogs = 0;
    periodInvoices.forEach(inv => {
      inv.items.forEach(item => {
         const product = products.find(p => p.id === item.productId);
         if(product) cogs += (product.inPrice * item.qty);
         else cogs += (item.price * 0.7 * item.qty); // Fallback
      });
    });

    // Combine for Transaction Table
    const transactions = [
      ...periodInvoices.map(i => ({
        id: i.id,
        date: i.date,
        type: 'Income',
        ref: i.invoiceNo,
        party: i.customerName,
        category: 'Sales',
        amount: i.amount
      })),
      ...periodExpenses.map(e => ({
        id: e.id,
        date: e.date,
        type: 'Expense',
        ref: '-',
        party: e.recordedBy,
        category: e.category,
        amount: e.amount
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply Advanced Filters to P&L Transactions (Search & Amount)
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.party.toLowerCase().includes(searchQuery.toLowerCase()) || tx.ref.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMin = !advancedFilters.minAmount || tx.amount >= parseFloat(advancedFilters.minAmount);
        const matchesMax = !advancedFilters.maxAmount || tx.amount <= parseFloat(advancedFilters.maxAmount);
        return matchesSearch && matchesMin && matchesMax;
    });

    return { revenue, expenseTotal, cogs, net: revenue - cogs - expenseTotal, transactions: filteredTransactions };
  }, [invoices, expenses, products, dateRange, searchQuery, advancedFilters]);

  // --- Pagination Helper ---
  const paginate = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports Center</h1>
          <p className="text-text-secondary mt-1">Detailed financial and inventory analysis</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" icon={Download}>Export Excel</Button>
        </div>
      </div>

      {/* Report Navigation Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6 overflow-x-auto">
          <button 
            onClick={() => handleTabChange('sales')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeReport === 'sales' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <TrendingUp size={16} /> Sales Register
          </button>
          <button 
            onClick={() => handleTabChange('stock')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeReport === 'stock' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <Package size={16} /> Inventory Valuation
          </button>
          <button 
            onClick={() => handleTabChange('pnl')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeReport === 'pnl' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            <DollarSign size={16} /> Profit & Loss
          </button>
        </div>
      </div>

      {/* Filters Section (Common) */}
      <Card className="p-4 bg-gray-50 border-border">
        <div className="flex flex-wrap items-end gap-4">
          {activeReport !== 'stock' && (
            <div className="flex items-center gap-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">From Date</label>
                <input 
                  type="date" 
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="px-3 py-2 border border-border rounded-md text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
              <div className="pb-2 text-text-secondary">-</div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">To Date</label>
                <input 
                  type="date" 
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="px-3 py-2 border border-border rounded-md text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-text-secondary mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
              <input 
                type="text" 
                placeholder={activeReport === 'stock' ? "Search Product / Category..." : "Search Invoice / Customer..."}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          
          <Button variant="secondary" icon={Filter} onClick={() => setIsFilterOpen(true)}>Advanced Filters</Button>
        </div>
      </Card>

      {/* --- REPORT: SALES REGISTER --- */}
      {activeReport === 'sales' && (
        <Card className="overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Payment Mode</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginate(filteredSales).map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-text-primary">{inv.date}</td>
                    <td className="px-6 py-4 font-mono text-primary font-medium">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 font-medium">{inv.customerName}</td>
                    <td className="px-6 py-4 text-text-secondary">{inv.paymentMode || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : 'warning'}>
                        {inv.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr><td colSpan="6" className="px-6 py-8 text-center text-text-secondary">No records found.</td></tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-text-primary border-t border-border">
                <tr>
                  <td colSpan="4" className="px-6 py-3 text-right">Total (All):</td>
                  <td className="px-6 py-3 text-right">{formatCurrency(filteredSales.reduce((sum, i) => sum + i.amount, 0))}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(filteredSales.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredSales.length}
            itemsPerPage={itemsPerPage}
          />
        </Card>
      )}

      {/* --- REPORT: STOCK VALUATION --- */}
      {activeReport === 'stock' && (
        <Card className="overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3 text-right">Stock Qty</th>
                  <th className="px-6 py-3 text-right">Cost Price</th>
                  <th className="px-6 py-3 text-right">Selling Price</th>
                  <th className="px-6 py-3 text-right">Total Asset Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginate(filteredStock).map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-primary">{p.name}</div>
                      <div className="text-xs text-text-secondary">{p.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">{p.category}</td>
                    <td className={`px-6 py-4 text-right font-medium ${p.stock < 10 ? 'text-red-500' : 'text-text-primary'}`}>
                      {p.stock}
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">{formatCurrency(p.inPrice)}</td>
                    <td className="px-6 py-4 text-right text-text-secondary">{formatCurrency(p.customerPrice)}</td>
                    <td className="px-6 py-4 text-right font-bold text-text-primary">{formatCurrency(p.stock * p.inPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-bold text-text-primary border-t border-border">
                <tr>
                  <td colSpan="5" className="px-6 py-3 text-right">Total Inventory Value:</td>
                  <td className="px-6 py-3 text-right">{formatCurrency(filteredStock.reduce((sum, p) => sum + (p.stock * p.inPrice), 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <Pagination 
            currentPage={currentPage}
            totalPages={Math.ceil(filteredStock.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={filteredStock.length}
            itemsPerPage={itemsPerPage}
          />
        </Card>
      )}

      {/* --- REPORT: PROFIT & LOSS --- */}
      {activeReport === 'pnl' && (
        <div className="space-y-6">
          {/* 1. Detailed Transaction Table */}
          <Card className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-gray-50">
              <h3 className="font-semibold text-text-primary">Financial Transactions ({dateRange.from} to {dateRange.to})</h3>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-white uppercase border-b border-border sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Ref #</th>
                    <th className="px-6 py-3">Party / Category</th>
                    <th className="px-6 py-3 text-right">Credit (Income)</th>
                    <th className="px-6 py-3 text-right">Debit (Expense)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginate(pnlData.transactions).map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-text-primary">{tx.date}</td>
                      <td className="px-6 py-4">
                        <Badge variant={tx.type === 'Income' ? 'success' : 'danger'}>{tx.type}</Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-text-secondary">{tx.ref}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-text-primary">{tx.party}</div>
                        <div className="text-xs text-text-secondary">{tx.category}</div>
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {tx.type === 'Income' ? formatCurrency(tx.amount) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right text-red-600 font-medium">
                        {tx.type === 'Expense' ? formatCurrency(tx.amount) : '-'}
                      </td>
                    </tr>
                  ))}
                  {pnlData.transactions.length === 0 && (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-text-secondary">No transactions found in this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination 
              currentPage={currentPage}
              totalPages={Math.ceil(pnlData.transactions.length / itemsPerPage)}
              onPageChange={setCurrentPage}
              totalItems={pnlData.transactions.length}
              itemsPerPage={itemsPerPage}
            />
          </Card>

          {/* 2. Summary Cards (Calculations) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-l-4 border-l-green-500">
              <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
              <h3 className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(pnlData.revenue)}</h3>
            </Card>
            
            <Card className="p-6 border-l-4 border-l-orange-500">
              <p className="text-sm font-medium text-text-secondary">Cost of Goods Sold</p>
              <h3 className="text-2xl font-bold text-orange-700 mt-1">{formatCurrency(pnlData.cogs)}</h3>
            </Card>
            
            <Card className="p-6 border-l-4 border-l-red-500">
              <p className="text-sm font-medium text-text-secondary">Operating Expenses</p>
              <h3 className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(pnlData.expenseTotal)}</h3>
            </Card>
            
            <Card className={`p-6 border-l-4 ${pnlData.net >= 0 ? 'border-l-primary' : 'border-l-gray-800'}`}>
              <p className="text-sm font-medium text-text-secondary">Net Profit / Loss</p>
              <h3 className={`text-2xl font-bold mt-1 ${pnlData.net >= 0 ? 'text-primary' : 'text-gray-800'}`}>
                {formatCurrency(pnlData.net)}
              </h3>
            </Card>
          </div>
        </div>
      )}

      {/* Advanced Filters SlideOver */}
      <SlideOver
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Advanced Filters"
      >
        <div className="space-y-6">
            {/* Category Filter (Stock Only) */}
            {activeReport === 'stock' && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Product Category</label>
                    <select 
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        value={advancedFilters.category}
                        onChange={e => setAdvancedFilters({...advancedFilters, category: e.target.value})}
                    >
                        <option value="All">All Categories</option>
                        {PRODUCT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Payment Mode (Sales Only) */}
            {activeReport === 'sales' && (
                <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">Payment Mode</label>
                    <select 
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        value={advancedFilters.paymentMode}
                        onChange={e => setAdvancedFilters({...advancedFilters, paymentMode: e.target.value})}
                    >
                        <option value="All">All Modes</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                </div>
            )}

            {/* Status Filter */}
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                <select 
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    value={advancedFilters.status}
                    onChange={e => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                >
                    <option value="All">All</option>
                    {activeReport === 'sales' ? (
                        <>
                            <option value="Paid">Paid</option>
                            <option value="Pending">Pending</option>
                            <option value="Overdue">Overdue</option>
                        </>
                    ) : (
                        <>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </>
                    )}
                </select>
            </div>

            {/* Amount Range */}
            <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Amount Range</label>
                <div className="grid grid-cols-2 gap-3">
                    <input 
                        type="number" 
                        placeholder="Min" 
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        value={advancedFilters.minAmount}
                        onChange={e => setAdvancedFilters({...advancedFilters, minAmount: e.target.value})}
                    />
                    <input 
                        type="number" 
                        placeholder="Max" 
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        value={advancedFilters.maxAmount}
                        onChange={e => setAdvancedFilters({...advancedFilters, maxAmount: e.target.value})}
                    />
                </div>
            </div>

            <div className="pt-6 flex gap-3">
                <Button 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={() => {
                        setAdvancedFilters({
                            category: 'All',
                            paymentMode: 'All',
                            status: 'All',
                            minAmount: '',
                            maxAmount: ''
                        });
                    }}
                >
                    Reset
                </Button>
                <Button className="flex-1" onClick={() => setIsFilterOpen(false)}>
                    Apply Filters
                </Button>
            </div>
        </div>
      </SlideOver>
    </div>
  );
};
