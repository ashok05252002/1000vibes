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

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Salaries',
  'Office Supplies',
  'Travel',
  'Maintenance',
  'Internet',
  'Refreshments',
  'Miscellaneous'
];

export const PERMISSIONS_LIST = [
  { id: 'inventory_view', label: 'View Inventory' },
  { id: 'inventory_manage', label: 'Manage Inventory (Add/Edit)' },
  { id: 'billing_access', label: 'Access Billing (POS)' },
  { id: 'customers_manage', label: 'Manage Customers' },
  { id: 'vendors_manage', label: 'Manage Vendors' },
  { id: 'expenses_manage', label: 'Manage Expenses' },
  { id: 'reports_view', label: 'View Reports' },
  { id: 'users_manage', label: 'Manage Users & Roles' },
  { id: 'settings_access', label: 'System Settings' }
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
      image: null, 
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
    status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Inactive']),
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

const generateDealers = (count) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    category: faker.helpers.arrayElement(PRODUCT_CATEGORIES),
    phone: faker.phone.number('+91 9#### #####'),
    email: faker.internet.email(),
    balance: parseFloat(faker.finance.amount({ min: 0, max: 50000, dec: 2 })),
    status: 'Active'
  }));
};

const generateLineItems = (count) => {
  return Array.from({ length: count }).map(() => {
    const qty = faker.number.int({ min: 1, max: 10 });
    const price = parseFloat(faker.finance.amount({ min: 100, max: 5000, dec: 2 }));
    return {
      id: faker.string.uuid(),
      productId: faker.string.uuid(), 
      productName: faker.commerce.productName(),
      qty: qty,
      price: price,
      total: qty * price
    };
  });
};

