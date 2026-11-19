import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck,
  Building2,
  ShoppingCart,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  DollarSign,
  PackageCheck,
  PackagePlus,
  Layers,
  MapPin,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import SupplierModal, { SUPPLIER_TYPE_CHOICES, SUPPLIER_STATUS_CHOICES } from '../components/supplychain/SupplierModal';
import PurchaseOrderModal, { PO_STATUS_CHOICES, PO_PRIORITY_CHOICES } from '../components/supplychain/PurchaseOrderModal';
import PurchaseOrderDetailDrawer from '../components/supplychain/PurchaseOrderDetailDrawer';
import GoodsReceiptModal from '../components/supplychain/GoodsReceiptModal';
import AddOrderItemModal from '../components/supplychain/AddOrderItemModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import supplyChainApi from '../api/supplyChain';

export default function SupplyChainPage() {
  const { user, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canModify = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER, ROLES.CONTRACTS_MANAGER]);
  const canDelete = hasRole(ROLES.ADMIN);
  const canReceive = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER, ROLES.CONTRACTS_MANAGER]);

  // Tab State: 'orders' | 'suppliers'
  const [activeTab, setActiveTab] = useState('orders');

  // Purchase Orders State
  const [ordersList, setOrdersList] = useState([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // PO Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderPriorityFilter, setOrderPriorityFilter] = useState('');

  // Suppliers State
  const [suppliersList, setSuppliersList] = useState([]);
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [suppliersPage, setSuppliersPage] = useState(1);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [suppliersError, setSuppliersError] = useState(null);

  // Supplier Filters
  const [supplierSearch, setSupplierSearch] = useState('');
  const [supplierStatusFilter, setSupplierStatusFilter] = useState('');
  const [supplierTypeFilter, setSupplierTypeFilter] = useState('');

  // Modals & Drawers
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [selectedPOForEdit, setSelectedPOForEdit] = useState(null);
  const [selectedPODetailId, setSelectedPODetailId] = useState(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [targetPOForReceipt, setTargetPOForReceipt] = useState(null);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [targetPOForAddItem, setTargetPOForAddItem] = useState(null);

  // Deletion target
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState('order'); // 'order' | 'supplier'
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Fetch Purchase Orders
  const fetchPurchaseOrders = useCallback(async (page = 1) => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const params = { page };
      if (orderSearch.trim()) params.search = orderSearch.trim();
      if (orderStatusFilter) params.status = orderStatusFilter;
      if (orderPriorityFilter) params.priority = orderPriorityFilter;

      const data = await supplyChainApi.getPurchaseOrders(params);
      setOrdersList(data.results || []);
      setOrdersCount(data.count || 0);
      setOrdersPage(page);
    } catch (err) {
      setOrdersError(err.message || 'Failed to fetch purchase orders.');
      setOrdersList([]);
      setOrdersCount(0);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderSearch, orderStatusFilter, orderPriorityFilter]);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async (page = 1) => {
    setSuppliersLoading(true);
    setSuppliersError(null);
    try {
      const params = { page };
      if (supplierSearch.trim()) params.search = supplierSearch.trim();
      if (supplierStatusFilter) params.status = supplierStatusFilter;
      if (supplierTypeFilter) params.supplier_type = supplierTypeFilter;

      const data = await supplyChainApi.getSuppliers(params);
      setSuppliersList(data.results || []);
      setSuppliersCount(data.count || 0);
      setSuppliersPage(page);
    } catch (err) {
      setSuppliersError(err.message || 'Failed to fetch suppliers.');
      setSuppliersList([]);
      setSuppliersCount(0);
    } finally {
      setSuppliersLoading(false);
    }
  }, [supplierSearch, supplierStatusFilter, supplierTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'orders') {
        fetchPurchaseOrders(1);
      } else {
        fetchSuppliers(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, fetchPurchaseOrders, fetchSuppliers]);

  // Delete Action
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteType === 'order') {
        await supplyChainApi.deletePurchaseOrder(deleteTarget.id);
        showToast(`Purchase order ${deleteTarget.po_number} deleted successfully.`);
        if (selectedPODetailId === deleteTarget.id) setSelectedPODetailId(null);
        fetchPurchaseOrders(ordersPage);
      } else {
        await supplyChainApi.deleteSupplier(deleteTarget.id);
        showToast(`Supplier ${deleteTarget.supplier_code} deleted successfully.`);
        fetchSuppliers(suppliersPage);
      }
      setDeleteTarget(null);
    } catch (err) {
      showToast(`Delete failed: ${err.message || 'Server error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Metrics
  const activeOrdersCount = ordersList.filter(
    (o) => o.status === 'APPROVED' || o.status === 'ORDERED'
  ).length;
  const fulfilledOrdersCount = ordersList.filter((o) => o.status === 'RECEIVED').length;
  const totalValuation = ordersList
    .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0)
    .toFixed(2);

  const activeSuppliersCount = suppliersList.filter((s) => s.status === 'ACTIVE').length;
  const oemCount = suppliersList.filter((s) => s.supplier_type === 'OEM').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-500/95 text-white px-4 py-3 rounded-xl shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ERP & Supply Chain</h1>
              <p className="text-sm text-slate-400">
                Manage commercial vendors, procurement purchase orders, and warehouse goods receipts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => (activeTab === 'orders' ? fetchPurchaseOrders(ordersPage) : fetchSuppliers(suppliersPage))}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition shadow-sm"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                (activeTab === 'orders' ? ordersLoading : suppliersLoading) ? 'animate-spin text-emerald-400' : ''
              }`}
            />
          </button>

          {canModify && activeTab === 'orders' && (
            <button
              onClick={() => {
                setSelectedPOForEdit(null);
                setIsPOModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          )}

          {canModify && activeTab === 'suppliers' && (
            <button
              onClick={() => {
                setSelectedSupplierForEdit(null);
                setIsSupplierModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Orders ({ordersCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'suppliers'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Vendors & Suppliers ({suppliersCount})</span>
        </button>
      </div>

      {/* ================= TAB 1: PURCHASE ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{ordersCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Logged procurement orders</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sky-400 uppercase tracking-wider">Active in Transit</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{activeOrdersCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Approved or Dispatched</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Fulfilled</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{fulfilledOrdersCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Goods received into inventory</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Procurement Value</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white font-mono">${totalValuation}</div>
              <p className="text-[11px] text-slate-500 mt-1">Total orders valuation</p>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search PO #, supplier name, code, notes..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Order Statuses</option>
                  {PO_STATUS_CHOICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={orderPriorityFilter}
                  onChange={(e) => setOrderPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">All Priorities</option>
                  {PO_PRIORITY_CHOICES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* PO Error Banner */}
          {ordersError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{ordersError}</span>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {ordersLoading ? (
              <div className="py-24 flex justify-center">
                <LoadingSpinner message="Loading purchase orders..." />
              </div>
            ) : ordersList.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">No purchase orders found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {orderSearch || orderStatusFilter || orderPriorityFilter
                    ? 'Try adjusting your search criteria or reset filters.'
                    : 'Create your first purchase order to procure spare parts and materials.'}
                </p>
                {canModify && (
                  <button
                    onClick={() => {
                      setSelectedPOForEdit(null);
                      setIsPOModalOpen(true);
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-lg transition inline-flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Purchase Order</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-4">PO Number & Vendor</th>
                      <th className="py-3.5 px-4">Order Date</th>
                      <th className="py-3.5 px-4">Expected Delivery</th>
                      <th className="py-3.5 px-4">Total Amount</th>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ordersList.map((order) => {
                      const isReceivable =
                        ['APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED'].includes(order.status);

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-800/30 transition-colors group"
                        >
                          {/* PO # & Supplier */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <button
                                onClick={() => setSelectedPODetailId(order.id)}
                                className="font-mono text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition text-left"
                              >
                                {order.po_number}
                              </button>
                              <p className="text-slate-300 font-medium truncate max-w-xs">
                                {order.supplier_name}{' '}
                                <span className="text-slate-500 text-[10px] font-mono">
                                  ({order.supplier_code})
                                </span>
                              </p>
                            </div>
                          </td>

                          {/* Order Date */}
                          <td className="py-3 px-4 text-slate-300 font-medium">
                            {order.order_date}
                          </td>

                          {/* Expected Delivery */}
                          <td className="py-3 px-4 text-slate-300">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-500" />
                              <span>{order.expected_delivery_date}</span>
                            </div>
                          </td>

                          {/* Total Valuation */}
                          <td className="py-3 px-4 text-emerald-400 font-mono font-semibold text-sm">
                            ${parseFloat(order.total_amount || 0).toFixed(2)}
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-4">
                            <StatusBadge status={order.priority} />
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <StatusBadge status={order.status} />
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1 opacity-90 group-hover:opacity-100">
                              <button
                                onClick={() => setSelectedPODetailId(order.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="View Purchase Order Dossier"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {isReceivable && canReceive && (
                                <button
                                  onClick={() => {
                                    setTargetPOForReceipt(order);
                                    setIsReceiptModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition"
                                  title="Receive Goods (GRN)"
                                >
                                  <PackageCheck className="w-4 h-4" />
                                </button>
                              )}

                              {canModify && order.status === 'DRAFT' && (
                                <button
                                  onClick={() => {
                                    setTargetPOForAddItem(order);
                                    setIsAddItemModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                  title="Add Line Item"
                                >
                                  <PackagePlus className="w-4 h-4" />
                                </button>
                              )}

                              {canModify && (
                                <button
                                  onClick={() => {
                                    setSelectedPOForEdit(order);
                                    setIsPOModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                  title="Edit Order"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  onClick={() => {
                                    setDeleteTarget(order);
                                    setDeleteType('order');
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                  title="Delete Order"
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
                currentPage={ordersPage}
                totalCount={ordersCount}
                pageSize={10}
                onPageChange={(p) => fetchPurchaseOrders(p)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SUPPLIERS / VENDORS ================= */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6">
          {/* KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Registered Vendors</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{suppliersCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Vendor records</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Active Suppliers</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{activeSuppliersCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Approved for purchase orders</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-sky-400 uppercase tracking-wider">OEMs</span>
                <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{oemCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Original Equipment Manufacturers</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-purple-400 uppercase tracking-wider">Distributors</span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{suppliersCount - oemCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Authorized distributors & logisticians</p>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  placeholder="Search code, name, contact, city, country..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <select
                  value={supplierStatusFilter}
                  onChange={(e) => setSupplierStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Vendor Statuses</option>
                  {SUPPLIER_STATUS_CHOICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={supplierTypeFilter}
                  onChange={(e) => setSupplierTypeFilter(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">All Supplier Types</option>
                  {SUPPLIER_TYPE_CHOICES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Supplier Error Banner */}
          {suppliersError && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{suppliersError}</span>
            </div>
          )}

          {/* Suppliers Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {suppliersLoading ? (
              <div className="py-24 flex justify-center">
                <LoadingSpinner message="Loading suppliers directory..." />
              </div>
            ) : suppliersList.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">No vendors or suppliers found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {supplierSearch || supplierStatusFilter || supplierTypeFilter
                    ? 'Try adjusting your search criteria or reset filters.'
                    : 'Register your first supplier or OEM vendor.'}
                </p>
                {canModify && (
                  <button
                    onClick={() => {
                      setSelectedSupplierForEdit(null);
                      setIsSupplierModalOpen(true);
                    }}
                    className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-xl shadow-lg transition inline-flex items-center space-x-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Vendor</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-3.5 px-4">Vendor Code & Legal Name</th>
                      <th className="py-3.5 px-4">Supplier Type</th>
                      <th className="py-3.5 px-4">Contact Person</th>
                      <th className="py-3.5 px-4">Contact Details</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {suppliersList.map((sup) => (
                      <tr
                        key={sup.id}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* Code & Name */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono text-sm font-semibold text-amber-400 block">
                              {sup.supplier_code}
                            </span>
                            <p className="text-slate-200 font-medium truncate max-w-xs">{sup.name}</p>
                          </div>
                        </td>

                        {/* Supplier Type */}
                        <td className="py-3 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
                            {sup.supplier_type_display || sup.supplier_type}
                          </span>
                        </td>

                        {/* Contact Person */}
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {sup.contact_person || 'N/A'}
                        </td>

                        {/* Contact Details */}
                        <td className="py-3 px-4 text-slate-400">
                          <div>{sup.email || '—'}</div>
                          <div className="text-[11px] text-slate-500">{sup.phone || ''}</div>
                        </td>

                        {/* Location */}
                        <td className="py-3 px-4 text-slate-300">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {sup.city ? `${sup.city}, ` : ''}
                              {sup.country || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <StatusBadge status={sup.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1 opacity-90 group-hover:opacity-100">
                            {canModify && (
                              <button
                                onClick={() => {
                                  setSelectedSupplierForEdit(sup);
                                  setIsSupplierModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                                title="Edit Vendor"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {canDelete && (
                              <button
                                onClick={() => {
                                  setDeleteTarget(sup);
                                  setDeleteType('supplier');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete Vendor"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 border-t border-slate-800">
              <Pagination
                currentPage={suppliersPage}
                totalCount={suppliersCount}
                pageSize={10}
                onPageChange={(p) => fetchSuppliers(p)}
              />
            </div>
          </div>
        </div>
      )}

      {/* PO Create/Edit Modal */}
      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        initialData={selectedPOForEdit}
        currentUserId={user?.id}
        onSuccess={() => {
          showToast(selectedPOForEdit ? 'Purchase order updated.' : 'New purchase order created.');
          fetchPurchaseOrders(ordersPage);
        }}
      />

      {/* Supplier Create/Edit Modal */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        initialData={selectedSupplierForEdit}
        onSuccess={() => {
          showToast(selectedSupplierForEdit ? 'Supplier updated.' : 'New vendor registered.');
          fetchSuppliers(suppliersPage);
        }}
      />

      {/* Add Line Item Modal */}
      <AddOrderItemModal
        isOpen={isAddItemModalOpen}
        purchaseOrder={targetPOForAddItem}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setTargetPOForAddItem(null);
        }}
        onSuccess={() => {
          showToast('Spare part item added to purchase order.');
          fetchPurchaseOrders(ordersPage);
          if (selectedPODetailId === targetPOForAddItem?.id) {
            setSelectedPODetailId(targetPOForAddItem.id);
          }
        }}
      />

      {/* Goods Receipt Modal */}
      <GoodsReceiptModal
        isOpen={isReceiptModalOpen}
        purchaseOrder={targetPOForReceipt}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setTargetPOForReceipt(null);
        }}
        onSuccess={() => {
          showToast('Goods receipt verified and inventory stock updated.');
          fetchPurchaseOrders(ordersPage);
          if (selectedPODetailId === targetPOForReceipt?.id) {
            setSelectedPODetailId(targetPOForReceipt.id);
          }
        }}
      />

      {/* Purchase Order Detail Drawer */}
      <PurchaseOrderDetailDrawer
        purchaseOrderId={selectedPODetailId}
        onClose={() => setSelectedPODetailId(null)}
        canModify={canModify}
        canDelete={canDelete}
        canReceive={canReceive}
        currentUserId={user?.id}
        onEdit={(po) => {
          setSelectedPOForEdit(po);
          setIsPOModalOpen(true);
        }}
        onDelete={(po) => {
          setDeleteTarget(po);
          setDeleteType('order');
        }}
        onAddItem={(po) => {
          setTargetPOForAddItem(po);
          setIsAddItemModalOpen(true);
        }}
        onReceiveGoods={(po) => {
          setTargetPOForReceipt(po);
          setIsReceiptModalOpen(true);
        }}
        onOrderUpdated={() => {
          fetchPurchaseOrders(ordersPage);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteType === 'order' ? 'Delete Purchase Order' : 'Delete Supplier'}
        message={
          deleteType === 'order'
            ? `Are you sure you want to delete Purchase Order ${deleteTarget?.po_number}? This will remove all associated line items. This action cannot be undone.`
            : `Are you sure you want to delete Supplier ${deleteTarget?.supplier_code} (${deleteTarget?.name})? This action cannot be undone.`
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
