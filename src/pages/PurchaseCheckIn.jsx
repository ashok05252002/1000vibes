import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, PackageCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useInventory } from '../context/InventoryContext';

export const PurchaseCheckInPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { purchaseOrders, checkInPurchaseOrder } = useInventory();

  const po = purchaseOrders.find(p => p.id === id);
  
  // State for check-in items
  const [checkInItems, setCheckInItems] = useState([]);

  useEffect(() => {
    if (po && po.status === 'Pending') {
      // Initialize check-in items with ordered quantities
      setCheckInItems(po.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        orderedQty: item.qty,
        receivedQty: item.qty, // Default to receiving full amount
        remarks: ''
      })));
    }
  }, [po]);

  if (!po) return <div>Purchase Order not found</div>;

  if (po.status === 'Received') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Already Checked In</h2>
        <p className="text-text-secondary">This purchase order has already been received and processed.</p>
        <Button onClick={() => navigate(`/purchase-orders/${po.id}`)}>View Order Details</Button>
      </div>
    );
  }

  const handleQtyChange = (index, value) => {
    const newItems = [...checkInItems];
    newItems[index].receivedQty = value === '' ? '' : parseInt(value) || 0;
    setCheckInItems(newItems);
  };

  const handleRemarksChange = (index, value) => {
    const newItems = [...checkInItems];
    newItems[index].remarks = value;
    setCheckInItems(newItems);
  };

  const handleCheckIn = () => {
    // Validation: Ensure remarks are provided if qty differs
    for (let i = 0; i < checkInItems.length; i++) {
        const item = checkInItems[i];
        if (item.receivedQty !== item.orderedQty && !item.remarks.trim()) {
            return alert(`Please provide remarks for "${item.productName}" since the received quantity differs from the ordered quantity.`);
        }
    }

    checkInPurchaseOrder(po.id, checkInItems);
    navigate('/purchases');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/purchases')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Check-in PO {po.poNo}</h1>
            <p className="text-sm text-text-secondary">Dealer: {po.dealerName} | Date: {po.date}</p>
          </div>
        </div>
        <Button icon={PackageCheck} onClick={handleCheckIn}>Confirm & Check In</Button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 text-sm text-blue-800 flex items-start gap-3">
        <AlertTriangle size={18} className="shrink-0 mt-0.5" />
        <p>
          Verify the physical stock received against the ordered quantities. 
          If the received quantity is different, you <strong>must</strong> provide a remark. 
          Confirming this will automatically update your inventory stock. Financial details are hidden on this screen.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3 w-[30%]">Product</th>
                <th className="px-6 py-3 text-center w-[15%]">Ordered Qty</th>
                <th className="px-6 py-3 text-center w-[15%]">Received Qty</th>
                <th className="px-6 py-3 w-[40%]">Remarks (Required if changed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {checkInItems.map((item, idx) => {
                const isDiff = item.receivedQty !== item.orderedQty;
                return (
                  <tr key={idx} className={`hover:bg-gray-50 ${isDiff ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-6 py-4 font-medium text-text-primary">
                      {item.productName}
                    </td>
                    <td className="px-6 py-4 text-center text-text-secondary font-medium">
                      {item.orderedQty}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="number" 
                        min="0"
                        className={`w-20 p-2 border rounded-md text-sm text-center outline-none focus:ring-2 focus:ring-primary/20 ${isDiff ? 'border-orange-300 bg-orange-50 text-orange-700 font-bold' : 'border-border'}`}
                        value={item.receivedQty}
                        onChange={(e) => handleQtyChange(idx, e.target.value)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="text" 
                        placeholder={isDiff ? "Required: Reason for difference..." : "Optional remarks..."}
                        className={`w-full p-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 ${isDiff && !item.remarks.trim() ? 'border-red-500 bg-red-50' : 'border-border'}`}
                        value={item.remarks}
                        onChange={(e) => handleRemarksChange(idx, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
