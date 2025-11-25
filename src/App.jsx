import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { MastersPage } from './pages/Masters';
import { CustomersPage } from './pages/Customers';
import { VendorsPage } from './pages/Vendors';
import { InventoryPage } from './pages/Inventory';
import { AddProductPage } from './pages/AddProduct';
import { EditProductPage } from './pages/EditProduct';
import { ProductViewPage } from './pages/ProductView';
import { AuditLogsPage } from './pages/AuditLogs';
import { CustomerBillingPage } from './pages/billing/CustomerBilling';
import { AddInvoicePage } from './pages/billing/AddInvoice';
import { InvoiceViewPage } from './pages/billing/InvoiceView';
import { VendorBillingPage } from './pages/billing/VendorBilling';
import { VendorBillViewPage } from './pages/billing/VendorBillView';
import { BillingPOS } from './pages/billing/BillingPOS'; // New POS Page
import { InventoryProvider } from './context/InventoryContext';

const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
    <p className="text-text-secondary mt-2 max-w-md">
      This module is part of the full Inventory System but not included in this UI demo.
    </p>
  </div>
);

function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="masters" element={<MastersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            
            {/* Inventory Routes */}
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/add" element={<AddProductPage />} />
            <Route path="inventory/edit/:id" element={<EditProductPage />} />
            <Route path="inventory/:id" element={<ProductViewPage />} />
            
            {/* Billing (POS) Route */}
            <Route path="billing" element={<BillingPOS />} />
            
            {/* History / Transactions Routes */}
            <Route path="history" element={<Navigate to="/history/sales" replace />} />
            <Route path="history/sales" element={<CustomerBillingPage />} />
            <Route path="history/purchases" element={<VendorBillingPage />} />

            {/* Detail Views (Kept accessible) */}
            <Route path="billing/customer/add" element={<AddInvoicePage />} /> {/* Fallback/Legacy Add */}
            <Route path="billing/customer/edit/:id" element={<AddInvoicePage />} />
            <Route path="billing/customer/:id" element={<InvoiceViewPage />} />
            <Route path="billing/vendor/:id" element={<VendorBillViewPage />} />
            
            {/* Audit Logs */}
            <Route path="audit-logs" element={<AuditLogsPage />} />
            
            <Route path="credits" element={<Placeholder title="Credit Management" />} />
            <Route path="expenses" element={<Placeholder title="Expense Tracking" />} />
            <Route path="closing" element={<Placeholder title="Daily Closing (EOD)" />} />
            <Route path="reports" element={<Placeholder title="Reports & Analytics" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;
