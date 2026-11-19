import React, { useState, useEffect } from 'react';
import {
  X,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle2,
  FileCheck2,
  FileText,
  Plane,
  Edit2,
  Trash2,
  Plus,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import executionApi from '../../api/execution';

export default function ExecutionDetailDrawer({
  executionId,
  onClose,
  onEdit,
  onDelete,
  onAddDocument,
  canModify = false,
  canDelete = false,
  canManageDocs = false,
  onRecordUpdated,
}) {
  const [execution, setExecution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDetail = () => {
    if (!executionId) return;
    setLoading(true);
    setError(null);
    executionApi
      .getExecutionDetail(executionId)
      .then((data) => setExecution(data))
      .catch((err) => setError(err.message || 'Failed to load maintenance execution dossier.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [executionId]);

  if (!executionId) return null;

  // Direct Status Transition Action
  const handleStatusTransition = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const patchData = { status: newStatus };
      if (newStatus === 'IN_PROGRESS' && !execution.started_at) {
        patchData.started_at = new Date().toISOString();
      }
      if (newStatus === 'COMPLETED' && !execution.completed_at) {
        patchData.completed_at = new Date().toISOString();
      }
      const updated = await executionApi.patchExecutionRecord(execution.id, patchData);
      setExecution(updated);
      onRecordUpdated?.();
    } catch (err) {
      alert(`Status transition failed: ${err.message || 'Server error'}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  EXECUTION #{execution?.id || '...'}
                </span>
                {execution?.status && <StatusBadge status={execution.status} />}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                WO: {execution?.work_order_number || '...'} • Aircraft: {execution?.aircraft_registration || '...'}
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
              <LoadingSpinner message="Loading maintenance execution records..." />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          ) : execution ? (
            <>
              {/* Technician Quick Action Bar */}
              {canModify && execution.status !== 'COMPLETED' && execution.status !== 'CANCELLED' && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Execution Workflow Actions:
                  </span>
                  <div className="flex items-center flex-wrap gap-2">
                    {execution.status !== 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusTransition('IN_PROGRESS')}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    )}

                    {execution.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => handleStatusTransition('PAUSED')}
                        disabled={statusUpdating}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Hold / Pause Work</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusTransition('COMPLETED')}
                      disabled={statusUpdating}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>

                    <button
                      onClick={() => handleStatusTransition('CANCELLED')}
                      disabled={statusUpdating}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Core Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Aircraft Tail</span>
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <Plane className="w-3.5 h-3.5 text-blue-400" />
                    <span>{execution.aircraft_registration}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Lead Technician</span>
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{execution.executed_by_username}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Actual Labor</span>
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{execution.actual_labor_hours} hrs</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Work Order</span>
                  <span className="font-mono text-white font-semibold">
                    {execution.work_order_number}
                  </span>
                </div>
              </div>

              {/* Timing Overview */}
              <div className="p-3 bg-slate-800/20 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>
                    Started:{' '}
                    <strong className="text-slate-200">
                      {execution.started_at
                        ? new Date(execution.started_at).toLocaleString()
                        : 'Not recorded'}
                    </strong>
                  </span>
                </div>
                <div>
                  Completed:{' '}
                  <strong className="text-slate-200">
                    {execution.completed_at
                      ? new Date(execution.completed_at).toLocaleString()
                      : 'Pending'}
                  </strong>
                </div>
              </div>

              {/* Work Performed Narrative */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Wrench className="w-3.5 h-3.5 text-sky-400" />
                  <span>Work Accomplished (Technical Narrative)</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {execution.work_performed}
                </div>
              </div>

              {/* Findings & Discrepancies */}
              {execution.findings && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Observations & Discrepancies</span>
                  </h4>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 whitespace-pre-wrap leading-relaxed">
                    {execution.findings}
                  </div>
                </div>
              )}

              {/* Corrective Actions */}
              {execution.corrective_actions && (
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Corrective Actions Executed</span>
                  </h4>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-200/90 whitespace-pre-wrap leading-relaxed">
                    {execution.corrective_actions}
                  </div>
                </div>
              )}

              {/* Remarks & Handover Notes */}
              {execution.remarks && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Technician Remarks & Shift Notes</span>
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {execution.remarks}
                  </div>
                </div>
              )}

              {/* Technical Sign-Off Documentation & Release to Service */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Certificates of Release & Sign-Off Documentation</span>
                  </h4>

                  {canManageDocs && (
                    <button
                      onClick={() => onAddDocument?.(execution)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Issue Sign-Off</span>
                    </button>
                  )}
                </div>

                {execution.documentation_records && execution.documentation_records.length > 0 ? (
                  <div className="space-y-2">
                    {execution.documentation_records.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start justify-between text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-semibold text-white">
                              {doc.document_number}
                            </span>
                            <StatusBadge status={doc.sign_off_status} />
                          </div>
                          <p className="font-medium text-slate-200">{doc.title}</p>
                          <p className="text-[11px] text-slate-400">
                            Authority: <span className="text-slate-300">{doc.issuing_authority}</span>
                            {doc.signed_off_by_username && (
                              <span> • Certifier: {doc.signed_off_by_username}</span>
                            )}
                          </p>
                          {doc.document_reference && (
                            <div className="pt-1">
                              <a
                                href={doc.document_reference}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sky-400 hover:underline flex items-center space-x-1 text-[11px]"
                              >
                                <span>View Document Archive</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-800/20 border border-slate-800/60 text-slate-500 text-xs">
                    No release-to-service certificates or technical sign-offs attached yet.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer actions */}
        {execution && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            {canDelete && (
              <button
                onClick={() => onDelete?.(execution)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Log</span>
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              {canModify && (
                <button
                  onClick={() => onEdit?.(execution)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 transition shadow-md shadow-sky-500/20 flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Log</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
