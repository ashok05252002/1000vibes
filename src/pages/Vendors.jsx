import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faker } from '@faker-js/faker';
import { Plus, Search, Phone, Building2, MoreHorizontal } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const VendorsPage = () => {
  const navigate = useNavigate();
  const { vendors, addVendor } = useInventory();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    shopName: '', address: '', contactPerson: '', phone: '', email: '', gstin: ''
  });
  const [errors, setErrors] = useState({});

  const filteredVendors = vendors.filter(v => 
    v.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
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
    if (!formData.shopName.trim()) newErrors.shopName = 'Shop Name is required';
    if (!formData.address.trim()) newErrors.address = 'Shop Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newVendor = {
      id: faker.string.uuid(),
      company: formData.shopName,
      address: formData.address,
      contactPerson: formData.contactPerson || '-',
      phone: formData.phone,
      email: formData.email || '-',
      gstin: formData.gstin || '-',
      balance: 0,
      status: 'Active',
      history: []
    };

    addVendor(newVendor);
    setIsAddModalOpen(false);
    setFormData({ shopName: '', address: '', contactPerson: '', phone: '', email: '', gstin: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Vendors</h1>
          <p className="text-text-secondary mt-1">Manage suppliers and payables</p>
        </div>
        <div className="flex gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search vendors..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64"
            />
          </div>
          <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Vendor</Button>
        </div>
      </div>

      <Card className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Vendor Details</th>
                <th className="px-6 py-3">Contact Person</th>
                <th className="px-6 py-3">GSTIN</th>
                <th className="px-6 py-3 text-right">Payables</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedVendors.map((vendor) => (
                <tr 
                  key={vendor.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/vendors/${vendor.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-orange-50 flex items-center justify-center text-orange-600 font-medium group-hover:bg-orange-100 transition-colors">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{vendor.company}</div>
                        <div className="text-xs text-text-secondary flex items-center gap-1">
                          <Phone size={10} /> {vendor.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-primary">{vendor.contactPerson}</td>
                  <td className="px-6 py-4 text-text-secondary font-mono text-xs">{vendor.gstin}</td>
                  <td className="px-6 py-4 text-right font-medium text-text-primary">{formatCurrency(vendor.balance)}</td>
                  <td className="px-6 py-4">
                    <Badge variant={vendor.status === 'Active' ? 'success' : 'warning'}>{vendor.status}</Badge>
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
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredVendors.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Vendor"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Shop Name <span className="text-red-500">*</span></label>
            <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md text-sm ${errors.shopName ? 'border-red-500' : 'border-border'}`} />
            {errors.shopName && <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Shop Address <span className="text-red-500">*</span></label>
            <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className={`w-full px-3 py-2 border rounded-md text-sm ${errors.address ? 'border-red-500' : 'border-border'}`} />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Contact Person</label>
              <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} className="w-full px-3 py-2 border border-border rounded-md text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full px-3 py-2 border rounded-md text-sm ${errors.phone ? 'border-red-500' : 'border-border'}`} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Vendor</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
