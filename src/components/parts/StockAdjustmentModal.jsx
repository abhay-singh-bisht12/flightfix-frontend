import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle, PlusCircle, MinusCircle, Sliders, RotateCcw } from 'lucide-react';
import partsApi from '../../api/parts';

export const TRANSACTION_TYPES = [
  {
    value: 'RECEIPT',
    label: 'Stock Receipt (Add)',
    desc: 'Receive incoming parts from supplier/PO',
    icon: PlusCircle,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    value: 'ISSUE',
    label: 'Stock Issue (Disburse)',
    desc: 'Issue part for a maintenance work order',
    icon: MinusCircle,
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },
  {
    value: 'ADJUSTMENT',
    label: 'Stock Adjustment (Audit)',
    desc: 'Override quantity to match physical count',
    icon: Sliders,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    value: 'RETURN',
    label: 'Stock Return (Restock)',
    desc: 'Return unused/serviceable part to stock',
    icon: RotateCcw,
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  },
];

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  part,
  onSuccess,
}) {
  if (!isOpen || !part) return null;

  const [transactionType, setTransactionType] = useState('RECEIPT');
  const [quantity, setQuantity] = useState(1);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const calculatePreviewStock = () => {
    const qty = Number(quantity) || 0;
    const current = part.quantity_in_stock || 0;
    if (transactionType === 'RECEIPT' || transactionType === 'RETURN') {
      return current + qty;
    }
    if (transactionType === 'ISSUE') {
      return Math.max(0, current - qty);
    }
    if (transactionType === 'ADJUSTMENT') {
      return qty;
    }
    return current;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (!reference.trim()) {
      setError('Reference identifier (PO, Work Order, or Audit Ref) is required.');
      return;
    }

    if (transactionType === 'ISSUE' && qty > part.quantity_in_stock) {
      setError(`Cannot issue ${qty} units. Only ${part.quantity_in_stock} currently in stock.`);
      return;
    }

    setSubmitting(true);
    try {
      await partsApi.createTransaction({
        spare_part: part.id,
        transaction_type: transactionType,
        quantity: qty,
        reference: reference.trim(),
        notes: notes.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        setError(msg);
      } else {
        setError(err.message || 'Failed to record stock transaction.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Record Stock Transaction</h2>
              <p className="text-xs text-slate-400 font-mono">
                {part.part_number} — {part.name}
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

        {/* Current Stock Banner */}
        <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Current On-Hand Stock:</span>
          <span className="font-semibold text-white text-sm bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
            {part.quantity_in_stock} units
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRANSACTION_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = transactionType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTransactionType(t.value)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold">{t.label.split(' ')[0]}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity & Result Preview */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                New Stock Balance Preview
              </label>
              <div className="px-3 py-2 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-emerald-400 flex items-center justify-between">
                <span>{calculatePreviewStock()} units</span>
                <span className="text-xs text-slate-500 font-normal">
                  ({transactionType === 'ISSUE' ? '-' : transactionType === 'ADJUSTMENT' ? '=' : '+'}{quantity || 0})
                </span>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Audit Reference <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. PO-89012, WO-2026-0042, Annual-Audit"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Transaction Notes
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for movement, technician ID, or condition of parts..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Recording...</span>
                </>
              ) : (
                <span>Confirm Transaction</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
