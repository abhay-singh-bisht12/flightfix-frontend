import React, { useState, useEffect } from 'react';
import { X, ClipboardList, AlertCircle } from 'lucide-react';
import maintenanceApi from '../../api/maintenance';

export const TASK_STATUS_CHOICES = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'SKIPPED', label: 'Skipped' },
];

export default function TaskModal({ isOpen, onClose, onSuccess, initialData = null, defaultScheduleId = null, scheduleList = [] }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    schedule: '',
    task_name: '',
    description: '',
    task_order: 1,
    status: 'PENDING',
    estimated_hours: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        schedule: initialData.schedule || defaultScheduleId || '',
        task_name: initialData.task_name || '',
        description: initialData.description || '',
        task_order: initialData.task_order || 1,
        status: initialData.status || 'PENDING',
        estimated_hours: initialData.estimated_hours || '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        schedule: defaultScheduleId || '',
        task_name: '',
        description: '',
        task_order: 1,
        status: 'PENDING',
        estimated_hours: '',
        notes: '',
      });
    }
    setErrorMsg('');
    setFieldErrors({});
  }, [initialData, isOpen, defaultScheduleId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.schedule) errs.schedule = 'Maintenance schedule is required.';
    if (!formData.task_name.trim()) errs.task_name = 'Task name is required.';
    if (formData.task_order < 1) errs.task_order = 'Task order sequence must be 1 or greater.';
    if (formData.estimated_hours && parseFloat(formData.estimated_hours) < 0) {
      errs.estimated_hours = 'Estimated hours cannot be negative.';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    const clientErrs = validate();
    if (Object.keys(clientErrs).length > 0) {
      setFieldErrors(clientErrs);
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      schedule: parseInt(formData.schedule, 10),
      task_order: parseInt(formData.task_order, 10) || 1,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      task_name: formData.task_name.trim(),
    };

    try {
      if (isEdit) {
        await maintenanceApi.updateTask(initialData.id, payload);
      } else {
        await maintenanceApi.createTask(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          setErrorMsg(data);
        } else if (data.detail) {
          setErrorMsg(data.detail);
        } else {
          const parsed = {};
          Object.keys(data).forEach((key) => {
            parsed[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
          });
          setFieldErrors(parsed);
          setErrorMsg('Please review and correct the errors below.');
        }
      } else {
        setErrorMsg(err.message || 'Failed to save maintenance task.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? `Edit Task — #${initialData.id}` : 'Create Maintenance Task Step'}
              </h2>
              <p className="text-xs text-slate-400">Inspection Check & Work Step Allocation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Schedule */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assigned Maintenance Schedule <span className="text-rose-400">*</span>
            </label>
            <select
              name="schedule"
              value={formData.schedule}
              onChange={handleChange}
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                fieldErrors.schedule ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
              } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={loading || Boolean(defaultScheduleId && !isEdit)}
            >
              <option value="">-- Select Schedule --</option>
              {scheduleList.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} - {s.title} ({s.aircraft_registration})
                </option>
              ))}
            </select>
            {fieldErrors.schedule && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.schedule}</p>
            )}
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Step Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="task_name"
              value={formData.task_name}
              onChange={handleChange}
              placeholder="e.g. Inspect hydraulic lines for wear or pressure leakage"
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                fieldErrors.task_name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
              } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={loading}
            />
            {fieldErrors.task_name && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.task_name}</p>
            )}
          </div>

          {/* Sequence Order, Estimated Hours & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Task Order # <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                name="task_order"
                min="1"
                value={formData.task_order}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Est. Hours <span className="text-slate-500 font-normal">(Labor)</span>
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="e.g. 2.5"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Execution Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                disabled={loading}
              >
                {TASK_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Task Procedure / Technical Notes
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Refer to AMM Chapter 29-10-00, verify PSI gauge pressure..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              disabled={loading}
            />
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-colors disabled:opacity-50"
            >
              {loading && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />}
              <span>{isEdit ? 'Update Task' : 'Add Task Step'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
