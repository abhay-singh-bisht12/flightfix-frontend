import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  PackageCheck,
  PackagePlus,
  Edit2,
  Trash2,
  MapPin,
  CheckCircle2,
  Layers,
  CheckCircle,
  Truck
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import supplyChainApi from '../../api/supplyChain';
import { useAuth } from '../../context/AuthContext';

export default function PurchaseOrderDetailDrawer({
  purchaseOrderId,
  onClose,
  onEdit,
  onDelete,
  onAddItem,
  onReceiveGoods,
  canModify = false,
  canDelete = false,
  canReceive = false,
  currentUserId = null,
  onOrderUpdated,
}) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const effectiveUserId = currentUserId || user?.id;

  const fetchDetail = () => {
    if (!purchaseOrderId) return;
    setLoading(true);
    setError(null);
    supplyChainApi
      .getPurchaseOrderDetail(purchaseOrderId)
      .then((data) => setOrder(data))
      .catch((err) => setError(err.message || 'Failed to load purchase order dossier.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [purchaseOrderId]);

  if (!purchaseOrderId) return null;

  // Handle direct status progression (e.g. DRAFT -> APPROVED -> ORDERED)
  const handleStatusTransition = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const patchData = { status: newStatus };
      if (newStatus === 'APPROVED' && effectiveUserId) {
        patchData.approved_by = effectiveUserId;
        patchData.approved_at = new Date().toISOString();
      }
      const updated = await supplyChainApi.patchPurchaseOrder(order.id, patchData);
      setOrder(updated);
      onOrderUpdated?.();
    } catch (err) {
      alert(`Status transition failed: ${err.message || 'Server error'}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  const isReceivable =
    order &&
    ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status) &&
    order.items &&
    order.items.some((item) => (item.quantity_ordered - item.quantity_received) > 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  {order?.po_number || 'Loading...'}
                </span>
                {order?.status && <StatusBadge status={order.status} />}
                {order?.priority && <StatusBadge status={order.priority} />}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                Vendor: {order?.supplier_name || '...'} ({order?.supplier_code || '...'})
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner message="Loading purchase order specifications..." />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          ) : order ? (
            <>
              {/* Quick Status Workflow Action Bar */}
              {canModify && order.status !== 'RECEIVED' && order.status !== 'CANCELLED' && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Purchase Order Workflow Actions:
                  </span>
                  <div className="flex items-center flex-wrap gap-2">
                    {order.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusTransition('APPROVED')}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Order</span>
                      </button>
                    )}

                    {(order.status === 'DRAFT' || order.status === 'APPROVED') && (
                      <button
                        onClick={() => handleStatusTransition('ORDERED')}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch / Mark Ordered</span>
                      </button>
                    )}

                    {isReceivable && canReceive && (
                      <button
                        onClick={() => onReceiveGoods?.(order)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1.5"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Receive Goods (GRN)</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusTransition('CANCELLED')}
                      disabled={statusUpdating}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel PO</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Core Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Supplier Code</span>
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{order.supplier_code}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Order Date</span>
                  <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{order.order_date}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Expected Arrival</span>
                  <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>{order.expected_delivery_date}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Total Valuation</span>
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold font-mono text-sm">
                    <span>${parseFloat(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address & Notes */}
              {order.delivery_address && (
                <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-slate-400">Destination Warehouse Bay:</span>
                    {order.delivery_address}
                  </div>
                </div>
              )}

              {order.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Procurement Notes
                  </h4>
                  <p className="text-xs text-slate-300 bg-slate-800/20 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {order.notes}
                  </p>
                </div>
              )}

              {/* PO Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span>Procured Spare Parts ({order.items?.length ?? 0} Items)</span>
                  </h4>

                  {canModify && order.status === 'DRAFT' && (
                    <button
                      onClick={() => onAddItem?.(order)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition flex items-center space-x-1"
                    >
                      <PackagePlus className="w-3 h-3" />
                      <span>Add Part</span>
                    </button>
                  )}
                </div>

                {order.items && order.items.length > 0 ? (
                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const isComplete = item.quantity_received >= item.quantity_ordered;
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-semibold text-white">
                                {item.spare_part_number}
                              </span>
                              {isComplete ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Fulfilled
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Pending {item.quantity_pending}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-300 font-medium">{item.spare_part_name}</p>
                            <p className="text-[11px] text-slate-400">
                              Unit Price: ${parseFloat(item.unit_price).toFixed(2)} • Subtotal: ${parseFloat(item.line_total).toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right space-y-1 shrink-0">
                            <div className="font-semibold text-white text-sm">
                              {item.quantity_received} / {item.quantity_ordered} units
                            </div>
                            <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden ml-auto">
                              <div
                                className={`h-1.5 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{
                                  width: `${Math.min(100, Math.round((item.quantity_received / item.quantity_ordered) * 100))}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-800/20 border border-slate-800/60 text-slate-500 text-xs">
                    No spare parts added to this purchase order yet. Click "Add Part" to attach inventory items.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer actions */}
        {order && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            {canDelete && (
              <button
                onClick={() => onDelete?.(order)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete PO</span>
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              {isReceivable && canReceive && (
                <button
                  onClick={() => onReceiveGoods?.(order)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition flex items-center space-x-1.5"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Receive Goods</span>
                </button>
              )}

              {canModify && (
                <button
                  onClick={() => onEdit?.(order)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit PO</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
