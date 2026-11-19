import React, { useState, useEffect } from 'react';
import { X, Clock, AlertCircle, Calendar } from 'lucide-react';
import maintenanceApi from '../../api/maintenance';

export const MAINTENANCE_TYPE_CHOICES = [
  { value: 'PREVENTIVE', label: 'Preventive Maintenance' },
  { value: 'CORRECTIVE', label: 'Corrective Maintenance' },
  { value: 'INSPECTION', label: 'A/B/C/D Check Inspection' },
  { value: 'OVERHAUL', label: 'Major Component Overhaul' },
];

export const PRIORITY_CHOICES = [
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical / AOG (Aircraft on Ground)' },
];

export const SCHEDULE_STATUS_CHOICES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ScheduleModal({ isOpen, onClose, onSuccess, initialData = null, aircraftList = [], currentUserId = null }) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    aircraft: '',
    title: '',
    description: '',
    maintenance_type: 'PREVENTIVE',
    priority: 'MEDIUM',
    planned_date: '',
    due_date: '',
    status: 'PLANNED',
    assigned_to: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        aircraft: initialData.aircraft || '',
        title: initialData.title || '',
        description: initialData.description || '',
        maintenance_type: initialData.maintenance_type || 'PREVENTIVE',
        priority: initialData.priority || 'MEDIUM',
        planned_date: initialData.planned_date || '',
        due_date: initialData.due_date || '',
        status: initialData.status || 'PLANNED',
        assigned_to: initialData.assigned_to || '',
        notes: initialData.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        aircraft: '',
        title: '',
        description: '',
        maintenance_type: 'PREVENTIVE',
        priority: 'MEDIUM',
        planned_date: today,
        due_date: today,
        status: 'PLANNED',
        assigned_to: currentUserId || '',
        notes: '',
      });
    }
    setErrorMsg('');
    setFieldErrors({});
  }, [initialData, isOpen, currentUserId]);

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
    if (!formData.aircraft) errs.aircraft = 'Target aircraft is required.';
    if (!formData.title.trim()) errs.title = 'Schedule title is required.';
    if (!formData.planned_date) errs.planned_date = 'Planned start date is required.';
    if (!formData.due_date) errs.due_date = 'Due date is required.';
    if (formData.planned_date && formData.due_date && formData.due_date < formData.planned_date) {
      errs.due_date = 'Due date cannot precede planned start date.';
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
      aircraft: parseInt(formData.aircraft, 10),
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      title: formData.title.trim(),
    };

    try {
      if (isEdit) {
        await maintenanceApi.updateSchedule(initialData.id, payload);
      } else {
        await maintenanceApi.createSchedule(payload);
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
        setErrorMsg(err.message || 'Failed to save maintenance schedule.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? `Edit Maintenance Schedule — #${initialData.id}` : 'Plan Aircraft Maintenance Schedule'}
              </h2>
              <p className="text-xs text-slate-400">Scheduled Inspection Package & Task Allocation</p>
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
          {/* Aircraft & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Aircraft <span className="text-rose-400">*</span>
              </label>
              <select
                name="aircraft"
                value={formData.aircraft}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.aircraft ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              >
                <option value="">-- Select Airframe --</option>
                {aircraftList.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.registration_number} ({ac.model})
                  </option>
                ))}
              </select>
              {fieldErrors.aircraft && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.aircraft}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Schedule Summary Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 500-Hour Phase Inspection or A-Check Cycle"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.title ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.title}</p>
              )}
            </div>
          </div>

          {/* Maintenance Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Maintenance Type / Category <span className="text-rose-400">*</span>
              </label>
              <select
                name="maintenance_type"
                value={formData.maintenance_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {MAINTENANCE_TYPE_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Dispatch Level <span className="text-rose-400">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {PRIORITY_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Planned Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Planned Start Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="planned_date"
                value={formData.planned_date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.planned_date ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.planned_date && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.planned_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Hard Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.due_date ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.due_date && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.due_date}</p>
              )}
            </div>
          </div>

          {/* Status & Assigned Technician */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Schedule Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {SCHEDULE_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assigned Lead Technician ID <span className="text-slate-500 font-normal">(User ID)</span>
              </label>
              <input
                type="number"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                placeholder="e.g. 2 (or leave blank)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Package Scope & Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Airframe structural checks, powerplant borescope inspection, avionics firmware update..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              <span>{isEdit ? 'Update Schedule' : 'Schedule Maintenance'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
