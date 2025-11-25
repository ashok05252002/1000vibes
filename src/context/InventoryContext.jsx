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
      sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase(),
      image: null, // Placeholder for image URL
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

// Generate items for bills/invoices
const generateLineItems = (count) => {
  return Array.from({ length: count }).map(() => {
    const qty = faker.number.int({ min: 1, max: 10 });
    const price = parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 }));
    return {
      id: faker.string.uuid(),
      productId: faker.string.uuid(), // In real app, this matches a product ID
      productName: faker.commerce.productName(),
      qty: qty,
      price: price,
      total: qty * price
    };
  });
};

const generateInvoices = (count, customers) => {
  return Array.from({ length: count }).map(() => {
    const customer = faker.helpers.arrayElement(customers);
    const items = generateLineItems(faker.number.int({ min: 1, max: 5 }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    
    return {
      id: faker.string.uuid(),
      invoiceNo: 'INV-' + faker.string.numeric(5),
      date: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      customerId: customer?.id,
      customerName: customer?.name || 'Unknown',
      amount: totalAmount,
      status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
      items: items
    };
  });
};

const generateBills = (count, vendors) => {
  return Array.from({ length: count }).map(() => {
    const vendor = faker.helpers.arrayElement(vendors);
    const items = generateLineItems(faker.number.int({ min: 2, max: 8 }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    return {
      id: faker.string.uuid(),
      billNo: 'BILL-' + faker.string.numeric(5),
      date: faker.date.recent({ days: 45 }).toLocaleDateString('en-IN'),
      vendorId: vendor?.id,
      vendorName: vendor?.company || 'Unknown Vendor',
      amount: totalAmount,
      status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
      items: items
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const InventoryProvider = ({ children }) => {
  // --- State ---
  const [products, setProducts] = useState(() => generateInventory(12));
  const [customers, setCustomers] = useState(() => generateCustomers(10));
  const [vendors, setVendors] = useState(() => generateVendors(8));
  
  const [invoices, setInvoices] = useState(() => generateInvoices(10, customers));
  const [bills, setBills] = useState(() => generateBills(8, vendors));
  
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

  // --- Actions: Bills (Vendors) ---
  // Placeholder for adding bills if we implement Add Bill form later
  const addBill = (bill) => {
    setBills(prev => [bill, ...prev]);
    logAction(bill.id, 'Billing', 'Create', `Created Vendor Bill ${bill.billNo}`);
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
      bills, addBill,
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
