import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, Edit2, Eye, Filter } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { formatCurrency } from '../lib/utils';
import { useInventory } from '../context/InventoryContext';

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { products } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? p.isActive :
      !p.isActive;

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Inventory Management</h1>
          <p className="text-text-secondary mt-1">Track stock levels and manage pricing</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              type="text" 
              placeholder="Search products or tags..." 
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full sm:w-64"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center bg-white border border-border rounded-md px-2">
            <Filter size={16} className="text-text-secondary mr-2" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-sm border-none focus:ring-0 py-2 text-text-primary bg-transparent cursor-pointer outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Button icon={Plus} onClick={() => navigate('/inventory/add')}>Add Product</Button>
        </div>
      </div>

      {/* Inventory Table */}
      <Card className="overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-secondary bg-gray-50 uppercase border-b border-border">
              <tr>
                <th className="px-6 py-3">Product Details</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-right">In Price</th>
                <th className="px-6 py-3 text-right">Cust. Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedProducts.map((product) => (
                <tr 
                  key={product.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/inventory/${product.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Package size={18} />
                      </div>
                      <div>
                        <div className="font-medium text-text-primary">{product.name}</div>
                        <div className="text-xs text-text-secondary">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-text-primary'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-text-secondary">
                    {formatCurrency(product.inPrice)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-text-primary">
                    {formatCurrency(product.customerPrice)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={product.isActive ? 'success' : 'default'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" 
                        title="View Details"
                        onClick={() => navigate(`/inventory/${product.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="p-1.5 text-text-secondary hover:text-primary hover:bg-blue-50 rounded-md" 
                        title="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/inventory/edit/${product.id}`);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
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
          totalItems={filteredProducts.length}
          itemsPerPage={itemsPerPage}
        />
      </Card>
    </div>
  );
};
