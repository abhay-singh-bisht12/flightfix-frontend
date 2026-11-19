import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Plane,
  Calendar,
  AlertTriangle,
  User,
  Plus,
  CheckCircle2,
  ClipboardList,
  Edit2,
  Trash2,
  Layers,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import maintenanceApi from '../../api/maintenance';

export default function ScheduleDetailDrawer({
  scheduleId,
  onClose,
  onEdit,
  onAddTask,
  canModify = false,
  onTaskUpdated,
}) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchScheduleDetail = () => {
    if (!scheduleId) return;
    setLoading(true);
    setError(null);
    maintenanceApi
      .getScheduleDetail(scheduleId)
      .then((data) => setSchedule(data))
      .catch((err) => setError(err.message || 'Failed to load maintenance schedule.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchScheduleDetail();
  }, [scheduleId]);

  // Direct task quick status change handler
  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    const nextStatusMap = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING',
      SKIPPED: 'PENDING',
    };
    const nextStatus = nextStatusMap[currentStatus] || 'IN_PROGRESS';
    setUpdatingTaskId(taskId);
    try {
      await maintenanceApi.patchTask(taskId, { status: nextStatus });
      fetchScheduleDetail();
      onTaskUpdated?.();
    } catch (err) {
      alert(err.response?.data?.detail || err.message || 'Status update failed.');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (!scheduleId) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900/95 backdrop-blur z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                Maintenance Schedule Work Package #{scheduleId}
              </span>
              <h2 className="text-lg font-bold text-white">{schedule?.title || 'Loading...'}</h2>
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
            <LoadingSpinner size="lg" text="Retrieving schedule details and task steps..." />
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          ) : schedule ? (
            <>
              {/* Badges & Meta */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Target Airframe:</span>
                  <span className="font-mono font-bold text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20 flex items-center space-x-1">
                    <Plane className="w-3 h-3" />
                    <span>{schedule.aircraft_registration} ({schedule.aircraft_model})</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={schedule.status} label={schedule.status_display} />
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {schedule.priority_display || schedule.priority} Priority
                  </span>
                </div>
              </div>

              {/* Dates & Personnel */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Planned Start:</span>
                  <div className="text-sm font-semibold text-white mt-0.5">{schedule.planned_date}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Due Date:</span>
                  <div className="text-sm font-semibold text-amber-400 mt-0.5">{schedule.due_date}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Assigned Lead:</span>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {schedule.assigned_to_username ? `@${schedule.assigned_to_username}` : 'Unassigned'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400">Created By:</span>
                  <div className="text-sm font-semibold text-slate-400 mt-0.5">
                    @{schedule.created_by_username || 'system'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {schedule.description && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Scope of Work:</span>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {schedule.description}
                  </div>
                </div>
              )}

              {/* Nested Tasks Checklist Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                      <ClipboardList className="w-3.5 h-3.5 text-sky-400" />
                      <span>Task Execution Steps ({schedule.tasks?.length || 0})</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">Click a task badge to quick-toggle status</p>
                  </div>

                  {canModify && (
                    <button
                      onClick={() => onAddTask?.(schedule.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Step</span>
                    </button>
                  )}
                </div>

                {schedule.tasks && schedule.tasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {schedule.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs font-bold text-sky-400">Step #{task.task_order}</span>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-xs font-bold text-white">{task.task_name}</span>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-slate-400">{task.description}</p>
                          )}
                          <div className="text-[10px] text-slate-500">
                            {task.estimated_hours && `Labor: ${task.estimated_hours} hrs`}
                            {task.completed_at && ` • Completed: ${task.completed_at.slice(0, 10)}`}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <button
                            onClick={() => handleTaskStatusToggle(task.id, task.status)}
                            disabled={updatingTaskId === task.id}
                            title="Click to advance status"
                            className="cursor-pointer hover:scale-105 transition-transform"
                          >
                            <StatusBadge status={task.status} label={task.status_display} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-2">
                    <p>No individual task steps added to this maintenance schedule yet.</p>
                    {canModify && (
                      <button
                        onClick={() => onAddTask?.(schedule.id)}
                        className="inline-flex items-center space-x-1 text-blue-400 hover:underline font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add initial task step</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-900 sticky bottom-0 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close Package
          </button>
          {canModify && schedule && (
            <button
              onClick={() => {
                onClose();
                onEdit?.(schedule);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-colors"
            >
              Edit Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
