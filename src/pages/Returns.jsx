import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, RotateCcw, AlertOctagon, PackagePlus, Calendar, ArrowRight, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const ReturnsPage = () => {
  const navigate = useNavigate();
  const { returns, processReturn, products } = useInventory();
  
  // UI State
  const [activeTab, setActiveTab] = useState('All'); // All, Pending, Restocked, Damaged
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date Filter State
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [processAction, setProcessAction] = useState(''); // 'Restock' or 'Damage'

  // --- Filtering Logic ---
  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      const inDateRange = ret.date >= fromDate && ret.date <= toDate;
      const matchesTab = activeTab === 'All' || ret.status === activeTab;
      const matchesSearch = 
        ret.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ret.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ret.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase());

      return inDateRange && matchesTab && matchesSearch;
    });
  }, [returns, fromDate, toDate, activeTab, searchQuery]);

  // --- Stats Calculation (Based on Date Range) ---
  const stats = useMemo(() => {
    const rangeReturns = returns.filter(r => r.date >= fromDate && r.date <= toDate);
    return {
      totalRefunded: rangeReturns.reduce((sum, r) => sum + r.refundAmount, 0),
      pendingCount: rangeReturns.filter(r => r.status === 'Pending').length,
      restockedCount: rangeReturns.filter(r => r.status === 'Restocked').length,
      damagedCount: rangeReturns.filter(r => r.status === 'Damaged').length,
    };
  }, [returns, fromDate, toDate]);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Handlers ---
  const handleProcessClick = (ret, action) => {
    setSelectedReturn(ret);
    setProcessAction(action);
    setIsProcessModalOpen(true);
  };

  // --- Financial Calculations for Modal ---
  const selectedProduct = products.find(p => p.id === selectedReturn?.productId);
  const inPrice = selectedProduct?.inPrice || 0;
  const inventoryValue = inPrice * (selectedReturn?.qty || 0);
  const marginLoss = Math.max(0, (selectedReturn?.refundAmount || 0) - inventoryValue);

  const confirmProcess = () => {
    if (selectedReturn && processAction) {
      processReturn(selectedReturn.id, processAction, marginLoss);
    }
    setIsProcessModalOpen(false);
    setSelectedReturn(null);
    setProcessAction('');
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Returns & Refunds</h1>
          <p className="text-text-secondary mt-1">Manage customer returns and inventory adjustments</p>
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
          <Button icon={Plus} onClick={() => navigate('/returns/add')}>Add Return</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-100">
          <p className="text-sm font-medium text-red-800">Total Refunded</p>
          <h3 className="text-2xl font-bold text-red-900 mt-1">{formatCurrency(stats.totalRefunded)}</h3>
        </Card>
        <Card className="bg-yellow-50 border-yellow-100">
          <p className="text-sm font-medium text-yellow-800">Pending Action</p>
          <h3 className="text-2xl font-bold text-yellow-900 mt-1">{stats.pendingCount} <span className="text-sm font-normal">items</span></h3>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <p className="text-sm font-medium text-green-800">Restocked</p>
          <h3 className="text-2xl font-bold text-green-900 mt-1">{stats.restockedCount} <span className="text-sm font-normal">items</span></h3>
        </Card>
        <Card className="bg-orange-50 border-orange-100">
          <p className="text-sm font-medium text-orange-800">Marked Damaged</p>
          <h3 className="text-2xl font-bold text-orange-900 mt-1">{stats.damagedCount} <span className="text-sm font-normal">items</span></h3>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-border">
        <div className="flex gap-6 w-full sm:w-auto overflow-x-auto">
          {['All', 'Pending', 'Restocked', 'Damaged'].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64 pb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
          <input 
            type="text" 
            placeholder="Search returns..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Customer / Invoice</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3 text-center">Qty</th>
                <th className="px-6 py-3 text-right">Refund Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedReturns.map((ret) => (
                <tr key={ret.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-text-secondary" />
                      {ret.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary">{ret.customerName}</div>
                    <div className="text-xs text-text-secondary">Inv: {ret.invoiceNo}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-text-primary line-clamp-1" title={ret.productName}>{ret.productName}</div>
                    <div className="text-xs text-text-secondary truncate max-w-[200px]" title={ret.reason}>Reason: {ret.reason}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-text-primary">
                    {ret.qty}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-red-600">
                    {formatCurrency(ret.refundAmount)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={
                        ret.status === 'Pending' ? 'warning' : 
                        ret.status === 'Restocked' ? 'success' : 'danger'
                      }
                    >
                      {ret.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {ret.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleProcessClick(ret, 'Restock')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md border border-transparent hover:border-green-200 transition-colors"
                          title="Restock Item"
                        >
                          <PackagePlus size={16} />
                        </button>
                        <button 
                          onClick={() => handleProcessClick(ret, 'Damage')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md border border-transparent hover:border-red-200 transition-colors"
                          title="Mark as Damaged"
                        >
                          <AlertOctagon size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-text-secondary flex items-center justify-end gap-1">
                        <CheckCircle size={12} /> Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedReturns.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-text-secondary">
                    No returns found matching your filters.
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
          totalItems={filteredReturns.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      {/* Process Confirmation Modal */}
      <Modal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        title={`Confirm ${processAction}`}
      >
        <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${processAction === 'Restock' ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                <h4 className="font-bold flex items-center gap-2 mb-2">
                    {processAction === 'Restock' ? <PackagePlus size={20} /> : <AlertOctagon size={20} />}
                    {processAction === 'Restock' ? 'Restock to Inventory' : 'Mark as Damaged'}
                </h4>
                <p className="text-sm">
                    You are about to mark <strong>{selectedReturn?.qty}x {selectedReturn?.productName}</strong> as {processAction === 'Restock' ? 'Restocked' : 'Damaged'}.
                </p>
                <p className="text-xs mt-2 opacity-80">
                    {processAction === 'Restock' 
                        ? 'This will increase the active stock count for this product.' 
                        : 'This will log the item as damaged and will NOT be added back to active stock.'}
                </p>
            </div>

            {/* Financial Impact Details for Restock */}
            {processAction === 'Restock' && selectedReturn && (
                <div className="mt-4 bg-white border border-border rounded-md p-4 space-y-3 text-sm">
                    <h5 className="font-semibold text-text-primary border-b border-border pb-2 mb-2">Restock Financial Impact</h5>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Original Refund Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedReturn.refundAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                        <span className="text-text-secondary">
                          Current Purchase Price ({formatCurrency(inPrice)} × {selectedReturn.qty}):
                        </span>
                        <span className="font-medium text-green-600">+{formatCurrency(inventoryValue)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-border pt-3 mt-1">
                        <span className="font-semibold text-text-primary">Net Margin Loss:</span>
                        <span className="font-bold text-red-600">{formatCurrency(marginLoss)}</span>
                    </div>
                    
                    {marginLoss > 0 && (
                      <p className="text-xs text-text-muted mt-2 pt-2 border-t border-gray-100 italic">
                          * The margin loss of {formatCurrency(marginLoss)} will be automatically recorded in Expenses under the "Return Margin Loss" category.
                      </p>
                    )}
                </div>
            )}

            <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setIsProcessModalOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={confirmProcess}>Confirm Action</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
