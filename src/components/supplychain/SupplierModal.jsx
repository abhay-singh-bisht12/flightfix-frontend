import React, { useState, useEffect } from 'react';
import { X, Building2, AlertCircle, Sparkles } from 'lucide-react';
import supplyChainApi from '../../api/supplyChain';

export const SUPPLIER_TYPE_CHOICES = [
  { value: 'OEM', label: 'Original Equipment Manufacturer (OEM)' },
  { value: 'AUTHORIZED_DISTRIBUTOR', label: 'Authorized Distributor' },
  { value: 'THIRD_PARTY', label: 'Third-Party Supplier' },
  { value: 'LOGISTICS_PROVIDER', label: 'Logistics Provider' },
  { value: 'OTHER', label: 'Other Supplier' },
];

export const SUPPLIER_STATUS_CHOICES = [
  { value: 'ACTIVE', label: 'Active Vendor' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'SUSPENDED', label: 'Suspended (Quality Hold)' },
];

export default function SupplierModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    supplier_code: '',
    name: '',
    supplier_type: 'AUTHORIZED_DISTRIBUTOR',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    status: 'ACTIVE',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        supplier_code: initialData.supplier_code || '',
        name: initialData.name || '',
        supplier_type: initialData.supplier_type || 'AUTHORIZED_DISTRIBUTOR',
        contact_person: initialData.contact_person || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
        city: initialData.city || '',
        country: initialData.country || '',
        status: initialData.status || 'ACTIVE',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        supplier_code: '',
        name: '',
        supplier_type: 'AUTHORIZED_DISTRIBUTOR',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        country: '',
        status: 'ACTIVE',
        notes: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const autoGenerateCode = () => {
    const prefix = formData.supplier_type === 'OEM' ? 'OEM' : 'VEND';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, supplier_code: `${prefix}-${rand}` }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.supplier_code.trim()) {
      newErrors.supplier_code = 'Supplier code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Supplier legal name is required';
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
      supplier_code: formData.supplier_code.trim().toUpperCase(),
      name: formData.name.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      notes: formData.notes.trim(),
    };

    try {
      if (isEdit) {
        await supplyChainApi.updateSupplier(initialData.id, payload);
      } else {
        await supplyChainApi.createSupplier(payload);
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
        setServerError(generalMsg || 'Please review highlighted fields.');
      } else {
        setServerError(err.message || 'Failed to save supplier record.');
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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? 'Edit Supplier / Vendor' : 'Register New Vendor / Supplier'}
              </h2>
              <p className="text-xs text-slate-400">
                Manage commercial suppliers, OEMs, distributors, and logistics partners
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

        {/* Server error */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Code & Auto Generate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Supplier Code <span className="text-rose-400">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={autoGenerateCode}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="supplier_code"
                value={formData.supplier_code}
                onChange={handleChange}
                placeholder="e.g. VEND-BOEING-01"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.supplier_code ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.supplier_code && <p className="text-xs text-rose-400 mt-1">{errors.supplier_code}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Supplier Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="supplier_type"
                value={formData.supplier_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {SUPPLIER_TYPE_CHOICES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Name & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Company / Legal Entity Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Parker Aerospace Hydraulic Systems"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.name ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Vendor Status <span className="text-rose-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {SUPPLIER_STATUS_CHOICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Contact Person, Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleChange}
                placeholder="e.g. David Vance"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. orders@supplier.com"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-019-2834"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 4: Address, City, Country */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Seattle"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g. United States"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Facility / Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 1000 Airport Way S"
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Commercial / Contractual Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Payment terms (Net 30/60), RMA instructions, approved parts catalog scope..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-amber-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Register Supplier'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
