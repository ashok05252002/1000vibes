import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, UserCircle, Tag, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { TagInput } from '../components/ui/TagInput';
import { formatCurrency } from '../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../context/InventoryContext';

export const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, updateProduct, checkDuplicateName } = useInventory();
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('Admin User');
  
  // Form State
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    inPrice: '',
    vendorPrice: '',
    minVendorPrice: '',
    customerPrice: '',
    minCustomerPrice: '',
    initialStock: '',
    isActive: true
  });
  
  const [tags, setTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Load Data
  useEffect(() => {
    const product = products.find(p => p.id === id);
    if (product) {
      setFormData({
        category: product.category,
        name: product.name,
        inPrice: product.inPrice,
        vendorPrice: product.vendorPrice,
        minVendorPrice: product.minVendorPrice,
        customerPrice: product.customerPrice,
        minCustomerPrice: product.minCustomerPrice,
        initialStock: product.stock,
        isActive: product.isActive
      });
      // Parse tags string to array
      setTags(product.tags ? product.tags.split(', ').filter(t => t) : []);
      setIsLoading(false);
    } else {
      navigate('/inventory');
    }
  }, [id, products, navigate]);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'name' && errors.duplicate) setErrors(prev => ({ ...prev, duplicate: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.name.trim()) newErrors.name = 'Product Name is required';
    if (!formData.inPrice) newErrors.inPrice = 'Required';
    if (!formData.vendorPrice) newErrors.vendorPrice = 'Required';
    if (!formData.minVendorPrice) newErrors.minVendorPrice = 'Required';
    if (!formData.customerPrice) newErrors.customerPrice = 'Required';
    if (!formData.minCustomerPrice) newErrors.minCustomerPrice = 'Required';

    if (checkDuplicateName(formData.name, id)) {
      newErrors.duplicate = 'Product Name already exists in inventory.';
      newErrors.name = 'Duplicate name';
    }

    if (parseFloat(formData.minVendorPrice) > parseFloat(formData.vendorPrice)) {
      newErrors.minVendorPrice = 'Cannot be > Vendor Price';
    }
    if (parseFloat(formData.minCustomerPrice) > parseFloat(formData.customerPrice)) {
      newErrors.minCustomerPrice = 'Cannot be > Customer Price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmUpdate = () => {
    const updatedFields = {
      name: formData.name,
      category: formData.category,
      tags: tags.join(', '), // Convert array back to string
      stock: parseInt(formData.initialStock),
      inPrice: parseFloat(formData.inPrice),
      vendorPrice: parseFloat(formData.vendorPrice),
      minVendorPrice: parseFloat(formData.minVendorPrice),
      customerPrice: parseFloat(formData.customerPrice),
      minCustomerPrice: parseFloat(formData.minCustomerPrice),
      isActive: formData.isActive,
    };

    updateProduct(id, updatedFields, currentUser);
    setIsConfirmOpen(false);
    navigate(`/inventory/${id}`);
  };

  if (isLoading) return <div>Loading...</div>;

  // Calculations for Confirmation Modal
  const stockQty = parseInt(formData.initialStock) || 0;
  const purchasePrice = parseFloat(formData.inPrice) || 0;
  const totalValue = stockQty * purchasePrice;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-surface z-10 py-4 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate(`/inventory/${id}`)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Edit Product</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {/* Status Toggle */}
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-md border border-border shadow-sm">
            <span className="text-sm font-medium text-text-primary">Status:</span>
            <Toggle 
              checked={formData.isActive} 
              onChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))}
              label={formData.isActive ? "Active" : "Inactive"}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(`/inventory/${id}`)}>Cancel</Button>
            <Button icon={Save} onClick={handleVerify}>Update</Button>
          </div>
        </div>
      </div>

      {/* User Simulation Control */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 p-3 rounded-md flex items-center gap-3">
        <UserCircle className="text-yellow-700" size={20} />
        <span className="text-sm text-yellow-800 font-medium">Simulate Edit As:</span>
        <select 
          className="bg-white border border-yellow-300 text-sm rounded px-2 py-1 focus:outline-none"
          value={currentUser}
          onChange={(e) => setCurrentUser(e.target.value)}
        >
          <option value="Admin User">Admin User</option>
          <option value="Rajesh (Manager)">Rajesh (Manager)</option>
          <option value="Priya (Staff)">Priya (Staff)</option>
        </select>
      </div>

      {errors.duplicate && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span className="font-medium">{errors.duplicate}</span>
        </div>
      )}

      <form className="bg-white rounded-lg border border-border p-8 shadow-sm">
        
        {/* Basic Information */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.name ? 'border-red-500' : 'border-border'}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.category ? 'border-red-500' : 'border-border'}`}
              >
                {PRODUCT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="initialStock"
                value={formData.initialStock}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2.5 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />
              <p className="text-xs text-text-secondary mt-1">Directly updating stock here will be logged.</p>
            </div>

             {/* Search Tags Field */}
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1">
                Search Tags
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 text-text-secondary" size={16} />
                <div className="pl-10">
                  <TagInput 
                    value={tags}
                    onChange={setTags}
                    placeholder="Type tag and press Enter..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border mb-10" />

        {/* Pricing Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Pricing Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                In Price (Purchase) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                <input
                  type="number"
                  name="inPrice"
                  value={formData.inPrice}
                  onChange={handleInputChange}
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.inPrice ? 'border-red-500' : 'border-border'}`}
                />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-sm font-semibold text-text-primary">Vendor Pricing (B2B)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Standard Price</label>
                <input
                  type="number"
                  name="vendorPrice"
                  value={formData.vendorPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Minimum Price</label>
                <input
                  type="number"
                  name="minVendorPrice"
                  value={formData.minVendorPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm"
                />
              </div>
            </div>

            <div className="md:col-start-2 md:col-span-2 grid grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-sm font-semibold text-text-primary">Customer Pricing (B2C)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Standard Price</label>
                <input
                  type="number"
                  name="customerPrice"
                  value={formData.customerPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Minimum Price</label>
                <input
                  type="number"
                  name="minCustomerPrice"
                  value={formData.minCustomerPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Product Update"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-100">
            <CheckCircle size={20} />
            <p className="text-sm">Please verify the updated stock and pricing details.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-border space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">Purchase Price (In)</span>
              <span className="font-semibold text-text-primary">{formatCurrency(purchasePrice)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">Current Quantity</span>
              <span className="font-semibold text-text-primary">{stockQty} units</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-text-primary font-medium">Total Investment Value</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmOpen(false)}>
              Keep Editing
            </Button>
            <Button className="flex-1" onClick={handleConfirmUpdate}>
              Confirm Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
