import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Clock, 
  FileBarChart, 
  Database, 
  Users,
  Settings,
  LogOut,
  X,
  Contact,
  Truck,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  FileText,
  History
} from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Receipt, label: 'Billing', path: '/billing' }, // Direct link to POS
  { 
    icon: History, 
    label: 'Bills & History', 
    path: '/history',
    children: [
      { label: 'Sales Invoices', path: '/history/sales', icon: FileText },
      { label: 'Vendor Bills', path: '/history/purchases', icon: ShoppingCart }
    ]
  },
  { icon: Contact, label: 'Customers', path: '/customers' },
  { icon: Truck, label: 'Vendors', path: '/vendors' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: CreditCard, label: 'Credits', path: '/credits' },
  { icon: PieChart, label: 'Expenses', path: '/expenses' },
  { icon: Clock, label: 'Daily Closing', path: '/closing' },
  { icon: FileBarChart, label: 'Reports', path: '/reports' },
  { icon: ClipboardList, label: 'Audit Logs', path: '/audit-logs' },
  { icon: Database, label: 'Masters', path: '/masters' },
  { icon: Users, label: 'System Users', path: '/users' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(['/history']);

  const toggleMenu = (path) => {
    setExpandedMenus(prev => 
      prev.includes(path) 
        ? prev.filter(p => p !== path) 
        : [...prev, path]
    );
  };

  const isMenuOpen = (path) => expandedMenus.includes(path);
  const isChildActive = (children) => children.some(child => location.pathname === child.path);

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold text-lg">
              Z
            </div>
            <span className="font-bold text-xl text-text-primary">ZohoInv</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-secondary">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => (
              <div key={item.path}>
                {item.children ? (
                  // Parent Item with Dropdown
                  <div>
                    <button
                      onClick={() => toggleMenu(item.path)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                        isChildActive(item.children)
                          ? "bg-primary-light/50 text-primary"
                          : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={18} />
                        {item.label}
                      </div>
                      {isMenuOpen(item.path) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                    
                    {/* Dropdown Content */}
                    {isMenuOpen(item.path) && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => window.innerWidth < 1024 && onClose()}
                            className={({ isActive }) => cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                              isActive 
                                ? "text-primary font-medium bg-primary-light" 
                                : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
                            )}
                          >
                            {/* {child.icon && <child.icon size={16} />} */}
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Standard Item
                  <NavLink
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary-light text-primary" 
                        : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          <div className="px-3 mt-auto border-t border-border pt-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-text-secondary hover:bg-gray-50 hover:text-text-primary">
              <Settings size={18} />
              Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-accent hover:bg-accent-light/20">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
