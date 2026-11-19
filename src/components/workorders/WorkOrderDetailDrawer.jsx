import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Plane,
  Clock,
  Calendar,
  AlertTriangle,
  User,
  CheckCircle2,
  FileText,
  Wrench,
  PauseCircle,
  PlayCircle,
  XCircle,
  Layers
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import workOrdersApi from '../../api/workOrders';

export default function WorkOrderDetailDrawer({
  workOrderId,
  onClose,
  onEdit,
  canModify = false,
  canUpdateStatus = false,
  onStatusUpdated,
}) {
  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDetail = () => {
    if (!workOrderId) return;
    setLoading(true);
    setError(null);
    workOrdersApi
      .getWorkOrderDetail(workOrderId)
      .then((data) => setWorkOrder(data))
      .catch((err) => setError(err.message || 'Failed to load work order dossier.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [workOrderId]);

  // Handle direct lifecycle status transition
  const handleStatusTransition = async (newStatus) => {
    if (!workOrder) return;
    setStatusUpdating(true);
    try {
      const payload = { status: newStatus };
      const today = new Date().toISOString().split('T')[0];

      // Auto-set actual start date when moved to IN_PROGRESS if not already set
      if (newStatus === 'IN_PROGRESS' && !workOrder.actual_start_date) {
        payload.actual_start_date = today;
      }
      // Auto-set actual completion date when moved to COMPLETED
      if (newStatus === 'COMPLETED' && !workOrder.actual_completion_date) {
        payload.actual_completion_date = today;
      }

      await workOrdersApi.patchWorkOrder(workOrder.id, payload);
      fetchDetail();
      onStatusUpdated?.();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Failed to update work order status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!workOrderId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-violet-400 tracking-wider">
                Work Order Line Card #{workOrderId}
              </span>
              <h2 className="text-xl font-bold text-white font-mono">{workOrder?.work_order_number || 'Loading...'}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 space-y-6">
          {loading ? (
            <LoadingSpinner size="lg" text="Retrieving work order line card..." />
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          ) : workOrder ? (
            <>
              {/* Badges & Summary */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Target Airframe:</span>
                  <span className="font-mono font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20 flex items-center space-x-1">
                    <Plane className="w-3 h-3" />
                    <span>{workOrder.aircraft_registration} ({workOrder.aircraft_model})</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={workOrder.status} label={workOrder.status_display} />
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    workOrder.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                    workOrder.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {workOrder.priority_display || workOrder.priority} Priority
                  </span>
                </div>
              </div>

              {/* Title & Classification */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {workOrder.work_order_type_display || workOrder.work_order_type}
                </span>
                <h3 className="text-lg font-bold text-white">{workOrder.title}</h3>
                {workOrder.maintenance_schedule_title && (
                  <p className="text-xs text-indigo-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Linked Schedule: {workOrder.maintenance_schedule_title}</span>
                  </p>
                )}
              </div>

              {/* Work Instructions Scope */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Work Instructions & Scope:</span>
                </span>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {workOrder.description}
                </div>
              </div>

              {/* Timeline Dates & Hours Comparison */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Planned Dates:</span>
                  <div className="text-xs font-semibold text-white mt-1 font-mono">
                    {workOrder.planned_start_date || '--'} &rarr; {workOrder.planned_completion_date || '--'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Actual Dates:</span>
                  <div className="text-xs font-semibold text-emerald-400 mt-1 font-mono">
                    {workOrder.actual_start_date || '--'} &rarr; {workOrder.actual_completion_date || '--'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Labor Hours:</span>
                  <div className="text-xs font-semibold text-slate-200 mt-1 font-mono">
                    Est: <strong className="text-blue-400">{workOrder.estimated_hours || 0}h</strong> | Act:{' '}
                    <strong className="text-emerald-400">{workOrder.actual_hours || 0}h</strong>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Technician Lead:</span>
                  <div className="text-xs font-semibold text-slate-200 mt-1">
                    {workOrder.assigned_to_username ? `@${workOrder.assigned_to_username}` : 'Unassigned'}
                  </div>
                </div>
              </div>

              {/* Findings & Corrective Action */}
              {(workOrder.findings || workOrder.corrective_action) && (
                <div className="space-y-3">
                  {workOrder.findings && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                        Technical Observations & Findings:
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 text-xs text-amber-200 leading-relaxed whitespace-pre-wrap">
                        {workOrder.findings}
                      </div>
                    </div>
                  )}

                  {workOrder.corrective_action && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        Corrective Action Applied:
                      </span>
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed whitespace-pre-wrap">
                        {workOrder.corrective_action}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Progression Workflow Actions */}
              {(canModify || canUpdateStatus) && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Lifecycle Status Progression Workflow
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {workOrder.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition('ASSIGNED')}
                          disabled={statusUpdating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Assign Technician</span>
                        </button>
                        <button
                          onClick={() => handleStatusTransition('IN_PROGRESS')}
                          disabled={statusUpdating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Start Work Now</span>
                        </button>
                      </>
                    )}

                    {workOrder.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStatusTransition('IN_PROGRESS')}
                        disabled={statusUpdating}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Start Work (In Progress)</span>
                      </button>
                    )}

                    {workOrder.status === 'IN_PROGRESS' && (
                      <>
                        <button
                          onClick={() => handleStatusTransition('COMPLETED')}
                          disabled={statusUpdating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Sign Off & Complete</span>
                        </button>
                        <button
                          onClick={() => handleStatusTransition('ON_HOLD')}
                          disabled={statusUpdating}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <PauseCircle className="w-3.5 h-3.5" />
                          <span>Place On Hold</span>
                        </button>
                      </>
                    )}

                    {workOrder.status === 'ON_HOLD' && (
                      <button
                        onClick={() => handleStatusTransition('IN_PROGRESS')}
                        disabled={statusUpdating}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume Work</span>
                      </button>
                    )}

                    {['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'].includes(workOrder.status) && canModify && (
                      <button
                        onClick={() => handleStatusTransition('CANCELLED')}
                        disabled={statusUpdating}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold border border-rose-500/30 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
          {canModify && workOrder && (
            <button
              onClick={() => {
                onClose();
                onEdit?.(workOrder);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
            >
              Edit Work Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
