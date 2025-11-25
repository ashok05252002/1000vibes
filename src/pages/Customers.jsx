import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import { Plus, Search, Phone, Mail, MapPin, MoreHorizontal, FileText, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { SlideOver } from '../components/ui/SlideOver';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const CustomersPage = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, invoices } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    email: '',
    company: ''
  });
  const [errors, setErrors] = useState({});

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get history for selected customer
  const customerHistory = selectedCustomer 
    ? invoices.filter(inv => inv.customerId === selectedCustomer.id).sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.area.trim()) newErrors.area = 'Area/City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newCustomer = {
      id: faker.string.uuid(),
      name: formData.name,
      company: formData.company || '-',
      email: formData.email || '-',
      phone: formData.phone,
      city: formData.area,
      balance: 0,
      status: 'Active',
      history: []
    };

    addCustomer(newCustomer);
    setIsAddModalOpen(false);
    setFormData({ name: '', phone: '', area: '', email: '', company: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Customers</h1>
          <p className="text-text-secondary mt-1">Manage client relationships and receivables</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Customer</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Customer Name</th>
                <th className="px-6 py-3">Contact Info</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-right">Receivables</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-primary font-medium group-hover:bg-primary group-hover:text-white transition-colors">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{customer.name}</div>
                        <div className="text-xs text-text-secondary">{customer.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-text-secondary text-xs">
                        <Phone size={12} /> {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary text-xs">
                        <Mail size={12} /> {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} /> {customer.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-text-primary">
                    {formatCurrency(customer.balance)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={customer.status === 'Active' ? 'success' : 'default'}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-text-secondary hover:bg-gray-100 rounded-md">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.name ? 'border-red-500' : 'border-border'}`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.phone ? 'border-red-500' : 'border-border'}`}
                placeholder="+91 98765 43210"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Area / City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.area ? 'border-red-500' : 'border-border'}`}
                placeholder="e.g. Anna Nagar"
              />
              {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Company (Optional)</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Company Name"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Customer</Button>
          </div>
        </form>
      </Modal>

      <SlideOver
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title="Customer Details"
      >
        {selectedCustomer && (
          <div className="space-y-8">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">{selectedCustomer.name}</h3>
                  <p className="text-text-secondary">{selectedCustomer.company}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                    <span className="flex items-center gap-1"><Phone size={14} /> {selectedCustomer.phone}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {selectedCustomer.city}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-text-secondary">Outstanding Balance</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(selectedCustomer.balance)}</p>
              </div>
            </div>

            {/* Purchase History Table */}
            <div>
              <h4 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <FileText size={20} className="text-text-secondary" />
                Purchase History
              </h4>
              
              {customerHistory.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-xs text-text-secondary uppercase border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-center">Status</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {customerHistory.map((inv) => (
                        <tr 
                          key={inv.id} 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/billing/customer/${inv.id}`)}
                        >
                          <td className="px-4 py-3 text-text-primary">{inv.date}</td>
                          <td className="px-4 py-3 font-mono text-primary font-medium">{inv.invoiceNo}</td>
                          <td className="px-4 py-3 text-right font-medium">{formatCurrency(inv.amount)}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                          </td>
                          <td className="px-4 py-3 text-right text-text-secondary">
                            <ArrowRight size={16} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-border">
                  <p className="text-text-secondary">No purchase history found.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
};
