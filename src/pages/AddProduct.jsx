import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Tag, CheckCircle, Upload, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { faker } from '@faker-js/faker';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { Modal } from '../components/ui/Modal';
import { TagInput } from '../components/ui/TagInput';
import { formatCurrency } from '../lib/utils';
import { useInventory, PRODUCT_CATEGORIES } from '../context/InventoryContext';

export const AddProductPage = () => {
  const navigate = useNavigate();
  const { addProduct, checkDuplicateName } = useInventory();
  
  // Form State
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase(),
    inPrice: '',
    vendorPrice: '',
    minVendorPrice: '',
    customerPrice: '',
    minCustomerPrice: '',
    initialStock: '',
    isActive: true
  });
  
  const [tags, setTags] = useState([]); 
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (name === 'name' && errors.duplicate) {
      setErrors(prev => ({ ...prev, duplicate: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const generateSku = () => {
    setFormData(prev => ({
      ...prev,
      sku: 'SKU-' + faker.string.alphanumeric(6).toUpperCase()
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.name.trim()) newErrors.name = 'Product Name is required';
    if (!formData.sku.trim()) newErrors.sku = 'Product ID / SKU is required';
    if (!formData.inPrice) newErrors.inPrice = 'Required';
    if (!formData.vendorPrice) newErrors.vendorPrice = 'Required';
    if (!formData.minVendorPrice) newErrors.minVendorPrice = 'Required';
    if (!formData.customerPrice) newErrors.customerPrice = 'Required';
    if (!formData.minCustomerPrice) newErrors.minCustomerPrice = 'Required';
    if (!formData.initialStock) newErrors.initialStock = 'Required';

    if (checkDuplicateName(formData.name)) {
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

  const handleConfirmSave = () => {
    const newProduct = {
      id: faker.string.uuid(),
      name: formData.name,
      category: formData.category,
      sku: formData.sku,
      image: imagePreview, // Storing the object URL (note: this is temporary for session)
      tags: tags.join(', '),
      stock: parseInt(formData.initialStock),
      inPrice: parseFloat(formData.inPrice),
      vendorPrice: parseFloat(formData.vendorPrice),
      minVendorPrice: parseFloat(formData.minVendorPrice),
      customerPrice: parseFloat(formData.customerPrice),
      minCustomerPrice: parseFloat(formData.minCustomerPrice),
      isActive: formData.isActive,
      lastUpdated: new Date().toLocaleDateString('en-IN')
    };

    addProduct(newProduct);
    setIsConfirmOpen(false);
    navigate('/inventory');
  };

  // Calculations for Confirmation Modal
  const stockQty = parseInt(formData.initialStock) || 0;
  const purchasePrice = parseFloat(formData.inPrice) || 0;
  const totalValue = stockQty * purchasePrice;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* Header with Status Toggle */}
      <div className="flex items-center justify-between sticky top-0 bg-surface z-10 py-4 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => navigate('/inventory')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">New Product</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-md border border-border shadow-sm">
            <span className="text-sm font-medium text-text-primary">Status:</span>
            <Toggle 
              checked={formData.isActive} 
              onChange={(val) => setFormData(prev => ({ ...prev, isActive: val }))}
              label={formData.isActive ? "Active" : "Inactive"}
            />
          </div>
          
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/inventory')}>Cancel</Button>
            <Button icon={Save} onClick={handleVerify}>Save</Button>
          </div>
        </div>
      </div>

      {errors.duplicate && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <span className="font-medium">{errors.duplicate}</span>
        </div>
      )}

      <form className="bg-white rounded-lg border border-border p-8 shadow-sm">
        
        {/* Section: Basic Info */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Image Upload Column */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-text-primary mb-2">Product Image</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center min-h-[180px] bg-gray-50 hover:bg-gray-100 transition-colors relative overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-10 w-10 text-text-muted mb-2" />
                    <p className="text-xs text-text-secondary">Click to upload</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              {imagePreview && (
                <button 
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="text-xs text-red-500 mt-2 hover:underline w-full text-center"
                >
                  Remove Image
                </button>
              )}
            </div>

            {/* Fields Column */}
            <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                  placeholder="e.g. Wireless Bluetooth Headphones"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Product ID / SKU <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.sku ? 'border-red-500' : 'border-border'}`}
                  />
                  <button 
                    type="button"
                    onClick={generateSku}
                    className="p-2 border border-border rounded-md hover:bg-gray-50 text-text-secondary"
                    title="Generate Random SKU"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
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
                  <option value="">Select Category</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Initial Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="initialStock"
                  value={formData.initialStock}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.initialStock ? 'border-red-500' : 'border-border'}`}
                  placeholder="0"
                />
                {errors.initialStock && <p className="text-xs text-red-500 mt-1">{errors.initialStock}</p>}
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
                <p className="text-xs text-text-secondary mt-1">Press Enter to add a tag.</p>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-border mb-10" />

        {/* Section: Pricing */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Pricing Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
            
            {/* Purchase Price */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Purchase Price (In) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₹</span>
                <input
                  type="number"
                  name="inPrice"
                  value={formData.inPrice}
                  onChange={handleInputChange}
                  className={`w-full pl-7 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.inPrice ? 'border-red-500' : 'border-border'}`}
                  placeholder="0.00"
                />
              </div>
              {errors.inPrice && <p className="text-xs text-red-500 mt-1">{errors.inPrice}</p>}
            </div>

            {/* Vendor Pricing */}
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-sm font-semibold text-text-primary">Vendor Pricing (B2B)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Standard Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                  <input
                    type="number"
                    name="vendorPrice"
                    value={formData.vendorPrice}
                    onChange={handleInputChange}
                    className={`w-full pl-6 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.vendorPrice ? 'border-red-500' : 'border-border'}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.vendorPrice && <p className="text-xs text-red-500 mt-1">{errors.vendorPrice}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Min Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                  <input
                    type="number"
                    name="minVendorPrice"
                    value={formData.minVendorPrice}
                    onChange={handleInputChange}
                    className={`w-full pl-6 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.minVendorPrice ? 'border-red-500' : 'border-border'}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.minVendorPrice && <p className="text-xs text-red-500 mt-1">{errors.minVendorPrice}</p>}
              </div>
            </div>

            {/* Customer Pricing */}
            <div className="md:col-start-2 md:col-span-2 grid grid-cols-2 gap-6">
              <div className="col-span-2 flex items-center gap-2 pb-2 border-b border-border/50">
                <span className="text-sm font-semibold text-text-primary">Customer Pricing (B2C)</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Standard Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                  <input
                    type="number"
                    name="customerPrice"
                    value={formData.customerPrice}
                    onChange={handleInputChange}
                    className={`w-full pl-6 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.customerPrice ? 'border-red-500' : 'border-border'}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.customerPrice && <p className="text-xs text-red-500 mt-1">{errors.customerPrice}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Min Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-xs">₹</span>
                  <input
                    type="number"
                    name="minCustomerPrice"
                    value={formData.minCustomerPrice}
                    onChange={handleInputChange}
                    className={`w-full pl-6 pr-3 py-2.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow ${errors.minCustomerPrice ? 'border-red-500' : 'border-border'}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.minCustomerPrice && <p className="text-xs text-red-500 mt-1">{errors.minCustomerPrice}</p>}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirm Product Addition"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 text-green-800 rounded-md border border-green-100">
            <CheckCircle size={20} />
            <p className="text-sm">Please verify the stock and pricing details before saving.</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-border space-y-3">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">SKU</span>
              <span className="font-mono text-text-primary">{formData.sku}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">Purchase Price (In)</span>
              <span className="font-semibold text-text-primary">{formatCurrency(purchasePrice)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-text-secondary text-sm">Initial Quantity</span>
              <span className="font-semibold text-text-primary">{stockQty} units</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-text-primary font-medium">Total Investment Value</span>
              <span className="font-bold text-primary text-lg">{formatCurrency(totalValue)}</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmOpen(false)}>
              Edit Details
            </Button>
            <Button className="flex-1" onClick={handleConfirmSave}>
              Confirm & Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
