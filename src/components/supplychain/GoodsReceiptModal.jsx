import React, { useState, useEffect } from 'react';
import { X, PackageCheck, AlertCircle, ArrowDownCircle, CheckCircle2 } from 'lucide-react';
import supplyChainApi from '../../api/supplyChain';

export default function GoodsReceiptModal({
  isOpen,
  onClose,
  purchaseOrder,
  onSuccess,
}) {
  const [receivingItems, setReceivingItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && purchaseOrder) {
      const items = (purchaseOrder.items || [])
        .map((item) => {
          const pending = Math.max(0, (item.quantity_ordered || 0) - (item.quantity_received || 0));
          return {
            purchase_order_item: item.id,
            part_number: item.spare_part_number,
            part_name: item.spare_part_name,
            quantity_ordered: item.quantity_ordered,
            quantity_received: item.quantity_received,
            pending: pending,
            to_receive: pending > 0 ? pending : 0,
          };
        })
        .filter((item) => item.pending > 0);

      setReceivingItems(items);
      setNotes(`Goods receipt verified at warehouse dock for PO ${purchaseOrder.po_number}`);
      setError('');
    }
  }, [isOpen, purchaseOrder]);

  if (!isOpen || !purchaseOrder) return null;

  const handleQtyChange = (index, val) => {
    const num = val === '' ? 0 : Math.max(0, parseInt(val, 10));
    setReceivingItems((prev) => {
      const copy = [...prev];
      copy[index].to_receive = Math.min(copy[index].pending, num);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const itemsToSubmit = receivingItems
      .filter((item) => item.to_receive > 0)
      .map((item) => ({
        purchase_order_item: item.purchase_order_item,
        quantity_received: item.to_receive,
      }));

    if (itemsToSubmit.length === 0) {
      setError('Please specify at least one item quantity to receive.');
      return;
    }

    setSubmitting(true);
    try {
      await supplyChainApi.receivePurchaseOrderItems(purchaseOrder.id, {
        items: itemsToSubmit,
        notes: notes.trim(),
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setError(data.error || JSON.stringify(data));
      } else {
        setError(err.message || 'Failed to process goods receipt.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Goods Receipt Note (GRN)</h2>
              <p className="text-xs text-slate-400 font-mono">
                {purchaseOrder.po_number} • Vendor: {purchaseOrder.supplier_name}
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

        {/* Notice Banner */}
        <div className="px-6 py-3 bg-slate-800/40 border-b border-slate-800 text-xs text-slate-400 flex items-center space-x-2">
          <ArrowDownCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Receiving items will automatically update stock in Spare Parts inventory and log audit receipts.
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
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {receivingItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                All line items on this purchase order have already been fully received!
              </div>
            ) : (
              receivingItems.map((item, idx) => (
                <div
                  key={item.purchase_order_item}
                  className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between text-xs gap-4"
                >
                  <div className="space-y-0.5">
                    <span className="font-mono font-semibold text-white block">
                      {item.part_number}
                    </span>
                    <p className="text-slate-400 truncate max-w-xs">{item.part_name}</p>
                    <span className="text-[11px] text-slate-500">
                      Ordered: {item.quantity_ordered} | Recv: {item.quantity_received} | Pending:{' '}
                      <strong className="text-amber-400">{item.pending}</strong>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 text-[11px]">Receive:</span>
                    <input
                      type="number"
                      min="0"
                      max={item.pending}
                      value={item.to_receive}
                      onChange={(e) => handleQtyChange(idx, e.target.value)}
                      className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-right focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Receiving Notes / Air Waybill Reference
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. AWB-901844, Inspected at Hangar Bay 4 dock by Logistics Officer"
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
              disabled={submitting || receivingItems.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Receiving...</span>
                </>
              ) : (
                <span>Confirm Goods Receipt</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
