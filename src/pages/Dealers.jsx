import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { Plus, Search, Mail, Store, MoreHorizontal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../context/InventoryContext';

export const DealersPage = () => {
  const { dealers, addDealer } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    name: '', category: '', email: ''
  });
  const [errors, setErrors] = useState({});

  const filteredDealers = dealers.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredDealers.length / itemsPerPage);
  const paginatedDealers = filteredDealers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Dealer Name is required';
    if (!formData.category) newErrors.category = 'Product Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newDealer = {
      id: faker.string.uuid(),
      name: formData.name,
      category: formData.category,
      phone: '-', // Defaulting to '-' as phone is removed
      email: formData.email || '-',
      balance: 0,
      status: 'Active'
    };

    addDealer(newDealer);
    setIsAddModalOpen(false);
    setFormData({ name: '', category: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dealers</h1>
          <p className="text-text-secondary mt-1">Manage product dealers and categories</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search dealers..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Dealer</Button>
        </div>
      </div>

      <Card className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Dealer Name</th>
                <th className="px-6 py-3">Product Category</th>
                <th className="px-6 py-3">Contact Info</th>
                <th className="px-6 py-3 text-right">Balance Due</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedDealers.map((dealer) => (
                <tr key={dealer.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 font-medium group-hover:bg-blue-100 transition-colors">
                        <Store size={18} />
                      </div>
                      <div className="font-medium text-text-primary">{dealer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {dealer.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-text-secondary text-xs">
                        <Mail size={12} /> {dealer.email !== '-' ? dealer.email : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-text-primary">
                    {formatCurrency(dealer.balance)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={dealer.status === 'Active' ? 'success' : 'default'}>
                      {dealer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-text-secondary hover:bg-gray-100 rounded-md">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedDealers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-text-secondary">
                    No dealers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredDealers.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Dealer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Dealer Name <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleInputChange} 
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.name ? 'border-red-500' : 'border-border'}`} 
              placeholder="e.g. ABC Electronics"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Product Category <span className="text-red-500">*</span></label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleInputChange} 
              className={`w-full px-3 py-2 border rounded-md text-sm ${errors.category ? 'border-red-500' : 'border-border'}`}
            >
              <option value="">Select Category</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email Address (Optional)</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              className="w-full px-3 py-2 border border-border rounded-md text-sm" 
              placeholder="dealer@example.com" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Dealer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
