import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { MastersPage } from './pages/Masters';
import { CustomersPage } from './pages/Customers';
import { CustomerDetailsPage } from './pages/CustomerDetails'; 
import { VendorsPage } from './pages/Vendors';
import { VendorDetailsPage } from './pages/VendorDetails'; 
import { InventoryPage } from './pages/Inventory';
import { AddProductPage } from './pages/AddProduct';
import { EditProductPage } from './pages/EditProduct';
import { ProductViewPage } from './pages/ProductView';
import { StockInPage } from './pages/StockIn'; // New Import
import { AuditLogsPage } from './pages/AuditLogs';
import { CustomerBillingPage } from './pages/billing/CustomerBilling';
import { AddInvoicePage } from './pages/billing/AddInvoice';
import { InvoiceViewPage } from './pages/billing/InvoiceView';
import { VendorBillingPage } from './pages/billing/VendorBilling';
import { VendorBillViewPage } from './pages/billing/VendorBillView';
import { BillingPOS } from './pages/billing/BillingPOS';
import { CreditsPage } from './pages/Credits'; 
import { ExpensesPage } from './pages/Expenses';
import { DailyClosingPage } from './pages/DailyClosing';
import { ReportsPage } from './pages/Reports';
import { InventoryProvider } from './context/InventoryContext';

function App() {
  return (
    <InventoryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="masters" element={<MastersPage />} />
            
            {/* Customer Routes */}
            <Route path="customers" element={<CustomersPage />} />
            <Route path="customers/:id" element={<CustomerDetailsPage />} />
            
            {/* Vendor Routes */}
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="vendors/:id" element={<VendorDetailsPage />} />
            
            {/* Inventory Routes */}
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="inventory/add" element={<AddProductPage />} />
            <Route path="inventory/stock-in" element={<StockInPage />} /> {/* New Route */}
            <Route path="inventory/edit/:id" element={<EditProductPage />} />
            <Route path="inventory/:id" element={<ProductViewPage />} />
            
            {/* Billing (POS) Route */}
            <Route path="billing" element={<BillingPOS />} />
            
            {/* History / Transactions Routes */}
            <Route path="history" element={<Navigate to="/history/sales" replace />} />
            <Route path="history/sales" element={<CustomerBillingPage />} />
            <Route path="history/purchases" element={<VendorBillingPage />} />

            {/* Detail Views */}
            <Route path="billing/customer/add" element={<AddInvoicePage />} />
            <Route path="billing/customer/edit/:id" element={<AddInvoicePage />} />
            <Route path="billing/customer/:id" element={<InvoiceViewPage />} />
            <Route path="billing/vendor/:id" element={<VendorBillViewPage />} />
            
            {/* Audit Logs */}
            <Route path="audit-logs" element={<AuditLogsPage />} />
            
            {/* Credits */}
            <Route path="credits" element={<CreditsPage />} />
            
            {/* Expenses */}
            <Route path="expenses" element={<ExpensesPage />} />
            
            {/* Daily Closing */}
            <Route path="closing" element={<DailyClosingPage />} />
            
            {/* Reports */}
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </InventoryProvider>
  );
}

export default App;
