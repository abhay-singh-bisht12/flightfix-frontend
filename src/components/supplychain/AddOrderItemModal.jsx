import React, { useState, useEffect } from 'react';
import { X, PackagePlus, AlertCircle } from 'lucide-react';
import supplyChainApi from '../../api/supplyChain';
import partsApi from '../../api/parts';

export default function AddOrderItemModal({
  isOpen,
  onClose,
  purchaseOrder,
  onSuccess,
}) {
  const [sparePart, setSparePart] = useState('');
  const [quantityOrdered, setQuantityOrdered] = useState(1);
  const [unitPrice, setUnitPrice] = useState('0.00');
  const [notes, setNotes] = useState('');

  const [partsList, setPartsList] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoadingParts(true);
      partsApi
        .getParts({ page_size: 100 })
        .then((res) => {
          if (res.results) setPartsList(res.results);
        })
        .catch(() => {})
        .finally(() => setLoadingParts(false));

      setSparePart('');
      setQuantityOrdered(1);
      setUnitPrice('0.00');
      setNotes('');
      setErrors({});
      setServerError('');
    }
  }, [isOpen]);

  if (!isOpen || !purchaseOrder) return null;

  const handlePartSelect = (e) => {
    const selectedId = e.target.value;
    setSparePart(selectedId);
    const selectedObj = partsList.find((p) => String(p.id) === String(selectedId));
    if (selectedObj && selectedObj.unit_price) {
      setUnitPrice(parseFloat(selectedObj.unit_price).toFixed(2));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!sparePart) {
      newErrors.spare_part = 'Spare part is required';
    }
    const qty = Number(quantityOrdered);
    if (!qty || qty <= 0) {
      newErrors.quantity_ordered = 'Quantity ordered must be greater than zero';
    }
    if (parseFloat(unitPrice) < 0 || isNaN(parseFloat(unitPrice))) {
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
      purchase_order: purchaseOrder.id,
      spare_part: Number(sparePart),
      quantity_ordered: Number(quantityOrdered),
      unit_price: parseFloat(unitPrice).toFixed(2),
      notes: notes.trim(),
    };

    try {
      await supplyChainApi.createOrderItem(payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        setServerError(msg);
      } else {
        setServerError(err.message || 'Failed to add item to purchase order.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Add PO Line Item</h2>
              <p className="text-xs text-slate-400 font-mono">
                {purchaseOrder.po_number}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Inventory Spare Part <span className="text-rose-400">*</span>
            </label>
            <select
              value={sparePart}
              onChange={handlePartSelect}
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.spare_part ? 'border-rose-500' : 'border-slate-700'
              }`}
            >
              <option value="">Select Spare Part...</option>
              {partsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.part_number} — {p.name}
                </option>
              ))}
            </select>
            {errors.spare_part && <p className="text-xs text-rose-400 mt-1">{errors.spare_part}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quantity Ordered <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantityOrdered}
                onChange={(e) => setQuantityOrdered(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity_ordered ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.quantity_ordered && <p className="text-xs text-rose-400 mt-1">{errors.quantity_ordered}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Agreed Unit Price ($ USD) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.unit_price ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.unit_price && <p className="text-xs text-rose-400 mt-1">{errors.unit_price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Estimated Line Total
            </label>
            <div className="px-3 py-2 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-emerald-400">
              ${((Number(quantityOrdered) || 0) * (parseFloat(unitPrice) || 0)).toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Line Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Expedited freight required, OEM certification tag requested..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Item to Order</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
