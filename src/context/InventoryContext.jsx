import React, { createContext, useContext, useState } from 'react';
import { faker } from '@faker-js/faker';

const InventoryContext = createContext();

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Mobile Accessories',
  'Computer Peripherals',
  'Home Appliances',
  'Cables & Adapters',
  'Storage Devices'
];

// --- Initial Data Generators ---

const generateInventory = (count) => {
  return Array.from({ length: count }).map(() => {
    const inPrice = parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 }));
    const margin = faker.number.float({ min: 1.2, max: 1.5 });
    
    return {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      category: faker.helpers.arrayElement(PRODUCT_CATEGORIES),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      tags: faker.commerce.productAdjective() + ', ' + faker.commerce.productMaterial(),
      stock: faker.number.int({ min: 0, max: 150 }),
      inPrice: inPrice,
      vendorPrice: parseFloat((inPrice * 1.15).toFixed(2)),
      minVendorPrice: parseFloat((inPrice * 1.05).toFixed(2)),
      customerPrice: parseFloat((inPrice * margin).toFixed(2)),
      minCustomerPrice: parseFloat((inPrice * (margin - 0.1)).toFixed(2)),
      isActive: faker.datatype.boolean(0.9),
      lastUpdated: faker.date.recent().toLocaleDateString('en-IN')
    };
  });
};

const generateCustomers = (count) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    company: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number('+91 9#### #####'),
    city: faker.location.city(),
    balance: parseFloat(faker.finance.amount({ min: 0, max: 50000, dec: 2 })),
    status: 'Active',
    history: [] 
  }));
};

const generateVendors = (count) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    company: faker.company.name(),
    address: faker.location.streetAddress({ useFullAddress: true }) + ', ' + faker.location.city(),
    contactPerson: faker.person.fullName(),
    phone: faker.phone.number('+91 9#### #####'),
    email: faker.internet.email(),
    gstin: '29' + faker.string.alphanumeric(13).toUpperCase(),
    balance: parseFloat(faker.finance.amount({ min: 0, max: 100000, dec: 2 })),
    status: 'Active',
    history: []
  }));
};

const generateInvoices = (count, customers) => {
  return Array.from({ length: count }).map(() => {
    const customer = faker.helpers.arrayElement(customers);
    return {
      id: faker.string.uuid(),
      invoiceNo: 'INV-' + faker.string.numeric(5),
      date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      customerId: customer?.id,
      customerName: customer?.name || 'Unknown',
      amount: parseFloat(faker.finance.amount({ min: 500, max: 25000, dec: 2 })),
      status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue', 'Draft']),
      items: [] // Simplified for initial generation
    };
  });
};

export const InventoryProvider = ({ children }) => {
  // --- State ---
  const [products, setProducts] = useState(() => generateInventory(12));
  const [customers, setCustomers] = useState(() => generateCustomers(10));
  const [vendors, setVendors] = useState(() => generateVendors(8));
  
  // Initialize invoices dependent on customers
  const [invoices, setInvoices] = useState(() => generateInvoices(10, customers));
  
  const [auditLogs, setAuditLogs] = useState([]);

  // --- Actions: Products ---
  const addProduct = (product) => {
    setProducts((prev) => [product, ...prev]);
    logAction(product.id, 'Product', 'Create', `Created product ${product.name}`);
  };

  const updateProduct = (id, updatedFields, user = 'Admin User') => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields, lastUpdated: new Date().toLocaleDateString('en-IN') } : p));
    logAction(id, 'Product', 'Update', `Updated product details`, user);
  };

  const checkDuplicateName = (name, excludeId = null) => {
    return products.some(p => p.name.toLowerCase() === name.trim().toLowerCase() && p.id !== excludeId);
  };

  // --- Actions: Customers ---
  const addCustomer = (customer) => {
    setCustomers(prev => [customer, ...prev]);
    logAction(customer.id, 'Customer', 'Create', `Added new customer ${customer.name}`);
    return customer;
  };

  // --- Actions: Vendors ---
  const addVendor = (vendor) => {
    setVendors(prev => [vendor, ...prev]);
    logAction(vendor.id, 'Vendor', 'Create', `Added new vendor ${vendor.company}`);
  };

  // --- Actions: Invoices ---
  const addInvoice = (invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    
    // Update Customer Balance
    setCustomers(prev => prev.map(c => {
      if (c.id === invoice.customerId && invoice.status !== 'Paid') {
        return { ...c, balance: c.balance + invoice.amount };
      }
      return c;
    }));

    // Deduct Stock
    invoice.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.productId) {
          return { ...p, stock: p.stock - item.qty };
        }
        return p;
      }));
    });

    logAction(invoice.id, 'Billing', 'Create', `Created Invoice ${invoice.invoiceNo}`);
  };

  const updateInvoice = (id, updatedInvoice) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
    logAction(id, 'Billing', 'Update', `Updated Invoice ${updatedInvoice.invoiceNo}`);
  };

  // --- Helper: Audit Logging ---
  const logAction = (entityId, module, action, details, user = 'Admin User') => {
    const newLog = {
      id: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      user,
      module,
      action,
      details,
      entityId,
      ip: '127.0.0.1' // Mock IP
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const getProductLogs = (productId) => auditLogs.filter(l => l.entityId === productId);

  return (
    <InventoryContext.Provider value={{ 
      products, addProduct, updateProduct, checkDuplicateName, getProductLogs,
      customers, addCustomer,
      vendors, addVendor,
      invoices, addInvoice, updateInvoice,
      auditLogs
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
