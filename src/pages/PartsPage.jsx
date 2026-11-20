import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Filter,
  DollarSign,
  Layers,
  MapPin,
  CheckCircle
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import PartModal, { PART_CATEGORY_CHOICES, PART_STATUS_CHOICES } from '../components/parts/PartModal';
import StockAdjustmentModal from '../components/parts/StockAdjustmentModal';
import PartDetailDrawer from '../components/parts/PartDetailDrawer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import partsApi from '../api/parts';

export default function PartsPage() {
  const { user, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canModify = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER]);
  const canDelete = hasRole(ROLES.ADMIN);

  // Spare parts state
  const [partsList, setPartsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals & Drawers
  const [isPartModalOpen, setIsPartModalOpen] = useState(false);
  const [selectedPartForEdit, setSelectedPartForEdit] = useState(null);
  const [selectedPartDetailId, setSelectedPartDetailId] = useState(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedPartForStock, setSelectedPartForStock] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch Parts
  const fetchParts = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.low_stock = 'true';

      const data = await partsApi.getParts(params);
      setPartsList(data.results || []);
      setTotalCount(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to fetch spare parts inventory.');
      setPartsList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, lowStockOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParts(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchParts]);

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await partsApi.deletePart(deleteTarget.id);
      showToast(`Spare part ${deleteTarget.part_number} deleted successfully.`);
      setDeleteTarget(null);
      if (selectedPartDetailId === deleteTarget.id) {
        setSelectedPartDetailId(null);
      }
      fetchParts(currentPage);
    } catch (err) {
      showToast(`Delete failed: ${err.message || 'Server error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick stat computations
  const inStockCount = partsList.filter((p) => p.status === 'IN_STOCK').length;
  const lowStockCount = partsList.filter(
    (p) => p.status === 'LOW_STOCK' || (p.quantity_in_stock <= p.minimum_stock_level && p.status !== 'DISCONTINUED')
  ).length;
  const outOfStockCount = partsList.filter((p) => p.status === 'OUT_OF_STOCK' || p.quantity_in_stock === 0).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-500/95 text-white px-4 py-3 rounded-xl shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Spare Parts Inventory</h1>
              <p className="text-xs text-slate-400">
                Aircraft components, rotables, consumables, stock levels, and warehouse bins
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchParts(currentPage)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          {canModify && (
            <button
              onClick={() => {
                setSelectedPartForEdit(null);
                setIsPartModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Spare Part</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Catalog Items</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Total registered part SKUs</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">In Stock</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{inStockCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Healthy stock on-hand</p>
        </div>

        <button
          onClick={() => setLowStockOnly(!lowStockOnly)}
          className={`p-4 rounded-2xl border text-left transition backdrop-blur-sm ${
            lowStockOnly
              ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/30'
              : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Low Stock</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{lowStockCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {lowStockOnly ? '✓ Filter active (Click to reset)' : 'Click to filter low stock items'}
          </p>
        </button>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">Depleted / Out</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{outOfStockCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero units available</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by part number, name, OEM, or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {PART_CATEGORY_CHOICES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Stock Statuses</option>
              {PART_STATUS_CHOICES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {(search || statusFilter || categoryFilter || lowStockOnly) && (
          <div className="flex items-center flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500">Active filters:</span>
            {search && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Keyword: "{search}"</span>
                <button onClick={() => setSearch('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            {categoryFilter && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Category: {categoryFilter}</span>
                <button onClick={() => setCategoryFilter('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Status: {statusFilter}</span>
                <button onClick={() => setStatusFilter('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            {lowStockOnly && (
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30 flex items-center space-x-1">
                <span>Low Stock Only</span>
                <button onClick={() => setLowStockOnly(false)} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setCategoryFilter('');
                setLowStockOnly(false);
              }}
              className="text-blue-400 hover:text-blue-300 underline ml-2"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Parts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner message="Loading spare parts catalog..." />
          </div>
        ) : partsList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No spare parts found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter || categoryFilter || lowStockOnly
                ? 'Try adjusting your search criteria or clearing active filters.'
                : 'Get started by registering spare parts and warehouse inventory items.'}
            </p>
            {canModify && (
              <button
                onClick={() => {
                  setSelectedPartForEdit(null);
                  setIsPartModalOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl shadow-lg transition inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spare Part</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Part Number & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Manufacturer</th>
                  <th className="py-3.5 px-4">Stock Level</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Unit Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {partsList.map((part) => {
                  const isWarning =
                    part.quantity_in_stock <= part.minimum_stock_level &&
                    part.status !== 'DISCONTINUED';

                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Part Number & Title */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setSelectedPartDetailId(part.id)}
                            className="font-mono text-sm font-semibold text-blue-400 hover:text-blue-300 transition text-left"
                          >
                            {part.part_number}
                          </button>
                          <p className="text-slate-300 font-medium truncate max-w-[200px]">{part.name}</p>
                          {part.manufacturer_part_number && (
                            <p className="text-[10px] text-slate-500 font-mono">MPN: {part.manufacturer_part_number}</p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
                          {part.category_display || part.category}
                        </span>
                      </td>

                      {/* Manufacturer */}
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {part.manufacturer}
                      </td>

                      {/* Stock Level & Visual Bar */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`font-semibold text-sm ${
                                part.quantity_in_stock === 0
                                  ? 'text-rose-400'
                                  : isWarning
                                  ? 'text-amber-400'
                                  : 'text-white'
                              }`}
                            >
                              {part.quantity_in_stock}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              / min {part.minimum_stock_level}
                            </span>
                          </div>

                          <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full ${
                                part.quantity_in_stock === 0
                                  ? 'bg-rose-500'
                                  : isWarning
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
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-400">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{part.location}</span>
                        </div>
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-4 text-slate-200 font-mono font-medium">
                        ${parseFloat(part.unit_price).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StatusBadge status={part.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => setSelectedPartDetailId(part.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="View Specifications"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canModify && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPartForStock(part);
                                  setIsStockModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition"
                                title="Record Stock Movement"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedPartForEdit(part);
                                  setIsPartModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="Edit Spare Part"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(part)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Spare Part"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-800">
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={10}
            onPageChange={(p) => fetchParts(p)}
          />
        </div>
      </div>

      {/* Part Create/Edit Modal */}
      <PartModal
        isOpen={isPartModalOpen}
        onClose={() => setIsPartModalOpen(false)}
        initialData={selectedPartForEdit}
        onSuccess={() => {
          showToast(selectedPartForEdit ? 'Part updated successfully.' : 'New spare part registered.');
          fetchParts(currentPage);
        }}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isStockModalOpen}
        part={selectedPartForStock}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedPartForStock(null);
        }}
        onSuccess={() => {
          showToast('Stock transaction recorded successfully.');
          fetchParts(currentPage);
          if (selectedPartDetailId === selectedPartForStock?.id) {
            // refresh drawer if open
            setSelectedPartDetailId(selectedPartForStock.id);
          }
        }}
      />

      {/* Part Detail Drawer */}
      <PartDetailDrawer
        partId={selectedPartDetailId}
        onClose={() => setSelectedPartDetailId(null)}
        canModify={canModify}
        canDelete={canDelete}
        onEdit={(part) => {
          setSelectedPartForEdit(part);
          setIsPartModalOpen(true);
        }}
        onAdjustStock={(part) => {
          setSelectedPartForStock(part);
          setIsStockModalOpen(true);
        }}
        onDelete={(part) => {
          setDeleteTarget(part);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Spare Part"
        message={`Are you sure you want to delete ${deleteTarget?.part_number} (${deleteTarget?.name})? This action cannot be undone.`}
        confirmLabel="Delete Part"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
