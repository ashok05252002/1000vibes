import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Edit2, TrendingUp, TrendingDown, Calendar, FileText, Truck, User, History, ClipboardList, AlertTriangle, AlertOctagon } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const ProductViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, getProductLogs, updateProduct, adjustStock, getProductHistory, invoices } = useInventory();
  
  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'sales', 'audit'
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  // Damage Form State
  const [damageForm, setDamageForm] = useState({
    type: 'Damage',
    qty: '',
    notes: ''
  });

  // Find product
  const product = products.find(p => p.id === id);
  
  // Get Real History
  const stockHistory = getProductHistory(id);
  const auditLogs = getProductLogs(id);
  
  // Filter Sales History for this product
  const salesHistory = invoices.flatMap(inv => 
    inv.items
      .filter(item => item.productId === id)
      .map(item => ({
        id: inv.id,
        date: inv.date,
        invoiceNo: inv.invoiceNo,
        customer: inv.customerName,
        qty: item.qty,
        price: item.price,
        status: inv.status
      }))
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-xl font-semibold text-text-primary">Product not found</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/inventory')}>
          Back to Inventory
        </Button>
      </div>
    );
  }

  const handleStatusToggle = (newStatus) => {
    setPendingStatus(newStatus);
    setIsStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    updateProduct(id, { isActive: pendingStatus }, 'Admin User');
    setIsStatusModalOpen(false);
    setPendingStatus(null);
  };

  const handleDamageSubmit = (e) => {
    e.preventDefault();
    if (!damageForm.qty || parseInt(damageForm.qty) <= 0) return;
    
    adjustStock(id, parseInt(damageForm.qty), damageForm.type, damageForm.notes);
    setIsDamageModalOpen(false);
    setDamageForm({ type: 'Damage', qty: '', notes: '' });
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/inventory')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{product.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-text-secondary">
              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium text-gray-700">{product.category}</span>
              <span>SKU: {product.sku}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status Toggle */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-border">
            <span className={`text-xs font-medium ${product.isActive ? 'text-green-600' : 'text-gray-500'}`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
            <Toggle 
              checked={product.isActive} 
              onChange={handleStatusToggle}
            />
          </div>
          <Button icon={AlertOctagon} variant="danger" onClick={() => setIsDamageModalOpen(true)}>Report Damage</Button>
          <Button icon={Edit2} variant="secondary" onClick={() => navigate(`/inventory/edit/${id}`)}>Edit Product</Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Current Stock</p>
              <h3 className="text-2xl font-bold text-blue-900 mt-1">{product.stock} <span className="text-sm font-normal text-blue-700">units</span></h3>
            </div>
            <div className="p-2 bg-white rounded-md text-blue-600">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-3 text-xs text-blue-700">
            Valuation: {formatCurrency(product.stock * product.inPrice)}
          </div>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Total Sold</p>
              <h3 className="text-2xl font-bold text-green-900 mt-1">
                {salesHistory.reduce((acc, curr) => acc + curr.qty, 0)} <span className="text-sm font-normal text-green-700">units</span>
              </h3>
            </div>
            <div className="p-2 bg-white rounded-md text-green-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3 text-xs text-green-700">
            Revenue: {formatCurrency(salesHistory.reduce((acc, curr) => acc + (curr.qty * curr.price), 0))}
          </div>
        </Card>

        <Card className="bg-purple-50 border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Purchase Price</p>
              <h3 className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(product.inPrice)}</h3>
            </div>
            <div className="p-2 bg-white rounded-md text-purple-600">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-3 text-xs text-purple-700 flex gap-2">
            <span>Vendor: {formatCurrency(product.vendorPrice)}</span>
            <span>•</span>
            <span>Cust: {formatCurrency(product.customerPrice)}</span>
          </div>
        </Card>
      </div>

      {/* Tabs & Content */}
      <div className="space-y-4">
        <div className="border-b border-border">
          <div className="flex gap-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('stock')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'stock' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Package size={16} />
              Stock Movement
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'sales' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText size={16} />
              Sales History
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'audit' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <ClipboardList size={16} />
              Audit Logs
            </button>
          </div>
        </div>

        <Card className="overflow-hidden min-h-[400px]">
          {activeTab === 'stock' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Reason / Ref</th>
                    <th className="px-6 py-3 text-right">Quantity</th>
                    <th className="px-6 py-3">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stockHistory.length > 0 ? stockHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-text-primary flex items-center gap-2">
                        <Calendar size={14} className="text-text-secondary" />
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={
                            item.type === 'Damage' || item.type === 'Loss' ? 'danger' :
                            item.type === 'Sale' ? 'warning' : 'success'
                        }>
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {item.reason}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                          ['Damage', 'Loss', 'Sale', 'Manual Adjustment (Out)'].includes(item.type) ? 'text-red-600' : 'text-green-600'
                      }`}>
                         {['Damage', 'Loss', 'Sale', 'Manual Adjustment (Out)'].includes(item.type) ? '-' : '+'}{item.qty}
                      </td>
                      <td className="px-6 py-4 text-text-secondary text-xs">
                        {item.user}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-text-secondary">No stock movement history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'sales' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Invoice #</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3 text-right">Qty Sold</th>
                    <th className="px-6 py-3 text-right">Sale Price</th>
                    <th className="px-6 py-3 text-right">Total Amount</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {salesHistory.length > 0 ? salesHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-text-primary flex items-center gap-2">
                        <Calendar size={14} className="text-text-secondary" />
                        {item.date}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-primary">
                        {item.invoiceNo}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-text-secondary" />
                          <span className="text-text-primary">{item.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-500">
                        -{item.qty}
                      </td>
                      <td className="px-6 py-4 text-right text-text-secondary">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-text-primary">
                        {formatCurrency(item.qty * item.price)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={item.status === 'Paid' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-text-secondary">No sales history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="overflow-x-auto">
              {auditLogs.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">User</th>
                      <th className="px-6 py-3">Action</th>
                      <th className="px-6 py-3">Changes Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-text-primary whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <History size={14} className="text-text-secondary" />
                            {new Date(log.timestamp).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                              {log.user.charAt(0)}
                            </div>
                            <span className="font-medium text-text-primary">{log.user}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default">{log.action}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {log.changes && log.changes.length > 0 ? log.changes.map((change, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="font-medium text-text-secondary uppercase">{change.field}: </span>
                                <span className="text-red-500 line-through mr-2">{String(change.oldValue)}</span>
                                <span className="text-green-600 font-bold">{String(change.newValue)}</span>
                              </div>
                            )) : (
                                <span className="text-xs text-text-secondary">{log.details}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                  <ClipboardList size={48} className="mb-3 opacity-20" />
                  <p>No audit logs found for this product.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Status Confirmation Modal */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => {
          setIsStatusModalOpen(false);
          setPendingStatus(null);
        }}
        title="Confirm Status Change"
      >
        <div className="flex flex-col items-center text-center p-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Are you sure?
          </h3>
          <p className="text-text-secondary mb-6">
            You are about to change the product status to <strong>{pendingStatus ? 'Active' : 'Inactive'}</strong>. 
            {pendingStatus 
              ? ' This product will become visible in billing and inventory lists.' 
              : ' This product will be hidden from billing selection.'}
          </p>
          <div className="flex gap-3 w-full">
            <Button 
              variant="secondary" 
              className="flex-1" 
              onClick={() => {
                setIsStatusModalOpen(false);
                setPendingStatus(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={confirmStatusChange}
            >
              Confirm Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Damage Reporting Modal */}
      <Modal
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
        title="Report Damage / Stock Adjustment"
      >
        <form onSubmit={handleDamageSubmit} className="space-y-4">
            <div className="bg-red-50 p-3 rounded-md border border-red-100 flex gap-2 text-red-800 text-sm mb-2">
                <AlertOctagon size={18} className="shrink-0 mt-0.5" />
                <p>This action will reduce the stock count immediately and log a permanent entry in the stock history.</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Adjustment Type</label>
                <select 
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    value={damageForm.type}
                    onChange={e => setDamageForm({...damageForm, type: e.target.value})}
                >
                    <option value="Damage">Damage (Broken/Defective)</option>
                    <option value="Loss">Loss / Theft</option>
                    <option value="Internal Use">Internal Use / Sample</option>
                    <option value="Correction">Inventory Correction (Count Mismatch)</option>
                    <option value="Expired">Expired Goods</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Quantity to Remove</label>
                <input 
                    type="number"
                    min="1"
                    max={product.stock}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    value={damageForm.qty}
                    onChange={e => setDamageForm({...damageForm, qty: e.target.value})}
                    required
                />
                <p className="text-xs text-text-secondary mt-1">Current Stock: {product.stock}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Notes / Reason</label>
                <textarea 
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    rows={3}
                    value={damageForm.notes}
                    onChange={e => setDamageForm({...damageForm, notes: e.target.value})}
                    placeholder="Describe the damage or reason for adjustment..."
                    required
                />
            </div>
            <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsDamageModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="danger">Confirm Adjustment</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};
