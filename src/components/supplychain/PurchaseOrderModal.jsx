import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertCircle, Sparkles, Calendar } from 'lucide-react';
import supplyChainApi from '../../api/supplyChain';

export const PO_STATUS_CHOICES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'ORDERED', label: 'Ordered / Dispatched to Vendor' },
  { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
  { value: 'RECEIVED', label: 'Received (Fully Fulfilled)' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const PO_PRIORITY_CHOICES = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical / AOG Rush Order' },
];

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  currentUserId = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    po_number: '',
    supplier: '',
    order_date: '',
    expected_delivery_date: '',
    priority: 'MEDIUM',
    status: 'DRAFT',
    delivery_address: '',
    notes: '',
  });

  const [suppliersList, setSuppliersList] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoadingSuppliers(true);
      supplyChainApi
        .getSuppliers({ status: 'ACTIVE', page_size: 100 })
        .then((res) => {
          if (res.results) setSuppliersList(res.results);
        })
        .catch(() => {})
        .finally(() => setLoadingSuppliers(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        po_number: initialData.po_number || '',
        supplier: initialData.supplier || '',
        order_date: initialData.order_date || '',
        expected_delivery_date: initialData.expected_delivery_date || '',
        priority: initialData.priority || 'MEDIUM',
        status: initialData.status || 'DRAFT',
        delivery_address: initialData.delivery_address || '',
        notes: initialData.notes || '',
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setFormData({
        po_number: '',
        supplier: '',
        order_date: today,
        expected_delivery_date: nextWeek,
        priority: 'MEDIUM',
        status: 'DRAFT',
        delivery_address: 'FlightFix Central MRO Logistics Hub, Bay 4, Airport Main Hangar',
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

  const autoGeneratePONumber = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, po_number: `PO-${year}-${rand}` }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.po_number.trim()) {
      newErrors.po_number = 'Purchase order number is required';
    }
    if (!formData.supplier) {
      newErrors.supplier = 'Vendor/Supplier is required';
    }
    if (!formData.order_date) {
      newErrors.order_date = 'Order date is required';
    }
    if (!formData.expected_delivery_date) {
      newErrors.expected_delivery_date = 'Expected delivery date is required';
    }
    if (formData.order_date && formData.expected_delivery_date && formData.expected_delivery_date < formData.order_date) {
      newErrors.expected_delivery_date = 'Expected delivery cannot precede order date';
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
      po_number: formData.po_number.trim().toUpperCase(),
      supplier: Number(formData.supplier),
      delivery_address: formData.delivery_address.trim(),
      notes: formData.notes.trim(),
      ...(formData.status === 'APPROVED' && currentUserId ? { approved_by: currentUserId } : {}),
    };

    try {
      if (isEdit) {
        await supplyChainApi.updatePurchaseOrder(initialData.id, payload);
      } else {
        await supplyChainApi.createPurchaseOrder(payload);
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
        setServerError(err.message || 'Failed to save purchase order.');
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
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? 'Edit Purchase Order' : 'Create Purchase Order (ERP)'}
              </h2>
              <p className="text-xs text-slate-400">
                Procure spare parts, rotables, and technical consumables from authorized vendors
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
          {/* Row 1: PO Number & Supplier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  PO Number <span className="text-rose-400">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={autoGeneratePONumber}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="po_number"
                value={formData.po_number}
                onChange={handleChange}
                placeholder="e.g. PO-2026-0001"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.po_number ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.po_number && <p className="text-xs text-rose-400 mt-1">{errors.po_number}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Approved Supplier / Vendor <span className="text-rose-400">*</span>
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.supplier ? 'border-rose-500' : 'border-slate-700'
                }`}
              >
                <option value="">Select Vendor...</option>
                {suppliersList.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.supplier_code} — {sup.name}
                  </option>
                ))}
              </select>
              {errors.supplier && <p className="text-xs text-rose-400 mt-1">{errors.supplier}</p>}
            </div>
          </div>

          {/* Row 2: Order Date & Expected Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Order Issue Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="order_date"
                value={formData.order_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.order_date ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.order_date && <p className="text-xs text-rose-400 mt-1">{errors.order_date}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Expected Delivery Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="expected_delivery_date"
                value={formData.expected_delivery_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.expected_delivery_date ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.expected_delivery_date && (
                <p className="text-xs text-rose-400 mt-1">{errors.expected_delivery_date}</p>
              )}
            </div>
          </div>

          {/* Row 3: Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Procurement Priority <span className="text-rose-400">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PO_PRIORITY_CHOICES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Order Status <span className="text-rose-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {PO_STATUS_CHOICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Delivery Destination Address */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Destination Delivery Address / Bay
            </label>
            <input
              type="text"
              name="delivery_address"
              value={formData.delivery_address}
              onChange={handleChange}
              placeholder="e.g. FlightFix Central Hub, Hangar 2 Logistics Bay"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Procurement Instructions / Commercial Notes
            </label>
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Special handling instructions, customs clearance declarations, freight carrier..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Create Purchase Order'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
