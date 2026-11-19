import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Plane,
  Clock,
  Layers,
  FileText,
  User,
  SlidersHorizontal
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import WorkOrderModal, {
  WORK_ORDER_TYPE_CHOICES,
  WORK_ORDER_PRIORITY_CHOICES,
  WORK_ORDER_STATUS_CHOICES
} from '../components/workorders/WorkOrderModal';
import WorkOrderDetailDrawer from '../components/workorders/WorkOrderDetailDrawer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import workOrdersApi from '../api/workOrders';
import aircraftApi from '../api/aircraft';
import maintenanceApi from '../api/maintenance';

export default function WorkOrdersPage() {
  const { user, role, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canModify = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER]);
  const canDelete = hasRole(ROLES.ADMIN);
  const canUpdateStatus = hasRole(ROLES.FIELD_TECHNICIAN);

  // Work Orders List State
  const [workOrdersList, setWorkOrdersList] = useState([]);
  const [workOrdersCount, setWorkOrdersCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [aircraftFilter, setAircraftFilter] = useState('');

  // Modals & Drawers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auxiliary dropdown options
  const [aircraftOptions, setAircraftOptions] = useState([]);
  const [scheduleOptions, setScheduleOptions] = useState([]);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Pre-load dropdown options
  useEffect(() => {
    aircraftApi.getAircraftList({ page_size: 100 }).then((res) => {
      if (res.results) setAircraftOptions(res.results);
    }).catch(() => {});

    maintenanceApi.getSchedules({ page_size: 100 }).then((res) => {
      if (res.results) setScheduleOptions(res.results);
    }).catch(() => {});
  }, []);

  // Fetch Work Orders
  const fetchWorkOrders = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (typeFilter) params.work_order_type = typeFilter;
      if (aircraftFilter) params.aircraft = aircraftFilter;

      const data = await workOrdersApi.getWorkOrders(params);
      setWorkOrdersList(data.results || []);
      setWorkOrdersCount(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Fetch Work Orders Error:', err);
      setError(err.message || 'Unable to load work orders from backend.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, typeFilter, aircraftFilter]);

  useEffect(() => {
    fetchWorkOrders(1);
  }, [fetchWorkOrders]);

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await workOrdersApi.deleteWorkOrder(deleteTarget.id);
      showToast(`Work order ${deleteTarget.work_order_number} deleted successfully.`);
      fetchWorkOrders(currentPage);
      setDeleteTarget(null);
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Deletion failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Work Orders Management</h1>
              <p className="text-xs text-slate-400">
                Maintenance dispatch, task cards, technician queues, and airworthiness release
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchWorkOrders(currentPage)}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Work Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {canModify && (
            <button
              onClick={() => {
                setSelectedForEdit(null);
                setIsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Work Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWorkOrders(1)}
            placeholder="Search work order #, title, tail #, technician..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {WORK_ORDER_STATUS_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Priorities</option>
            {WORK_ORDER_PRIORITY_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Classifications</option>
            {WORK_ORDER_TYPE_CHOICES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Aircraft Filter */}
          <select
            value={aircraftFilter}
            onChange={(e) => setAircraftFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Airframes</option>
            {aircraftOptions.map((ac) => (
              <option key={ac.id} value={ac.id}>
                {ac.registration_number}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" text="Loading maintenance work orders..." />
        ) : error ? (
          <div className="p-8 text-center text-xs text-rose-400">
            <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
            <span>{error}</span>
          </div>
        ) : workOrdersList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Work Order Number</th>
                  <th className="px-6 py-4 font-semibold">Title & Scope</th>
                  <th className="px-6 py-4 font-semibold">Airframe</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Assigned Tech</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {workOrdersList.map((wo) => (
                  <tr key={wo.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-violet-400">
                      {wo.work_order_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{wo.title}</div>
                      {wo.maintenance_schedule_title && (
                        <span className="text-[11px] text-indigo-400 flex items-center space-x-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>Schedule: {wo.maintenance_schedule_title}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1 font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                        <Plane className="w-3 h-3" />
                        <span>{wo.aircraft_registration}</span>
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{wo.aircraft_model}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          wo.priority === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : wo.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {wo.priority_display || wo.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {wo.work_order_type_display || wo.work_order_type}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={wo.status} label={wo.status_display} />
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {wo.assigned_to_username ? (
                        <span className="font-mono text-slate-200">@{wo.assigned_to_username}</span>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedDetailId(wo.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="View Line Card & Progress"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {canModify && (
                          <button
                            onClick={() => {
                              setSelectedForEdit(wo);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                            title="Edit Work Order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(wo)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 transition-colors"
                            title="Delete Work Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Activity className="w-12 h-12 mx-auto text-slate-600 mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No Work Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter || priorityFilter || typeFilter || aircraftFilter
                ? 'No work orders match the active filters.'
                : 'No work orders have been dispatched yet.'}
            </p>
            {canModify && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedForEdit(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Issue First Work Order</span>
                </button>
              </div>
            )}
          </div>
        )}

        <Pagination
          count={workOrdersCount}
          page={currentPage}
          pageSize={10}
          onPageChange={(p) => fetchWorkOrders(p)}
          loading={loading}
        />
      </div>

      {/* Work Order Create / Edit Modal */}
      <WorkOrderModal
        isOpen={isModalOpen}
        initialData={selectedForEdit}
        aircraftList={aircraftOptions}
        scheduleList={scheduleOptions}
        currentUserId={user?.id}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedForEdit(null);
        }}
        onSuccess={() => {
          showToast(selectedForEdit ? 'Work order updated successfully.' : 'New work order issued.');
          fetchWorkOrders(currentPage);
        }}
      />

      {/* Work Order Detail Drawer */}
      <WorkOrderDetailDrawer
        workOrderId={selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        canModify={canModify}
        canUpdateStatus={canUpdateStatus}
        onEdit={(wo) => {
          setSelectedForEdit(wo);
          setIsModalOpen(true);
        }}
        onStatusUpdated={() => {
          fetchWorkOrders(currentPage);
        }}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Work Order Record"
        message={`Are you sure you want to permanently delete work order ${deleteTarget?.work_order_number} (${deleteTarget?.title})? This action cannot be reversed.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
