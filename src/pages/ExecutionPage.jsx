import React, { useState, useEffect, useCallback } from 'react';
import {
  Wrench,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plane,
  User,
  FileCheck2,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import ExecutionModal, { EXECUTION_STATUS_CHOICES } from '../components/execution/ExecutionModal';
import DocumentationModal from '../components/execution/DocumentationModal';
import ExecutionDetailDrawer from '../components/execution/ExecutionDetailDrawer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import executionApi from '../api/execution';
import workOrdersApi from '../api/workOrders';

export default function ExecutionPage() {
  const { user, role, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canDelete = hasRole(ROLES.ADMIN);
  const canManageDocs = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER]);
  const isTechnician = hasRole(ROLES.FIELD_TECHNICIAN);
  const canCreate = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER, ROLES.FIELD_TECHNICIAN]);

  // Executions list state
  const [executionsList, setExecutionsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [workOrderFilter, setWorkOrderFilter] = useState('');

  // Modals & Drawers
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTargetExecution, setDocTargetExecution] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auxiliary Work Orders for filter
  const [workOrderOptions, setWorkOrderOptions] = useState([]);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  useEffect(() => {
    workOrdersApi.getWorkOrders({ page_size: 100 }).then((res) => {
      if (res.results) setWorkOrderOptions(res.results);
    }).catch(() => {});
  }, []);

  // Fetch Execution Records
  const fetchExecutions = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (workOrderFilter) params.work_order = workOrderFilter;

      const data = await executionApi.getExecutionRecords(params);
      setExecutionsList(data.results || []);
      setTotalCount(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance execution records.');
      setExecutionsList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, workOrderFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchExecutions(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchExecutions]);

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await executionApi.deleteExecutionRecord(deleteTarget.id);
      showToast(`Execution log #${deleteTarget.id} deleted successfully.`);
      setDeleteTarget(null);
      if (selectedDetailId === deleteTarget.id) {
        setSelectedDetailId(null);
      }
      fetchExecutions(currentPage);
    } catch (err) {
      showToast(`Delete failed: ${err.message || 'Server error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Metrics
  const activeCount = executionsList.filter(
    (e) => e.status === 'IN_PROGRESS' || e.status === 'PENDING'
  ).length;
  const completedCount = executionsList.filter((e) => e.status === 'COMPLETED').length;
  const totalLaborHours = executionsList
    .reduce((sum, e) => sum + (parseFloat(e.actual_labor_hours) || 0), 0)
    .toFixed(1);

  // Permission helper for specific execution item
  const canModifyItem = (item) => {
    if (hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER])) return true;
    if (isTechnician) {
      return item.executed_by === user?.id || item.executed_by_username === user?.username;
    }
    return false;
  };

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
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Maintenance Execution & Documentation
              </h1>
              <p className="text-xs text-slate-400">
                Real-time maintenance logs, actual labor hours, step progress, and airworthiness sign-offs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchExecutions(currentPage)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Execution Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {canCreate && (
            <button
              onClick={() => {
                setSelectedForEdit(null);
                setIsExecutionModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Execution</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Logs</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Logged maintenance records</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-400 uppercase tracking-wider">Active Executions</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{activeCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending or In Progress</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{completedCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Successfully signed off</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Labor Tracked</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalLaborHours} <span className="text-sm font-normal text-slate-400">hrs</span></div>
          <p className="text-[11px] text-slate-500 mt-1">Actual technician labor</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work order, tail, technician, narrative..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Execution Statuses</option>
              {EXECUTION_STATUS_CHOICES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Work Order Filter */}
          <div>
            <select
              value={workOrderFilter}
              onChange={(e) => setWorkOrderFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Work Orders</option>
              {workOrderOptions.map((wo) => (
                <option key={wo.id} value={wo.work_order_number}>
                  {wo.work_order_number} — {wo.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {(search || statusFilter || workOrderFilter) && (
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
            {statusFilter && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Status: {statusFilter}</span>
                <button onClick={() => setStatusFilter('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            {workOrderFilter && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Work Order: {workOrderFilter}</span>
                <button onClick={() => setWorkOrderFilter('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setWorkOrderFilter('');
              }}
              className="text-sky-400 hover:text-sky-300 underline ml-2"
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

      {/* Execution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner message="Loading maintenance execution records..." />
          </div>
        ) : executionsList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No execution logs found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter || workOrderFilter
                ? 'Try adjusting your search query or reset the filters.'
                : 'Technicians can start logging work orders, tasks, and labor hours.'}
            </p>
            {canCreate && (
              <button
                onClick={() => {
                  setSelectedForEdit(null);
                  setIsExecutionModalOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded-xl shadow-lg transition inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Maintenance Execution</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Log # & Work Order</th>
                  <th className="py-3.5 px-4">Aircraft</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Work Performed Narrative</th>
                  <th className="py-3.5 px-4">Labor</th>
                  <th className="py-3.5 px-4">Timing</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {executionsList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Log ID & Work Order */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setSelectedDetailId(item.id)}
                          className="font-mono text-sm font-semibold text-sky-400 hover:text-sky-300 transition text-left"
                        >
                          Execution #{item.id}
                        </button>
                        <p className="text-slate-300 font-medium font-mono text-[11px]">
                          {item.work_order_number}
                        </p>
                      </div>
                    </td>

                    {/* Aircraft */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 text-white font-medium">
                        <Plane className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{item.aircraft_registration}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{item.aircraft_model}</span>
                    </td>

                    {/* Technician */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 text-slate-200 font-medium">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>{item.executed_by_username}</span>
                      </div>
                    </td>

                    {/* Work Performed Narrative */}
                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-300 line-clamp-2 leading-relaxed">
                        {item.work_performed}
                      </p>
                      {item.findings && (
                        <p className="text-[10px] text-amber-400 truncate mt-0.5">
                          ⚠ Findings: {item.findings}
                        </p>
                      )}
                    </td>

                    {/* Labor */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-slate-200 font-mono font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{item.actual_labor_hours}h</span>
                      </div>
                    </td>

                    {/* Timing */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      <div>{item.started_at ? new Date(item.started_at).toLocaleDateString() : 'Pending'}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.completed_at ? `Done ${new Date(item.completed_at).toLocaleDateString()}` : 'In work'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => setSelectedDetailId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="View Execution Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {canManageDocs && (
                          <button
                            onClick={() => {
                              setDocTargetExecution(item);
                              setIsDocModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition"
                            title="Issue Sign-off / CRS"
                          >
                            <FileCheck2 className="w-4 h-4" />
                          </button>
                        )}

                        {canModifyItem(item) && (
                          <button
                            onClick={() => {
                              setSelectedForEdit(item);
                              setIsExecutionModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            title="Edit Execution Log"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Delete Execution Log"
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
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={10}
            onPageChange={(p) => fetchExecutions(p)}
          />
        </div>
      </div>

      {/* Execution Create/Edit Modal */}
      <ExecutionModal
        isOpen={isExecutionModalOpen}
        onClose={() => setIsExecutionModalOpen(false)}
        initialData={selectedForEdit}
        currentUserId={user?.id}
        onSuccess={() => {
          showToast(selectedForEdit ? 'Execution log updated.' : 'Maintenance execution logged successfully.');
          fetchExecutions(currentPage);
        }}
      />

      {/* Technical Documentation / Sign-off Modal */}
      <DocumentationModal
        isOpen={isDocModalOpen}
        execution={docTargetExecution}
        currentUserId={user?.id}
        onClose={() => {
          setIsDocModalOpen(false);
          setDocTargetExecution(null);
        }}
        onSuccess={() => {
          showToast('Technical documentation / CRS issued successfully.');
          fetchExecutions(currentPage);
          if (selectedDetailId === docTargetExecution?.id) {
            setSelectedDetailId(docTargetExecution.id);
          }
        }}
      />

      {/* Execution Detail Drawer */}
      <ExecutionDetailDrawer
        executionId={selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        canModify={selectedDetailId ? canModifyItem(executionsList.find((e) => e.id === selectedDetailId) || {}) : false}
        canDelete={canDelete}
        canManageDocs={canManageDocs}
        onEdit={(item) => {
          setSelectedForEdit(item);
          setIsExecutionModalOpen(true);
        }}
        onDelete={(item) => {
          setDeleteTarget(item);
        }}
        onAddDocument={(item) => {
          setDocTargetExecution(item);
          setIsDocModalOpen(true);
        }}
        onRecordUpdated={() => {
          fetchExecutions(currentPage);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Execution Log"
        message={`Are you sure you want to delete Maintenance Execution Log #${deleteTarget?.id} for Work Order ${deleteTarget?.work_order_number}? This action cannot be undone.`}
        confirmLabel="Delete Log"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
