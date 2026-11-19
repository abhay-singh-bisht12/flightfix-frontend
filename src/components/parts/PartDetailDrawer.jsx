import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  MapPin,
  Building,
  DollarSign,
  AlertTriangle,
  History,
  ArrowRightLeft,
  Edit2,
  Trash2,
  Layers,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import partsApi from '../../api/parts';

export default function PartDetailDrawer({
  partId,
  onClose,
  onEdit,
  onAdjustStock,
  onDelete,
  canModify = false,
  canDelete = false,
}) {
  const [part, setPart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = () => {
    if (!partId) return;
    setLoading(true);
    setError(null);
    partsApi
      .getPartDetail(partId)
      .then((data) => setPart(data))
      .catch((err) => setError(err.message || 'Failed to load spare part dossier.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [partId]);

  if (!partId) return null;

  const isLowStock =
    part &&
    part.quantity_in_stock <= part.minimum_stock_level &&
    part.status !== 'DISCONTINUED';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  {part?.part_number || 'Loading...'}
                </span>
                {part?.status && <StatusBadge status={part.status} />}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs">{part?.name || '...'}</p>
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
              <LoadingSpinner message="Loading part inventory specifications..." />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          ) : part ? (
            <>
              {/* Low Stock Warning Banner */}
              {isLowStock && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-semibold block text-sm">Low Stock Alert</span>
                    Current quantity ({part.quantity_in_stock}) has dropped to or below the minimum reorder threshold ({part.minimum_stock_level}).
                  </div>
                </div>
              )}

              {/* Stock Status Visual Meter */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Inventory Level
                  </span>
                  <span className="text-sm font-bold text-white">
                    {part.quantity_in_stock} Units On-Hand
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      part.quantity_in_stock === 0
                        ? 'bg-rose-500 w-0'
                        : isLowStock
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        part.minimum_stock_level > 0
                          ? Math.round((part.quantity_in_stock / (part.minimum_stock_level * 2)) * 100)
                          : 100
                      )}%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Reorder Point: {part.minimum_stock_level} units</span>
                  <span>Unit Price: ${parseFloat(part.unit_price).toFixed(2)}</span>
                  <span>Total Value: ${(part.quantity_in_stock * parseFloat(part.unit_price)).toFixed(2)}</span>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Category</span>
                  <span className="font-medium text-white text-sm">{part.category_display || part.category}</span>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">OEM Manufacturer</span>
                  <span className="font-medium text-white text-sm">{part.manufacturer}</span>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Storage Location</span>
                  <div className="flex items-center space-x-1.5 text-white font-medium text-sm">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{part.location}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block mb-1">Primary Supplier</span>
                  <div className="flex items-center space-x-1.5 text-white font-medium text-sm">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span>{part.supplier || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* MPN & Technical Description */}
              <div className="space-y-3">
                {part.manufacturer_part_number && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Manufacturer Part Number (MPN)
                    </h4>
                    <p className="text-sm font-mono text-slate-200 bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
                      {part.manufacturer_part_number}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Technical Specifications
                  </h4>
                  <p className="text-xs text-slate-300 bg-slate-800/20 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {part.description || 'No additional technical specifications provided for this item.'}
                  </p>
                </div>
              </div>

              {/* Transaction Audit Log */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Recent Inventory Movements</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">Last 10 Records</span>
                </div>

                {part.recent_transactions && part.recent_transactions.length > 0 ? (
                  <div className="space-y-2">
                    {part.recent_transactions.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                                t.transaction_type === 'RECEIPT' || t.transaction_type === 'RETURN'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : t.transaction_type === 'ISSUE'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                            >
                              {t.transaction_type_display || t.transaction_type}
                            </span>
                            <span className="text-white font-medium">
                              {t.quantity} unit{t.quantity > 1 ? 's' : ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Ref: <span className="text-slate-200">{t.reference}</span>
                            {t.performed_by_username && ` • By ${t.performed_by_username}`}
                          </p>
                          {t.notes && <p className="text-[11px] text-slate-500 italic">"{t.notes}"</p>}
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-800/20 border border-slate-800/60 text-slate-500 text-xs">
                    No transaction records logged yet for this spare part.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer actions */}
        {part && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            {canDelete && (
              <button
                onClick={() => onDelete?.(part)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              {canModify && (
                <>
                  <button
                    onClick={() => onAdjustStock?.(part)}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition flex items-center space-x-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Adjust Stock</span>
                  </button>
                  <button
                    onClick={() => onEdit?.(part)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Part</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
