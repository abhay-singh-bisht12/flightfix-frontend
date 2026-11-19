import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  ClipboardList,
  Search,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Plane,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';
import ScheduleModal, {
  MAINTENANCE_TYPE_CHOICES,
  PRIORITY_CHOICES,
  SCHEDULE_STATUS_CHOICES
} from '../components/maintenance/ScheduleModal';
import TaskModal, { TASK_STATUS_CHOICES } from '../components/maintenance/TaskModal';
import ScheduleDetailDrawer from '../components/maintenance/ScheduleDetailDrawer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth, ROLES } from '../context/AuthContext';
import maintenanceApi from '../api/maintenance';
import aircraftApi from '../api/aircraft';

export default function MaintenancePage() {
  const { user, role, hasRole, hasAnyRole } = useAuth();

  // Role permissions
  const canModify = hasAnyRole([ROLES.ADMIN, ROLES.SAFETY_OFFICER]);
  const canDelete = hasRole(ROLES.ADMIN);

  // Tab: 'schedules' | 'tasks'
  const [activeTab, setActiveTab] = useState('schedules');

  // --- Schedules State ---
  const [scheduleList, setScheduleList] = useState([]);
  const [scheduleCount, setScheduleCount] = useState(0);
  const [schedulePage, setSchedulePage] = useState(1);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);

  // Schedule Filters
  const [scheduleSearch, setScheduleSearch] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('');
  const [schedulePriorityFilter, setSchedulePriorityFilter] = useState('');
  const [scheduleTypeFilter, setScheduleTypeFilter] = useState('');

  // Modals for Schedules
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState(null);
  const [selectedScheduleDetailId, setSelectedScheduleDetailId] = useState(null);

  // --- Tasks State ---
  const [taskList, setTaskList] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [taskPage, setTaskPage] = useState(1);
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskError, setTaskError] = useState(null);

  // Task Filters
  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState('');

  // Modals for Tasks
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [taskModalDefaultScheduleId, setTaskModalDefaultScheduleId] = useState(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'schedule'|'task', item: obj }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Cached aircraft list for modals
  const [aircraftOptions, setAircraftOptions] = useState([]);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Pre-load aircraft options for schedule modal dropdown
  useEffect(() => {
    aircraftApi.getAircraftList({ page_size: 100 }).then((res) => {
      if (res.results) setAircraftOptions(res.results);
    }).catch(() => {});
  }, []);

  // Fetch Schedules
  const fetchSchedules = useCallback(async (page = 1) => {
    setScheduleLoading(true);
    setScheduleError(null);
    try {
      const params = { page };
      if (scheduleSearch.trim()) params.search = scheduleSearch.trim();
      if (scheduleStatusFilter) params.status = scheduleStatusFilter;
      if (schedulePriorityFilter) params.priority = schedulePriorityFilter;
      if (scheduleTypeFilter) params.maintenance_type = scheduleTypeFilter;

      const data = await maintenanceApi.getSchedules(params);
      setScheduleList(data.results || []);
      setScheduleCount(data.count || 0);
      setSchedulePage(page);
    } catch (err) {
      console.error('Fetch Schedules Error:', err);
      setScheduleError(err.message || 'Unable to load maintenance schedules.');
    } finally {
      setScheduleLoading(false);
    }
  }, [scheduleSearch, scheduleStatusFilter, schedulePriorityFilter, scheduleTypeFilter]);

  // Fetch Tasks
  const fetchTasks = useCallback(async (page = 1) => {
    setTaskLoading(true);
    setTaskError(null);
    try {
      const params = { page };
      if (taskSearch.trim()) params.search = taskSearch.trim();
      if (taskStatusFilter) params.status = taskStatusFilter;

      const data = await maintenanceApi.getTasks(params);
      setTaskList(data.results || []);
      setTaskCount(data.count || 0);
      setTaskPage(page);
    } catch (err) {
      console.error('Fetch Tasks Error:', err);
      setTaskError(err.message || 'Unable to load maintenance tasks.');
    } finally {
      setTaskLoading(false);
    }
  }, [taskSearch, taskStatusFilter]);

  useEffect(() => {
    if (activeTab === 'schedules') {
      fetchSchedules(1);
    } else {
      fetchTasks(1);
    }
  }, [activeTab, fetchSchedules, fetchTasks]);

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.type === 'schedule') {
        await maintenanceApi.deleteSchedule(deleteTarget.item.id);
        showToast(`Schedule #${deleteTarget.item.id} deleted successfully.`);
        fetchSchedules(schedulePage);
      } else {
        await maintenanceApi.deleteTask(deleteTarget.item.id);
        showToast(`Task #${deleteTarget.item.id} deleted successfully.`);
        fetchTasks(taskPage);
      }
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

      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Maintenance Planning & Scheduling</h1>
              <p className="text-xs text-slate-400">
                Scheduled inspection packages, A/B/C/D check cycles, and task dispatching
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & New Record Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'schedules'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Schedules ({scheduleCount})</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Task Steps ({taskCount})</span>
            </button>
          </div>

          {canModify && (
            <button
              onClick={() => {
                if (activeTab === 'schedules') {
                  setSelectedScheduleForEdit(null);
                  setIsScheduleModalOpen(true);
                } else {
                  setSelectedTaskForEdit(null);
                  setTaskModalDefaultScheduleId(null);
                  setIsTaskModalOpen(true);
                }
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'schedules' ? 'Plan Schedule' : 'Create Task'}</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: MAINTENANCE SCHEDULES */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={scheduleSearch}
                onChange={(e) => setScheduleSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchSchedules(1)}
                placeholder="Search schedule title, tail #, technician..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <select
                value={scheduleTypeFilter}
                onChange={(e) => setScheduleTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Maintenance Types</option>
                {MAINTENANCE_TYPE_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={schedulePriorityFilter}
                onChange={(e) => setSchedulePriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Priorities</option>
                {PRIORITY_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={scheduleStatusFilter}
                onChange={(e) => setScheduleStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {SCHEDULE_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchSchedules(1)}
                disabled={scheduleLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh Schedules"
              >
                <RefreshCw className={`w-4 h-4 ${scheduleLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Schedules Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            {scheduleLoading ? (
              <LoadingSpinner size="lg" text="Loading maintenance schedules..." />
            ) : scheduleError ? (
              <div className="p-8 text-center text-xs text-rose-400">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
                <span>{scheduleError}</span>
              </div>
            ) : scheduleList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Schedule Title</th>
                      <th className="px-6 py-4 font-semibold">Aircraft</th>
                      <th className="px-6 py-4 font-semibold">Type</th>
                      <th className="px-6 py-4 font-semibold">Priority</th>
                      <th className="px-6 py-4 font-semibold">Planned & Due</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Tasks</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {scheduleList.map((sc) => (
                      <tr key={sc.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-sm">{sc.title}</div>
                          <span className="text-[11px] text-slate-400 font-mono">ID #{sc.id} &bull; Lead: {sc.assigned_to_username ? `@${sc.assigned_to_username}` : 'Unassigned'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center space-x-1 font-mono text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                            <Plane className="w-3 h-3" />
                            <span>{sc.aircraft_registration}</span>
                          </span>
                          <div className="text-[11px] text-slate-400 mt-0.5">{sc.aircraft_model}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {sc.maintenance_type_display || sc.maintenance_type}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            sc.priority === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            sc.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {sc.priority_display || sc.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-white font-mono">{sc.planned_date}</div>
                          <span className="text-[11px] text-amber-400 font-mono">Due: {sc.due_date}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={sc.status} label={sc.status_display} />
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-sky-400">
                          {sc.tasks_count || 0} Steps
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setSelectedScheduleDetailId(sc.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="View Work Package & Tasks"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canModify && (
                              <button
                                onClick={() => {
                                  setSelectedScheduleForEdit(sc);
                                  setIsScheduleModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                                title="Edit Maintenance Schedule"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteTarget({ type: 'schedule', item: sc })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 transition-colors"
                                title="Delete Maintenance Schedule"
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
                <Clock className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <h3 className="text-sm font-semibold text-slate-300">No Maintenance Schedules Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {scheduleSearch || scheduleStatusFilter || schedulePriorityFilter || scheduleTypeFilter
                    ? 'No schedules match the selected filters.'
                    : 'No maintenance schedules have been planned yet.'}
                </p>
                {canModify && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedScheduleForEdit(null);
                        setIsScheduleModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Plan First Schedule</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <Pagination
              count={scheduleCount}
              page={schedulePage}
              pageSize={10}
              onPageChange={(p) => fetchSchedules(p)}
              loading={scheduleLoading}
            />
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Task Filters */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:max-w-md relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTasks(1)}
                placeholder="Search task step name, schedule title, tail #..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="">All Task Statuses</option>
                {TASK_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => fetchTasks(1)}
                disabled={taskLoading}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Refresh Tasks"
              >
                <RefreshCw className={`w-4 h-4 ${taskLoading ? 'animate-spin text-blue-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            {taskLoading ? (
              <LoadingSpinner size="lg" text="Loading maintenance task steps..." />
            ) : taskError ? (
              <div className="p-8 text-center text-xs text-rose-400">
                <AlertCircle className="w-8 h-8 mx-auto text-rose-400 mb-2" />
                <span>{taskError}</span>
              </div>
            ) : taskList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Order</th>
                      <th className="px-6 py-4 font-semibold">Task Step Description</th>
                      <th className="px-6 py-4 font-semibold">Parent Schedule</th>
                      <th className="px-6 py-4 font-semibold">Aircraft</th>
                      <th className="px-6 py-4 font-semibold">Est. Hours</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {taskList.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-sky-400">
                          #{task.task_order}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-white">{task.task_name}</div>
                          {task.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-300">
                          {task.schedule_title || `#${task.schedule}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-blue-400 font-bold">
                            {task.aircraft_registration || '--'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">
                          {task.estimated_hours ? `${task.estimated_hours} hrs` : '--'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={task.status} label={task.status_display} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {canModify && (
                              <button
                                onClick={() => {
                                  setSelectedTaskForEdit(task);
                                  setTaskModalDefaultScheduleId(task.schedule);
                                  setIsTaskModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
                                title="Edit Task Record"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => setDeleteTarget({ type: 'task', item: task })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-400 transition-colors"
                                title="Delete Task Record"
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
                <ClipboardList className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <h3 className="text-sm font-semibold text-slate-300">No Task Steps Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {taskSearch || taskStatusFilter
                    ? 'No tasks match the selected search criteria.'
                    : 'No maintenance task steps created yet.'}
                </p>
                {canModify && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setSelectedTaskForEdit(null);
                        setTaskModalDefaultScheduleId(null);
                        setIsTaskModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Task Step</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <Pagination
              count={taskCount}
              page={taskPage}
              pageSize={10}
              onPageChange={(p) => fetchTasks(p)}
              loading={taskLoading}
            />
          </div>
        </div>
      )}

      {/* Schedule Create / Edit Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        initialData={selectedScheduleForEdit}
        aircraftList={aircraftOptions}
        currentUserId={user?.id}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedScheduleForEdit(null);
        }}
        onSuccess={() => {
          showToast(selectedScheduleForEdit ? 'Schedule updated successfully.' : 'New schedule planned.');
          fetchSchedules(schedulePage);
        }}
      />

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        initialData={selectedTaskForEdit}
        defaultScheduleId={taskModalDefaultScheduleId}
        scheduleList={scheduleList}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTaskForEdit(null);
          setTaskModalDefaultScheduleId(null);
        }}
        onSuccess={() => {
          showToast(selectedTaskForEdit ? 'Task updated successfully.' : 'New task step created.');
          fetchTasks(taskPage);
          if (activeTab === 'schedules') fetchSchedules(schedulePage);
        }}
      />

      {/* Schedule Detail Drawer */}
      <ScheduleDetailDrawer
        scheduleId={selectedScheduleDetailId}
        onClose={() => setSelectedScheduleDetailId(null)}
        canModify={canModify}
        onEdit={(sc) => {
          setSelectedScheduleForEdit(sc);
          setIsScheduleModalOpen(true);
        }}
        onAddTask={(schedId) => {
          setSelectedTaskForEdit(null);
          setTaskModalDefaultScheduleId(schedId);
          setIsTaskModalOpen(true);
        }}
        onTaskUpdated={() => {
          fetchSchedules(schedulePage);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title={deleteTarget?.type === 'schedule' ? 'Delete Maintenance Schedule' : 'Delete Task Step'}
        message={
          deleteTarget?.type === 'schedule'
            ? `Are you sure you want to permanently delete schedule #${deleteTarget?.item.id} (${deleteTarget?.item.title})? All nested task steps will also be deleted.`
            : `Are you sure you want to delete task #${deleteTarget?.item.id} (${deleteTarget?.item.task_name})?`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
