import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Save, AlertCircle, CheckCircle, DollarSign, CreditCard, TrendingDown, History, Calendar, Lock } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const DailyClosingPage = () => {
  const navigate = useNavigate();
  const { invoices, expenses, addDailyClosing, dailyClosings } = useInventory();
  const [activeTab, setActiveTab] = useState('closing'); // 'closing' or 'history'
  const today = new Date().toISOString().split('T')[0];

  // State for Closing Form
  const [openingBalance, setOpeningBalance] = useState('');
  const [isOpeningSaved, setIsOpeningSaved] = useState(false);
  const [isConfirmOpenModal, setIsConfirmOpenModal] = useState(false);
  
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- Calculations ---
  // Include all invoices from today that have some paid amount
  const todaysInvoices = invoices.filter(inv => inv.date === today && inv.paidAmount > 0);
  
  const cashSales = todaysInvoices.reduce((sum, inv) => {
      if (inv.paymentMode === 'Cash') return sum + inv.paidAmount;
      if (inv.paymentMode === 'Mixed' && inv.mixedBreakdown) return sum + inv.mixedBreakdown.cash;
      return sum;
  }, 0);

  const onlineSales = todaysInvoices.reduce((sum, inv) => {
      if (inv.paymentMode !== 'Cash' && inv.paymentMode !== 'Mixed') return sum + inv.paidAmount;
      if (inv.paymentMode === 'Mixed' && inv.mixedBreakdown) return sum + inv.mixedBreakdown.online;
      return sum;
  }, 0);
  
  // Filter expenses to only include those that should reflect in daily closing
  const todaysExpenses = expenses.filter(exp => exp.date === today && exp.reflectInDailyClosing !== false);
  const cashExpenses = todaysExpenses.filter(exp => exp.paymentMode === 'Cash').reduce((sum, exp) => sum + exp.amount, 0);
  
  const opening = parseFloat(openingBalance) || 0;
  const expectedCash = opening + cashSales - cashExpenses;
  const actual = parseFloat(actualCash) || 0;
  const discrepancy = actual - expectedCash;

  // --- Handlers ---
  const handleSaveOpeningClick = () => {
    if (!openingBalance || parseFloat(openingBalance) < 0) {
      return alert('Please enter a valid opening balance');
    }
    setIsConfirmOpenModal(true);
  };

  const confirmSaveOpening = () => {
    setIsOpeningSaved(true);
    setIsConfirmOpenModal(false);
  };

  const handleSubmit = () => {
    if (!isOpeningSaved) return alert('Please save and confirm the Opening Balance first.');
    if (!actualCash) return alert('Please enter the Actual Cash Count.');

    const closingReport = {
      id: faker.string.uuid(),
      date: today,
      openingBalance: opening,
      cashSales,
      onlineSales,
      cashExpenses,
      expectedCash,
      actualCash: actual,
      discrepancy,
      notes,
      closedBy: 'Admin User'
    };

    addDailyClosing(closingReport);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Daily Closing Successful</h2>
        <p className="text-text-secondary max-w-md">
          The accounts for <strong>{today}</strong> have been closed and saved. 
          <br />
          Discrepancy recorded: <span className={discrepancy !== 0 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>{formatCurrency(discrepancy)}</span>
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { setIsSubmitted(false); setActiveTab('history'); }}>View Reports</Button>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Daily Closing (EOD)</h1>
          <p className="text-text-secondary mt-1">Reconcile cash and track daily accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('closing')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'closing' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Calculator size={16} />
            Close Day
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'history' 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <History size={16} />
            Closing Reports
          </button>
        </div>
      </div>

      {/* Tab 1: Perform Closing */}
      {activeTab === 'closing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-blue-500">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
                  Opening Balance
                </div>
                {isOpeningSaved && <Lock size={16} className="text-green-600" />}
              </h3>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Cash in Counter (Start of Day)</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                    <input 
                      type="number" 
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(e.target.value)}
                      disabled={isOpeningSaved}
                      className={`w-full pl-7 pr-4 py-2 border rounded-md outline-none transition-colors ${
                        isOpeningSaved 
                          ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'border-border focus:ring-2 focus:ring-blue-500/20'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {!isOpeningSaved && (
                    <Button onClick={handleSaveOpeningClick} className="shrink-0">Save</Button>
                  )}
                </div>
                {isOpeningSaved && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Opening balance is locked for today.
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs">2</div>
                System Summary (Today)
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-white rounded border border-border">
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign size={16} />
                    <span className="text-sm font-medium">Cash Sales Collected</span>
                  </div>
                  <span className="font-bold text-green-700">+ {formatCurrency(cashSales)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded border border-border opacity-75">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <CreditCard size={16} />
                    <span className="text-sm">Online/Bank Sales</span>
                  </div>
                  <span className="font-medium text-text-primary">{formatCurrency(onlineSales)}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded border border-border">
                  <div className="flex items-center gap-2 text-red-600">
                    <TrendingDown size={16} />
                    <span className="text-sm font-medium">Cash Expenses Paid</span>
                  </div>
                  <span className="font-bold text-red-600">- {formatCurrency(cashExpenses)}</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-l-primary h-full flex flex-col">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</div>
                Closing & Reconciliation
              </h3>
              <div className="space-y-6 flex-1">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800 mb-1">Expected Cash Balance</p>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(expectedCash)}</p>
                  <p className="text-xs text-blue-600 mt-1">Opening + Cash Sales - Cash Expenses</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Actual Cash Count (End of Day)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                    <input 
                      type="number" 
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      disabled={!isOpeningSaved}
                      className={`w-full pl-7 pr-4 py-3 border-2 rounded-md outline-none text-lg font-medium transition-colors ${
                        !isOpeningSaved 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'border-primary/20 focus:border-primary'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {!isOpeningSaved && (
                    <p className="text-xs text-red-500 mt-1">Please save the Opening Balance first.</p>
                  )}
                </div>
                {actualCash && isOpeningSaved && (
                  <div className={`p-4 rounded-lg border flex items-start gap-3 ${discrepancy === 0 ? 'bg-green-50 border-green-100 text-green-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
                    {discrepancy === 0 ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <div>
                      <p className="font-bold text-lg">{discrepancy > 0 ? '+' : ''}{formatCurrency(discrepancy)}</p>
                      <p className="text-sm">{discrepancy === 0 ? 'Perfect Match' : discrepancy > 0 ? 'Excess Cash' : 'Shortage'}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Notes / Remarks</label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!isOpeningSaved}
                    className={`w-full px-3 py-2 border rounded-md text-sm outline-none transition-colors ${
                      !isOpeningSaved 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'border-border focus:ring-2 focus:ring-primary/20'
                    }`}
                    rows={3}
                    placeholder="Enter reason for discrepancy..."
                  />
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-border">
                <Button 
                  className="w-full py-3 text-base" 
                  icon={Save} 
                  onClick={handleSubmit}
                  disabled={!isOpeningSaved || !actualCash}
                >
                  Close Day & Save Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: History */}
      {activeTab === 'history' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Opening</th>
                  <th className="px-6 py-3 text-right">Cash Sales</th>
                  <th className="px-6 py-3 text-right">Expenses</th>
                  <th className="px-6 py-3 text-right">Actual Cash</th>
                  <th className="px-6 py-3 text-right">Discrepancy</th>
                  <th className="px-6 py-3">Closed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dailyClosings.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-text-primary font-medium whitespace-nowrap flex items-center gap-2">
                      <Calendar size={14} className="text-text-secondary" />
                      {report.date}
                    </td>
                    <td className="px-6 py-4 text-right text-text-secondary">{formatCurrency(report.openingBalance)}</td>
                    <td className="px-6 py-4 text-right text-green-600 font-medium">+{formatCurrency(report.cashSales)}</td>
                    <td className="px-6 py-4 text-right text-red-600 font-medium">-{formatCurrency(report.cashExpenses)}</td>
                    <td className="px-6 py-4 text-right font-bold text-text-primary">{formatCurrency(report.actualCash)}</td>
                    <td className={`px-6 py-4 text-right font-medium ${report.discrepancy !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {formatCurrency(report.discrepancy)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-xs">{report.closedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Confirmation Modal for Opening Balance */}
      <Modal
        isOpen={isConfirmOpenModal}
        onClose={() => setIsConfirmOpenModal(false)}
        title="Confirm Opening Balance"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-800 mb-1">You are setting the opening cash balance to:</p>
            <p className="text-3xl font-bold text-blue-900">{formatCurrency(openingBalance || 0)}</p>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">
              Are you sure? Once saved, you will <strong className="font-bold underline">not</strong> be able to edit this opening balance for the rest of the day's closing process.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmOpenModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={confirmSaveOpening} icon={Lock}>
              Confirm & Lock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
