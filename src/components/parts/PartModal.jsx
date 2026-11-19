import React, { useState, useEffect } from 'react';
import { X, Package, AlertCircle, Sparkles } from 'lucide-react';
import partsApi from '../../api/parts';

export const PART_CATEGORY_CHOICES = [
  { value: 'AVIONICS', label: 'Avionics' },
  { value: 'ENGINE', label: 'Engine & Propulsion' },
  { value: 'HYDRAULICS', label: 'Hydraulics & Pneumatics' },
  { value: 'LANDING_GEAR', label: 'Landing Gear & Brakes' },
  { value: 'STRUCTURAL', label: 'Structural & Airframe' },
  { value: 'ELECTRICAL', label: 'Electrical & Power' },
  { value: 'CABIN', label: 'Cabin & Interiors' },
  { value: 'HARDWARE', label: 'Hardware & Fasteners' },
  { value: 'CONSUMABLE', label: 'Consumables & Fluids' },
  { value: 'OTHER', label: 'Other' },
];

export const PART_STATUS_CHOICES = [
  { value: 'IN_STOCK', label: 'In Stock' },
  { value: 'LOW_STOCK', label: 'Low Stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
];

export default function PartModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    category: 'OTHER',
    manufacturer: '',
    manufacturer_part_number: '',
    quantity_in_stock: 0,
    minimum_stock_level: 5,
    unit_price: '0.00',
    location: '',
    supplier: '',
    description: '',
    status: 'IN_STOCK',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        part_number: initialData.part_number || '',
        name: initialData.name || '',
        category: initialData.category || 'OTHER',
        manufacturer: initialData.manufacturer || '',
        manufacturer_part_number: initialData.manufacturer_part_number || '',
        quantity_in_stock: initialData.quantity_in_stock ?? 0,
        minimum_stock_level: initialData.minimum_stock_level ?? 5,
        unit_price: initialData.unit_price || '0.00',
        location: initialData.location || '',
        supplier: initialData.supplier || '',
        description: initialData.description || '',
        status: initialData.status || 'IN_STOCK',
      });
    } else {
      setFormData({
        part_number: '',
        name: '',
        category: 'OTHER',
        manufacturer: '',
        manufacturer_part_number: '',
        quantity_in_stock: 0,
        minimum_stock_level: 5,
        unit_price: '0.00',
        location: '',
        supplier: '',
        description: '',
        status: 'OUT_OF_STOCK',
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = value;
    if (type === 'number') {
      val = value === '' ? '' : Number(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generatePartNumber = () => {
    const prefix = formData.category ? formData.category.slice(0, 3) : 'PRT';
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const generated = `PN-${prefix}-${randomHex}`;
    setFormData((prev) => ({ ...prev, part_number: generated }));
    if (errors.part_number) {
      setErrors((prev) => ({ ...prev, part_number: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.part_number.trim()) {
      newErrors.part_number = 'Part number is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Part name is required';
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer (OEM) is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Storage location is required';
    }
    if (formData.quantity_in_stock < 0) {
      newErrors.quantity_in_stock = 'Stock quantity cannot be negative';
    }
    if (formData.minimum_stock_level < 0) {
      newErrors.minimum_stock_level = 'Minimum stock level cannot be negative';
    }
    if (parseFloat(formData.unit_price) < 0 || isNaN(parseFloat(formData.unit_price))) {
      newErrors.unit_price = 'Unit price must be a valid non-negative number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    const payload = {
      ...formData,
      part_number: formData.part_number.trim().toUpperCase(),
      name: formData.name.trim(),
      manufacturer: formData.manufacturer.trim(),
      location: formData.location.trim(),
      quantity_in_stock: Number(formData.quantity_in_stock) || 0,
      minimum_stock_level: Number(formData.minimum_stock_level) || 0,
      unit_price: parseFloat(formData.unit_price).toFixed(2),
    };

    try {
      if (isEdit) {
        await partsApi.updatePart(initialData.id, payload);
      } else {
        await partsApi.createPart(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        let generalMsg = '';
        Object.entries(data).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key in formData) {
            fieldErrors[key] = message;
          } else {
            generalMsg += `${key}: ${message} `;
          }
        });
        setErrors(fieldErrors);
        setServerError(generalMsg || 'Please review the highlighted fields.');
      } else {
        setServerError(err.message || 'Failed to save spare part record.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? 'Edit Spare Part' : 'Add New Spare Part'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit ? `Updating ${initialData.part_number}` : 'Register a new aircraft component or consumable'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server error banner */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Part Number & Auto-generate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Part Number <span className="text-rose-400">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generatePartNumber}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="part_number"
                value={formData.part_number}
                onChange={handleChange}
                placeholder="e.g. PN-737-HYD-01"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
                  errors.part_number ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.part_number && <p className="text-xs text-rose-400 mt-1">{errors.part_number}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PART_CATEGORY_CHOICES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Name */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Part Name / Description Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Main Landing Gear Actuator Hydraulic Seal Kit"
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-rose-500' : 'border-slate-700'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Row 3: Manufacturer & OEM Part Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Manufacturer (OEM) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Boeing / Honeywell / Parker Aerospace"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.manufacturer ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.manufacturer && <p className="text-xs text-rose-400 mt-1">{errors.manufacturer}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Manufacturer Part Number (MPN)
              </label>
              <input
                type="text"
                name="manufacturer_part_number"
                value={formData.manufacturer_part_number}
                onChange={handleChange}
                placeholder="e.g. OEM-65-7281-1"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 4: Quantity & Minimum Level */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quantity in Stock <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="quantity_in_stock"
                min="0"
                value={formData.quantity_in_stock}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity_in_stock ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.quantity_in_stock && <p className="text-xs text-rose-400 mt-1">{errors.quantity_in_stock}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Min Reorder Level <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="minimum_stock_level"
                min="0"
                value={formData.minimum_stock_level}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minimum_stock_level ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.minimum_stock_level && <p className="text-xs text-rose-400 mt-1">{errors.minimum_stock_level}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Unit Price ($ USD) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.unit_price ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.unit_price && <p className="text-xs text-rose-400 mt-1">{errors.unit_price}</p>}
            </div>
          </div>

          {/* Row 5: Storage Location & Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Storage Location <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Hangar 1 / Bin B-12"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.location ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.location && <p className="text-xs text-rose-400 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary Supplier / Vendor
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                placeholder="e.g. AeroSupply International"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Technical Description / Application Notes
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter technical details, aircraft compatibility, operating parameters..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Spare Part'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
