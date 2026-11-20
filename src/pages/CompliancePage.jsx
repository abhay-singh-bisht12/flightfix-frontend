import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Plane,
  AlertTriangle,
  ShieldAlert,
  FileCheck2,
  CheckCircle,
  Clock
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import RequirementModal, {
  REGULATION_TYPE_CHOICES,
  REQUIREMENT_PRIORITY_CHOICES,
  REQUIREMENT_STATUS_CHOICES,
} from '../components/compliance/RequirementModal';
import VerificationModal from '../components/compliance/VerificationModal';
import RequirementDetailDrawer from '../components/compliance/RequirementDetailDrawer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import complianceApi from '../api/compliance';
import aircraftApi from '../api/aircraft';

export default function CompliancePage() {
  const { user, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canModify = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER]);
  const canDelete = hasRole(ROLES.ADMIN);

  // Requirements state
  const [requirementsList, setRequirementsList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [regulationTypeFilter, setRegulationTypeFilter] = useState('');
  const [aircraftFilter, setAircraftFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);

  // Modals & Drawers
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [selectedForEdit, setSelectedForEdit] = useState(null);
  const [selectedDetailId, setSelectedDetailId] = useState(null);

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationTargetReq, setVerificationTargetReq] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Auxiliary aircraft options for filter
  const [aircraftOptions, setAircraftOptions] = useState([]);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  useEffect(() => {
    aircraftApi.getAircraftList({ page_size: 100 }).then((res) => {
      if (res.results) setAircraftOptions(res.results);
    }).catch(() => {});
  }, []);

  // Fetch Compliance Requirements
  const fetchRequirements = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page };
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (regulationTypeFilter) params.regulation_type = regulationTypeFilter;
      if (aircraftFilter) params.aircraft = aircraftFilter;

      const data = await complianceApi.getRequirements(params);
      let results = data.results || [];
      if (overdueOnly) {
        const today = new Date().toISOString().slice(0, 10);
        results = results.filter((r) => r.due_date < today && r.status !== 'COMPLIANT');
      }
      setRequirementsList(results);
      setTotalCount(data.count || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message || 'Failed to fetch compliance requirements.');
      setRequirementsList([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, regulationTypeFilter, aircraftFilter, overdueOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequirements(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchRequirements]);

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await complianceApi.deleteRequirement(deleteTarget.id);
      showToast(`Mandate ${deleteTarget.requirement_code} deleted successfully.`);
      setDeleteTarget(null);
      if (selectedDetailId === deleteTarget.id) {
        setSelectedDetailId(null);
      }
      fetchRequirements(currentPage);
    } catch (err) {
      showToast(`Delete failed: ${err.message || 'Server error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Metrics
  const compliantCount = requirementsList.filter((r) => r.status === 'COMPLIANT').length;
  const inWorkCount = requirementsList.filter((r) => r.status === 'OPEN' || r.status === 'IN_PROGRESS').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const overdueCount = requirementsList.filter(
    (r) => r.due_date < todayStr && r.status !== 'COMPLIANT'
  ).length;

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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Compliance & Airworthiness Directives</h1>
              <p className="text-xs text-slate-400">
                Track FAA / EASA regulatory requirements, ADs, SBs, and airworthiness conformity
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchRequirements(currentPage)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Requirements"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          {canModify && (
            <button
              onClick={() => {
                setSelectedForEdit(null);
                setIsRequirementModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Mandate</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Mandates</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Airworthiness requirements</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Compliant</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{compliantCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Verified airworthy</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">In Work</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{inWorkCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Open or In Progress</p>
        </div>

        <button
          onClick={() => setOverdueOnly(!overdueOnly)}
          className={`p-4 rounded-2xl border text-left transition backdrop-blur-sm ${
            overdueOnly
              ? 'bg-rose-500/15 border-rose-500/40 ring-1 ring-rose-500/30'
              : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400 uppercase tracking-wider">Overdue Alerts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{overdueCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {overdueOnly ? '✓ Filter active (Click to reset)' : 'Click to filter overdue items'}
          </p>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, title, authority, tail..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Statuses</option>
              {REQUIREMENT_STATUS_CHOICES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Regulation Type Filter */}
          <div>
            <select
              value={regulationTypeFilter}
              onChange={(e) => setRegulationTypeFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Regulation Types</option>
              {REGULATION_TYPE_CHOICES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aircraft Filter */}
          <div>
            <select
              value={aircraftFilter}
              onChange={(e) => setAircraftFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Aircraft</option>
              {aircraftOptions.map((ac) => (
                <option key={ac.id} value={ac.registration_number}>
                  {ac.registration_number} — {ac.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Pills */}
        {(search || statusFilter || priorityFilter || regulationTypeFilter || aircraftFilter || overdueOnly) && (
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
            {regulationTypeFilter && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Type: {regulationTypeFilter}</span>
                <button onClick={() => setRegulationTypeFilter('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            {aircraftFilter && (
              <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700 flex items-center space-x-1">
                <span>Aircraft: {aircraftFilter}</span>
                <button onClick={() => setAircraftFilter('')} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            {overdueOnly && (
              <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-lg border border-rose-500/30 flex items-center space-x-1">
                <span>Overdue Only</span>
                <button onClick={() => setOverdueOnly(false)} className="hover:text-white ml-1">
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPriorityFilter('');
                setRegulationTypeFilter('');
                setAircraftFilter('');
                setOverdueOnly(false);
              }}
              className="text-purple-400 hover:text-purple-300 underline ml-2"
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

      {/* Compliance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner message="Loading airworthiness compliance records..." />
          </div>
        ) : requirementsList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white">No compliance requirements found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter || regulationTypeFilter || aircraftFilter || overdueOnly
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Safety officers can issue airworthiness directives and service bulletins.'}
            </p>
            {canModify && (
              <button
                onClick={() => {
                  setSelectedForEdit(null);
                  setIsRequirementModalOpen(true);
                }}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-xl shadow-lg transition inline-flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Regulatory Mandate</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Mandate Code & Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Aircraft</th>
                  <th className="py-3.5 px-4">Authority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requirementsList.map((item) => {
                  const isItemOverdue =
                    item.due_date && item.due_date < todayStr && item.status !== 'COMPLIANT';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Code & Title */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setSelectedDetailId(item.id)}
                            className="font-mono text-sm font-semibold text-purple-400 hover:text-purple-300 transition text-left"
                          >
                            {item.requirement_code}
                          </button>
                          <p className="text-slate-300 font-medium truncate max-w-xs">{item.title}</p>
                        </div>
                      </td>

                      {/* Regulation Type */}
                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px]">
                          {item.regulation_type_display || item.regulation_type}
                        </span>
                      </td>

                      {/* Aircraft */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5 text-white font-medium">
                          <Plane className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{item.aircraft_registration}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{item.aircraft_model}</span>
                      </td>

                      {/* Issuing Authority */}
                      <td className="py-3 px-4 text-slate-300 font-medium">
                        {item.issuing_authority}
                      </td>

                      {/* Due Date & Overdue Tag */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className={`flex items-center space-x-1 font-semibold ${isItemOverdue ? 'text-rose-400' : 'text-slate-300'}`}>
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{item.due_date}</span>
                          </div>
                          {isItemOverdue && (
                            <span className="text-[10px] text-rose-400 font-semibold block">
                              ⚠ OVERDUE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <StatusBadge status={item.priority} />
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
                            title="View Mandate Dossier"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canModify && item.status !== 'COMPLIANT' && (
                            <button
                              onClick={() => {
                                setVerificationTargetReq(item);
                                setIsVerificationModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition"
                              title="Verify Compliance Audit"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {canModify && (
                            <button
                              onClick={() => {
                                setSelectedForEdit(item);
                                setIsRequirementModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Edit Compliance Mandate"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Delete Mandate"
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
            onPageChange={(p) => fetchRequirements(p)}
          />
        </div>
      </div>

      {/* Requirement Create/Edit Modal */}
      <RequirementModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        initialData={selectedForEdit}
        onSuccess={() => {
          showToast(selectedForEdit ? 'Compliance mandate updated.' : 'New regulatory mandate issued.');
          fetchRequirements(currentPage);
        }}
      />

      {/* Verification Audit Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        requirement={verificationTargetReq}
        currentUserId={user?.id}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setVerificationTargetReq(null);
        }}
        onSuccess={() => {
          showToast('Compliance verification record logged successfully.');
          fetchRequirements(currentPage);
          if (selectedDetailId === verificationTargetReq?.id) {
            setSelectedDetailId(verificationTargetReq.id);
          }
        }}
      />

      {/* Requirement Detail Drawer */}
      <RequirementDetailDrawer
        requirementId={selectedDetailId}
        onClose={() => setSelectedDetailId(null)}
        canModify={canModify}
        canDelete={canDelete}
        canVerify={canModify}
        onEdit={(item) => {
          setSelectedForEdit(item);
          setIsRequirementModalOpen(true);
        }}
        onDelete={(item) => {
          setDeleteTarget(item);
        }}
        onVerify={(item) => {
          setVerificationTargetReq(item);
          setIsVerificationModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Compliance Mandate"
        message={`Are you sure you want to delete ${deleteTarget?.requirement_code} (${deleteTarget?.title})? This will also remove any linked verification audit evidence. This action cannot be undone.`}
        confirmLabel="Delete Mandate"
        confirmVariant="danger"
        isLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