const generateInvoices = (count, customers) => {
  const today = new Date().toISOString().split('T')[0];
  
  return Array.from({ length: count }).map((_, index) => {
    const customer = faker.helpers.arrayElement(customers);
    const items = generateLineItems(faker.number.int({ min: 1, max: 5 }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const status = faker.helpers.arrayElement(['Paid', 'Paid', 'Pending', 'Overdue']);
    
    const date = index < 5 ? today : faker.date.recent({ days: 60 }).toISOString().split('T')[0];
    
    let paidAmount = 0;
    if (status === 'Paid') paidAmount = totalAmount;
    else if (status === 'Pending' || status === 'Overdue') paidAmount = 0;
    else paidAmount = totalAmount * 0.5;

    return {
      id: faker.string.uuid(),
      invoiceNo: 'INV-' + faker.string.numeric(5),
      date: date,
      customerId: customer?.id,
      customerName: customer?.name || 'Unknown',
      amount: totalAmount,
      paidAmount: paidAmount,
      dueAmount: totalAmount - paidAmount,
      status: status,
      paymentMode: status === 'Paid' ? faker.helpers.arrayElement(['Cash', 'UPI', 'Card', 'Bank Transfer']) : 'Cash',
      items: items
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

const generateBills = (count, vendors) => {
  return Array.from({ length: count }).map(() => {
    const vendor = faker.helpers.arrayElement(vendors);
    const items = generateLineItems(faker.number.int({ min: 2, max: 8 }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    return {
      id: faker.string.uuid(),
      billNo: 'BILL-' + faker.string.numeric(5),
      date: faker.date.recent({ days: 60 }).toLocaleDateString('en-IN'),
      vendorId: vendor?.id,
      vendorName: vendor?.company || 'Unknown Vendor',
      amount: totalAmount,
      status: faker.helpers.arrayElement(['Paid', 'Pending', 'Overdue']),
      items: items
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

const generatePurchaseOrders = (count, dealers) => {
  return Array.from({ length: count }).map(() => {
    const dealer = faker.helpers.arrayElement(dealers);
    const items = generateLineItems(faker.number.int({ min: 1, max: 5 }));
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    const paymentStatus = faker.helpers.arrayElement(['Paid', 'Partial', 'Unpaid']);
    const poDate = faker.date.recent({ days: 30 }).toISOString().split('T')[0];
    
    let paidAmount = 0;
    let paymentHistory = [];

    if (paymentStatus === 'Paid') {
        paidAmount = totalAmount;
        paymentHistory.push({
            id: faker.string.uuid(),
            date: poDate,
            amount: paidAmount,
            mode: 'Bank Transfer',
            notes: 'Full Payment'
        });
    } else if (paymentStatus === 'Partial') {
        paidAmount = totalAmount * 0.5;
        paymentHistory.push({
            id: faker.string.uuid(),
            date: poDate,
            amount: paidAmount,
            mode: 'Bank Transfer',
            notes: 'Advance Payment'
        });
    }

    return {
      id: faker.string.uuid(),
      poNo: 'PO-' + faker.string.numeric(5),
      date: poDate,
      dealerId: dealer?.id,
      dealerName: dealer?.name || 'Unknown Dealer',
      amount: totalAmount,
      paidAmount: paidAmount,
      dueAmount: totalAmount - paidAmount,
      paymentStatus: paymentStatus,
      status: faker.helpers.arrayElement(['Pending', 'Received']),
      items: items,
      paymentHistory: paymentHistory
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

const generateExpenses = (count) => {
  const today = new Date().toISOString().split('T')[0];

  return Array.from({ length: count }).map((_, index) => {
    const date = index < 3 ? today : faker.date.recent({ days: 90 }).toISOString().split('T')[0];

    return {
      id: faker.string.uuid(),
      date: date,
      category: faker.helpers.arrayElement(EXPENSE_CATEGORIES),
      amount: parseFloat(faker.finance.amount({ min: 100, max: 15000, dec: 2 })),
      description: faker.lorem.sentence(3),
      paymentMode: faker.helpers.arrayElement(['Cash', 'UPI', 'Bank Transfer', 'Card']),
      recordedBy: 'Admin User',
      reflectInDailyClosing: faker.datatype.boolean(0.8) // 80% chance to be true
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));
};

const generateRoles = () => [
  { id: 'role-admin', name: 'Super Admin', permissions: PERMISSIONS_LIST.map(p => p.id), isSystem: true },
  { id: 'role-manager', name: 'Store Manager', permissions: ['inventory_view', 'inventory_manage', 'billing_access', 'reports_view', 'customers_manage', 'vendors_manage', 'expenses_manage'], isSystem: false },
  { id: 'role-staff', name: 'Billing Staff', permissions: ['inventory_view', 'billing_access', 'customers_manage'], isSystem: false },
];

const generateUsers = (roles) => {
  return Array.from({ length: 5 }).map(() => {
    const role = faker.helpers.arrayElement(roles);
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      roleId: role.id,
      roleName: role.name,
      status: faker.helpers.arrayElement(['Active', 'Active', 'Inactive']),
      lastLogin: faker.date.recent().toLocaleDateString()
    };
  });
};

const generateStockMovements = (products) => {
    let movements = [];
    products.forEach(p => {
        movements.push({
            id: faker.string.uuid(),
            productId: p.id,
            date: faker.date.past().toISOString().split('T')[0],
            type: 'Opening Stock',
            qty: p.stock + 10,
            reason: 'Initial Setup',
            user: 'System'
        });
    });
    return movements;
};

export const InventoryProvider = ({ children }) => {
  // --- State ---
  const [roles, setRoles] = useState(() => generateRoles());
  const [products, setProducts] = useState(() => generateInventory(60));
  const [customers, setCustomers] = useState(() => generateCustomers(45));
  const [vendors, setVendors] = useState(() => generateVendors(25));
  const [dealers, setDealers] = useState(() => generateDealers(15));
  const [users, setUsers] = useState(() => generateUsers(roles)); 
  
  const [invoices, setInvoices] = useState(() => generateInvoices(120, customers));
  const [bills, setBills] = useState(() => generateBills(50, vendors));
  const [purchaseOrders, setPurchaseOrders] = useState(() => generatePurchaseOrders(30, dealers));
  const [expenses, setExpenses] = useState(() => generateExpenses(40));
  
  const [stockMovements, setStockMovements] = useState(() => generateStockMovements(products));

  // --- Unified Ledger (Transactions) ---
  const [transactions, setTransactions] = useState(() => {
    let txs = [];
    invoices.forEach(inv => {
        if (inv.paidAmount > 0) {
            txs.push({ id: faker.string.uuid(), date: inv.date, type: 'Income', category: 'Sales', amount: inv.paidAmount, mode: inv.paymentMode || 'Cash', description: `Invoice ${inv.invoiceNo}` });
        }
    });
    expenses.forEach(exp => {
        txs.push({ id: faker.string.uuid(), date: exp.date, type: 'Expense', category: 'Expense', amount: exp.amount, mode: exp.paymentMode || 'Cash', description: exp.category });
    });
    purchaseOrders.forEach(po => {
        if (po.paymentHistory) {
            po.paymentHistory.forEach(ph => {
                txs.push({ id: ph.id, date: ph.date, type: 'Expense', category: 'PO Payment', amount: ph.amount, mode: ph.mode || 'Bank Transfer', description: `PO ${po.poNo}` });
            });
        }
    });
    return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  const [dailyClosings, setDailyClosings] = useState(() => {
    return Array.from({ length: 5 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i + 1));
      return {
        id: faker.string.uuid(),
        date: date.toISOString().split('T')[0],
        openingBalance: 2000,
        cashSales: 15000,
        onlineSales: 5000,
        cashExpenses: 1000,
        expectedCash: 16000,
        actualCash: 16000,
        discrepancy: 0,
        notes: 'Closed on time',
        closedBy: 'Admin User'
      };
    });
  });
  
  const [auditLogs, setAuditLogs] = useState([]);

  // --- Helper: Audit Logging ---
  const logAction = (entityId, module, action, details, user = 'Admin User', changes = []) => {
    const newLog = {
      id: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      user,
      module,
      action,
      details,
      entityId,
      changes,
      ip: '127.0.0.1' 
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- Actions: Roles & Users ---
  const addRole = (role) => {
    setRoles(prev => [...prev, role]);
    logAction(role.id, 'Roles', 'Create', `Created new role: ${role.name}`);
  };

  const addUser = (user) => {
    setUsers(prev => [user, ...prev]);
    logAction(user.id, 'Users', 'Create', `Created new user: ${user.name}`);
  };

  // --- Actions: Products ---
  const addProduct = (product) => {
    setProducts((prev) => [product, ...prev]);
    setStockMovements(prev => [{
        id: faker.string.uuid(),
        productId: product.id,
        date: new Date().toISOString().split('T')[0],
        type: 'Opening Stock',
        qty: product.stock,
        reason: 'New Product Added',
        user: 'Admin User'
    }, ...prev]);
    logAction(product.id, 'Product', 'Create', `Created product ${product.name}`);
  };

  const updateProduct = (id, updatedFields, user = 'Admin User') => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields, lastUpdated: new Date().toLocaleDateString('en-IN') } : p));
    
    const product = products.find(p => p.id === id);
    const changes = [];
    Object.keys(updatedFields).forEach(key => {
      if (product[key] !== updatedFields[key]) {
        changes.push({ field: key, oldValue: product[key], newValue: updatedFields[key] });
      }
    });

    if (updatedFields.stock !== undefined && updatedFields.stock !== product.stock) {
        const diff = updatedFields.stock - product.stock;
        setStockMovements(prev => [{
            id: faker.string.uuid(),
            productId: id,
            date: new Date().toISOString().split('T')[0],
            type: diff > 0 ? 'Manual Adjustment (In)' : 'Manual Adjustment (Out)',
            qty: Math.abs(diff),
            reason: 'Stock updated via Edit Screen',
            user: user
        }, ...prev]);
    }

    logAction(id, 'Product', 'Update', `Updated product details`, user, changes);
  };

  const adjustStock = (productId, qty, type, notes, user = 'Admin User') => {
    setProducts(prev => prev.map(p => {
        if (p.id === productId) {
            return { ...p, stock: p.stock - qty };
        }
        return p;
    }));

    setStockMovements(prev => [{
        id: faker.string.uuid(),
        productId,
        date: new Date().toISOString().split('T')[0],
        type: type,
        qty: qty,
        reason: notes,
        user
    }, ...prev]);

    logAction(productId, 'Inventory', 'Adjustment', `Stock adjusted: ${type} - ${qty} units`, user);
  };

  const stockIn = (productId, qty, newPrice, notes, user = 'Admin User') => {
    setProducts(prev => prev.map(p => {
        if (p.id === productId) {
            return { ...p, stock: p.stock + qty, inPrice: newPrice };
        }
        return p;
    }));

    setStockMovements(prev => [{
        id: faker.string.uuid(),
        productId,
        date: new Date().toISOString().split('T')[0],
        type: 'Stock In',
        qty: qty,
        reason: notes || 'Manual Stock In',
        user
    }, ...prev]);

    logAction(productId, 'Inventory', 'Stock In', `Added ${qty} units @ ${newPrice}`, user);
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

  const recordPayment = (customerId, amount, mode, notes) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        return { ...c, balance: Math.max(0, c.balance - amount) };
      }
      return c;
    }));

    // Log to unified transactions ledger
    setTransactions(prev => [{
        id: faker.string.uuid(),
        date: new Date().toISOString().split('T')[0],
        type: 'Income',
        category: 'Credit Receipt',
        amount,
        mode,
        description: `Payment from Customer - ${notes}`
    }, ...prev]);

    logAction(customerId, 'Credits', 'Payment', `Received payment of ₹${amount} via ${mode}. Notes: ${notes}`);
  };

  // --- Actions: Vendors & Dealers ---
  const addVendor = (vendor) => {
    setVendors(prev => [vendor, ...prev]);
    logAction(vendor.id, 'Vendor', 'Create', `Added new vendor ${vendor.company}`);
  };

  const addDealer = (dealer) => {
    setDealers(prev => [dealer, ...prev]);
    logAction(dealer.id, 'Dealer', 'Create', `Added new dealer ${dealer.name}`);
  };

  // --- Actions: Purchase Orders ---
  const addPurchaseOrder = (po) => {
    const finalPO = {
        ...po,
        paymentHistory: po.paymentHistory || []
    };

    // If there's an initial paid amount, record it in history and transactions
    if (finalPO.paidAmount > 0 && finalPO.paymentHistory.length === 0) {
        const paymentId = faker.string.uuid();
        finalPO.paymentHistory.push({
            id: paymentId,
            date: finalPO.date,
            amount: finalPO.paidAmount,
            mode: 'Cash', // Default assumption for initial payment if not specified
            notes: 'Initial Payment'
        });

        // Log to unified transactions ledger
        setTransactions(prev => [{
            id: paymentId,
            date: finalPO.date,
            type: 'Expense',
            category: 'PO Payment',
            amount: finalPO.paidAmount,
            mode: 'Cash',
            description: `Initial Payment for PO ${finalPO.poNo}`
        }, ...prev]);
    }

    setPurchaseOrders(prev => [finalPO, ...prev]);
    
    // Update Dealer Balance if there is a due amount
    if (finalPO.dealerId && finalPO.dueAmount > 0) {
      setDealers(prev => prev.map(d => {
        if (d.id === finalPO.dealerId) {
          return { ...d, balance: d.balance + finalPO.dueAmount };
        }
        return d;
      }));
    }

    logAction(finalPO.id, 'Purchase Order', 'Create', `Created PO ${finalPO.poNo} (${finalPO.paymentStatus})`);
  };

  const recordPOPayment = (poId, amount, mode, date, notes) => {
    setPurchaseOrders(prev => prev.map(po => {
        if (po.id === poId) {
            const newPaidAmount = po.paidAmount + amount;
            const newDueAmount = Math.max(0, po.amount - newPaidAmount);
            
            let newStatus = po.paymentStatus;
            if (newDueAmount === 0) newStatus = 'Paid';
            else if (newPaidAmount > 0) newStatus = 'Partial';

            const newPayment = {
                id: faker.string.uuid(),
                date: date || new Date().toISOString().split('T')[0],
                amount,
                mode,
                notes
            };

            // Update Dealer Balance (reduce payable amount)
            if (po.dealerId) {
                setDealers(dPrev => dPrev.map(d => {
                    if (d.id === po.dealerId) {
                        return { ...d, balance: Math.max(0, d.balance - amount) };
                    }
                    return d;
                }));
            }

            // Log to unified transactions ledger
            setTransactions(txPrev => [{
                id: newPayment.id,
                date: newPayment.date,
                type: 'Expense',
                category: 'PO Payment',
                amount,
                mode,
                description: `Payment for PO ${po.poNo} - ${notes}`
            }, ...txPrev]);

            logAction(poId, 'Purchase Order', 'Payment', `Recorded payment of ₹${amount} for PO ${po.poNo}`);

            return {
                ...po,
                paidAmount: newPaidAmount,
                dueAmount: newDueAmount,
                paymentStatus: newStatus,
                paymentHistory: [...(po.paymentHistory || []), newPayment]
            };
        }
        return po;
    }));
  };

  // --- Actions: Invoices ---
  const addInvoice = (invoice) => {
    const paidAmount = invoice.paidAmount !== undefined ? invoice.paidAmount : (invoice.status === 'Paid' ? invoice.amount : 0);
    const dueAmount = invoice.amount - paidAmount;
    
    let status = invoice.status;
    if (dueAmount <= 0) {
        status = 'Paid';
    } else if (paidAmount > 0) {
        status = 'Partial';
    } else {
        status = 'Pending';
    }

    const finalInvoice = {
        ...invoice,
        status,
        paidAmount,
        dueAmount: Math.max(0, dueAmount)
    };

    setInvoices(prev => [finalInvoice, ...prev]);
    
    // Log to unified transactions ledger if payment was made
    if (paidAmount > 0) {
        setTransactions(prev => [{
            id: faker.string.uuid(),
            date: finalInvoice.date,
            type: 'Income',
            category: 'Sales',
            amount: paidAmount,
            mode: finalInvoice.paymentMode || 'Cash',
            description: `Invoice ${finalInvoice.invoiceNo}`
        }, ...prev]);
    }

    if (finalInvoice.customerId && dueAmount > 0) {
      setCustomers(prev => prev.map(c => {
        if (c.id === finalInvoice.customerId) {
          return { ...c, balance: c.balance + dueAmount };
        }
        return c;
      }));
    }

    invoice.items.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.productId) {
          return { ...p, stock: p.stock - item.qty };
        }
        return p;
      }));
      
      setStockMovements(prev => [{
          id: faker.string.uuid(),
          productId: item.productId,
          date: invoice.date,
          type: 'Sale',
          qty: item.qty,
          reason: `Invoice #${invoice.invoiceNo}`,
          user: 'System'
      }, ...prev]);
    });

    logAction(invoice.id, 'Billing', 'Create', `Created Invoice ${invoice.invoiceNo} (${status})`);
  };

  const updateInvoice = (id, updatedInvoice) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? updatedInvoice : inv));
    logAction(id, 'Billing', 'Update', `Updated Invoice ${updatedInvoice.invoiceNo}`);
  };

  const addBill = (bill) => {
    setBills(prev => [bill, ...prev]);
    logAction(bill.id, 'Billing', 'Create', `Created Vendor Bill ${bill.billNo}`);
  };

  const addExpense = (expense) => {
    setExpenses(prev => [expense, ...prev]);
    
    // Log to unified transactions ledger
    setTransactions(prev => [{
        id: faker.string.uuid(),
        date: expense.date,
        type: 'Expense',
        category: 'Expense',
        amount: expense.amount,
        mode: expense.paymentMode || 'Cash',
        description: expense.category
    }, ...prev]);

    logAction(expense.id, 'Expenses', 'Create', `Added expense: ${expense.category} - ₹${expense.amount}`);
  };

  const addDailyClosing = (closingData) => {
    setDailyClosings(prev => [closingData, ...prev]);
    
    // If there is a discrepancy, log it as an adjustment transaction
    if (closingData.discrepancy !== 0) {
        setTransactions(prev => [{
            id: faker.string.uuid(),
            date: closingData.date,
            type: closingData.discrepancy > 0 ? 'Income' : 'Expense',
            category: 'Cash Adjustment',
            amount: Math.abs(closingData.discrepancy),
            mode: 'Cash',
            description: `Daily Closing Discrepancy (${closingData.date})`
        }, ...prev]);
    }

    logAction(closingData.id, 'Closing', 'Create', `Performed Daily Closing for ${closingData.date}`);
  };

  const getProductLogs = (productId) => auditLogs.filter(l => l.entityId === productId);
  const getProductHistory = (productId) => stockMovements.filter(m => m.productId === productId).sort((a,b) => new Date(b.date) - new Date(a.date));

  return (
    <InventoryContext.Provider value={{ 
      roles, addRole,
      users, addUser,
      products, addProduct, updateProduct, checkDuplicateName, getProductLogs, adjustStock, stockIn, getProductHistory,
      customers, addCustomer, recordPayment,
      vendors, addVendor,
      dealers, addDealer,
      invoices, addInvoice, updateInvoice,
      bills, addBill,
      purchaseOrders, addPurchaseOrder, recordPOPayment,
      expenses, addExpense,
      dailyClosings, addDailyClosing,
      transactions,
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
