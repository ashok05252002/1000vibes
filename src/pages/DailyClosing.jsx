import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Save, AlertCircle, CheckCircle, DollarSign, CreditCard, TrendingDown, History, Calendar, Lock, Plus, Minus, Equal, Wallet } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const DailyClosingPage = () => {
  const navigate = useNavigate();
  const { transactions, expenses, addDailyClosing, dailyClosings } = useInventory();
  const [activeTab, setActiveTab] = useState('closing'); // 'closing' or 'history'
  const today = new Date().toISOString().split('T')[0];

  // State for Closing Form
  const [openingBalance, setOpeningBalance] = useState('');
  const [isOpeningSaved, setIsOpeningSaved] = useState(false);
  const [isConfirmOpenModal, setIsConfirmOpenModal] = useState(false);
  
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- Calculations based on Transactions Ledger ---
  const todayTxs = transactions.filter(tx => tx.date === today);

  // 1. Direct Sales (Cash & Online)
  const cashSales = todayTxs
    .filter(tx => tx.type === 'Income' && tx.category === 'Sales' && tx.mode === 'Cash')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const onlineSales = todayTxs
    .filter(tx => tx.type === 'Income' && tx.category === 'Sales' && tx.mode !== 'Cash')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 2. Pending Bills Collected (Cash & Online)
  const cashCreditCollections = todayTxs
    .filter(tx => tx.type === 'Income' && tx.category === 'Credit Receipt' && tx.mode === 'Cash')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const onlineCreditCollections = todayTxs
    .filter(tx => tx.type === 'Income' && tx.category === 'Credit Receipt' && tx.mode !== 'Cash')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // 3. Expenses
  // Get all cash expenses from transactions (includes PO payments, refunds, and regular expenses)
  let cashExpenses = todayTxs
    .filter(tx => tx.type === 'Expense' && tx.mode === 'Cash')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Subtract expenses that explicitly should NOT reflect in daily closing
  const nonReflectingCashExpenses = expenses
    .filter(exp => exp.date === today && exp.paymentMode === 'Cash' && exp.reflectInDailyClosing === false)
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  cashExpenses -= nonReflectingCashExpenses;

  // 4. Totals
  const totalCashIn = cashSales + cashCreditCollections;
  const totalOnlineIn = onlineSales + onlineCreditCollections;

  const opening = parseFloat(openingBalance) || 0;
  const expectedCash = opening + totalCashIn - cashExpenses;
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
      cashCreditCollections,
      onlineSales,
      onlineCreditCollections,
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
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            
            {/* Step 1: Opening Balance */}
            <Card className="p-6 border-l-4 border-l-blue-500">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</div>
                  Cash in Counter (Start of Day)
                </div>
                {isOpeningSaved && <Lock size={16} className="text-green-600" />}
              </h3>
              <div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                    <input 
                      type="number" 
                      value={openingBalance}
                      onChange={(e) => setOpeningBalance(e.target.value)}
                      disabled={isOpeningSaved}
                      className={`w-full pl-7 pr-4 py-3 text-lg font-medium border rounded-md outline-none transition-colors ${
                        isOpeningSaved 
                          ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'border-border focus:ring-2 focus:ring-blue-500/20'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {!isOpeningSaved && (
                    <Button onClick={handleSaveOpeningClick} className="shrink-0 px-6">Save</Button>
                  )}
                </div>
                {isOpeningSaved && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Opening balance is locked for today.
                  </p>
                )}
              </div>
            </Card>

            {/* Step 2: System Summary */}
            <Card className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs">2</div>
                System Summary (Today)
              </h3>
              <div className="space-y-4">
                
                {/* Cash Transactions */}
                <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                  <h4 className="text-sm font-bold text-text-primary uppercase mb-3 flex items-center gap-2 border-b border-border pb-2">
                    <DollarSign size={16} className="text-green-600"/> Cash Transactions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">Direct Cash Sales</span>
                      <span className="font-medium text-text-primary">{formatCurrency(cashSales)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">Pending Cash Received (Old Bills)</span>
                      <span className="font-medium text-text-primary">{formatCurrency(cashCreditCollections)}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-bold bg-green-50 p-2 rounded text-green-800">
                      <span>Total Cash Received</span>
                      <span>+ {formatCurrency(totalCashIn)}</span>
                    </div>
                  </div>
                </div>

                {/* Online Transactions */}
                <div className="p-4 bg-white rounded-lg border border-border shadow-sm">
                  <h4 className="text-sm font-bold text-text-primary uppercase mb-3 flex items-center gap-2 border-b border-border pb-2">
                    <CreditCard size={16} className="text-blue-600"/> Online / Bank Transactions
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">Direct Online Sales</span>
                      <span className="font-medium text-text-primary">{formatCurrency(onlineSales)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text-secondary">Pending Account Received (Old Bills)</span>
                      <span className="font-medium text-text-primary">{formatCurrency(onlineCreditCollections)}</span>
                    </div>
                    <div className="flex justify-between items-center text-base font-bold bg-blue-50 p-2 rounded text-blue-800">
                      <span>Total Online Received</span>
                      <span>+ {formatCurrency(totalOnlineIn)}</span>
                    </div>
                  </div>
                </div>

                {/* Expenses */}
                <div className="p-4 bg-white rounded-lg border border-red-200 shadow-sm mt-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                      <TrendingDown size={16} />
                      <span>Cash Expenses (Paid from Counter)</span>
                    </div>
                    <span className="font-bold text-red-600 text-lg">- {formatCurrency(cashExpenses)}</span>
                  </div>
                </div>

              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Step 3: Closing & Reconciliation */}
            <Card className="p-6 border-l-4 border-l-primary h-full flex flex-col">
              <h3 className="text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</div>
                Closing & Reconciliation
              </h3>
              
              <div className="space-y-6 flex-1">
                {/* Expected Cash Calculation Box */}
                <div className="bg-gray-50 p-4 rounded-lg border border-border">
                  <p className="text-sm font-semibold text-text-primary mb-3">Expected Cash Calculation:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Opening Balance</span>
                      <span className="font-medium text-text-primary">{formatCurrency(opening)}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary">
                      <span className="flex items-center gap-1"><Plus size={12}/> Total Cash Received</span>
                      <span className="font-medium text-green-600">{formatCurrency(totalCashIn)}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-secondary border-b border-border pb-2">
                      <span className="flex items-center gap-1"><Minus size={12}/> Cash Expenses</span>
                      <span className="font-medium text-red-600">{formatCurrency(cashExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-bold text-primary flex items-center gap-1"><Equal size={14}/> Expected Cash in Drawer</span>
                      <span className="font-bold text-primary text-xl">{formatCurrency(expectedCash)}</span>
                    </div>
                  </div>
                </div>

                {/* Actual Cash Input */}
                <div>
                  <label className="block text-sm font-bold text-text-primary mb-2">Actual Cash Count (Enter physical cash)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-lg">₹</span>
                    <input 
                      type="number" 
                      value={actualCash}
                      onChange={(e) => setActualCash(e.target.value)}
                      disabled={!isOpeningSaved}
                      className={`w-full pl-9 pr-4 py-4 border-2 rounded-lg outline-none text-2xl font-bold transition-colors ${
                        !isOpeningSaved 
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                          : 'border-primary/30 focus:border-primary bg-white'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {!isOpeningSaved && (
                    <p className="text-xs text-red-500 mt-2">Please save the Opening Balance first.</p>
                  )}
                </div>

                {/* Discrepancy Alert */}
                {actualCash && isOpeningSaved && (
                  <div className={`p-4 rounded-lg border flex items-start gap-3 ${discrepancy === 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {discrepancy === 0 ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    <div>
                      <p className="font-bold text-xl">{discrepancy > 0 ? '+' : ''}{formatCurrency(discrepancy)}</p>
                      <p className="text-sm font-medium">{discrepancy === 0 ? 'Perfect Match - Accounts are balanced' : discrepancy > 0 ? 'Excess Cash in Drawer' : 'Shortage in Drawer'}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Notes / Remarks (Required if discrepancy)</label>
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
                    placeholder="Enter reason for discrepancy or general notes..."
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border">
                <Button 
                  className="w-full py-4 text-lg font-bold shadow-lg" 
                  icon={Save} 
                  onClick={handleSubmit}
                  disabled={!isOpeningSaved || !actualCash || (discrepancy !== 0 && !notes.trim())}
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
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Opening Cash</th>
                  <th className="px-4 py-3 text-right border-l border-border bg-green-50/30">Cash Received</th>
                  <th className="px-4 py-3 text-right border-l border-border bg-blue-50/30">Online Received</th>
                  <th className="px-4 py-3 text-right border-l border-border bg-purple-50/30">Total Collection</th>
                  <th className="px-4 py-3 text-right border-l border-border text-red-600">Cash Expenses</th>
                  <th className="px-4 py-3 text-right border-l border-border">Actual Cash</th>
                  <th className="px-4 py-3 text-right">Discrepancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dailyClosings.map((report) => {
                  const totalCashIn = report.cashSales + (report.cashCreditCollections || 0);
                  const totalOnlineIn = (report.onlineSales || 0) + (report.onlineCreditCollections || 0);
                  const grandTotal = totalCashIn + totalOnlineIn;
                  
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-text-primary font-medium whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-text-secondary" />
                          {report.date}
                        </div>
                        <div className="text-[10px] text-text-muted mt-1 font-normal">By: {report.closedBy}</div>
                      </td>
                      
                      <td className="px-4 py-4 text-right font-medium text-text-primary">
                        {formatCurrency(report.openingBalance)}
                      </td>
                      
                      {/* Cash Breakdown */}
                      <td className="px-4 py-4 text-right border-l border-border bg-green-50/10">
                        <div className="text-green-700 font-bold text-base">{formatCurrency(totalCashIn)}</div>
                        <div className="text-[10px] text-text-secondary mt-1">Sales: {formatCurrency(report.cashSales)}</div>
                        <div className="text-[10px] text-text-secondary">Pending: {formatCurrency(report.cashCreditCollections || 0)}</div>
                      </td>

                      {/* Online Breakdown */}
                      <td className="px-4 py-4 text-right border-l border-border bg-blue-50/10">
                        <div className="text-blue-700 font-bold text-base">{formatCurrency(totalOnlineIn)}</div>
                        <div className="text-[10px] text-text-secondary mt-1">Sales: {formatCurrency(report.onlineSales || 0)}</div>
                        <div className="text-[10px] text-text-secondary">Pending: {formatCurrency(report.onlineCreditCollections || 0)}</div>
                      </td>

                      {/* Total Collection */}
                      <td className="px-4 py-4 text-right border-l border-border bg-purple-50/10">
                        <div className="text-purple-700 font-bold text-base">{formatCurrency(grandTotal)}</div>
                      </td>
                      
                      <td className="px-4 py-4 text-right text-red-600 font-bold border-l border-border">
                        -{formatCurrency(report.cashExpenses)}
                      </td>
                      
                      <td className="px-4 py-4 text-right font-bold text-text-primary text-base border-l border-border">
                        {formatCurrency(report.actualCash)}
                      </td>
                      
                      <td className={`px-4 py-4 text-right font-bold ${report.discrepancy !== 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {report.discrepancy > 0 ? '+' : ''}{formatCurrency(report.discrepancy)}
                      </td>
                    </tr>
                  );
                })}
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
