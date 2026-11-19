import React, { useState, useEffect } from 'react';
import { X, Activity, AlertCircle, Sparkles } from 'lucide-react';
import workOrdersApi from '../../api/workOrders';

export const WORK_ORDER_TYPE_CHOICES = [
  { value: 'CORRECTIVE', label: 'Corrective Maintenance' },
  { value: 'PREVENTIVE', label: 'Preventive Maintenance' },
  { value: 'INSPECTION', label: 'Phase / Check Inspection' },
  { value: 'EMERGENCY', label: 'Emergency / AOG Unscheduled' },
];

export const WORK_ORDER_PRIORITY_CHOICES = [
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical / AOG Priority' },
];

export const WORK_ORDER_STATUS_CHOICES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function WorkOrderModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  aircraftList = [],
  scheduleList = [],
  currentUserId = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    work_order_number: '',
    aircraft: '',
    maintenance_schedule: '',
    title: '',
    description: '',
    work_order_type: 'CORRECTIVE',
    priority: 'MEDIUM',
    status: 'OPEN',
    assigned_to: '',
    planned_start_date: '',
    planned_completion_date: '',
    actual_start_date: '',
    actual_completion_date: '',
    estimated_hours: '',
    actual_hours: '',
    findings: '',
    corrective_action: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        work_order_number: initialData.work_order_number || '',
        aircraft: initialData.aircraft || '',
        maintenance_schedule: initialData.maintenance_schedule || '',
        title: initialData.title || '',
        description: initialData.description || '',
        work_order_type: initialData.work_order_type || 'CORRECTIVE',
        priority: initialData.priority || 'MEDIUM',
        status: initialData.status || 'OPEN',
        assigned_to: initialData.assigned_to || '',
        planned_start_date: initialData.planned_start_date || '',
        planned_completion_date: initialData.planned_completion_date || '',
        actual_start_date: initialData.actual_start_date || '',
        actual_completion_date: initialData.actual_completion_date || '',
        estimated_hours: initialData.estimated_hours || '',
        actual_hours: initialData.actual_hours || '',
        findings: initialData.findings || '',
        corrective_action: initialData.corrective_action || '',
        notes: initialData.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      setFormData({
        work_order_number: `WO-${new Date().getFullYear()}-${randomSeq}`,
        aircraft: '',
        maintenance_schedule: '',
        title: '',
        description: '',
        work_order_type: 'CORRECTIVE',
        priority: 'MEDIUM',
        status: 'OPEN',
        assigned_to: currentUserId || '',
        planned_start_date: today,
        planned_completion_date: today,
        actual_start_date: '',
        actual_completion_date: '',
        estimated_hours: '',
        actual_hours: '',
        findings: '',
        corrective_action: '',
        notes: '',
      });
    }
    setErrorMsg('');
    setFieldErrors({});
  }, [initialData, isOpen, currentUserId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'work_order_number' ? value.toUpperCase() : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const generateWONumber = () => {
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, work_order_number: `WO-${new Date().getFullYear()}-${randomSeq}` }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.work_order_number.trim()) errs.work_order_number = 'Work order number is required.';
    if (!formData.aircraft) errs.aircraft = 'Target aircraft is required.';
    if (!formData.title.trim()) errs.title = 'Title summary is required.';
    if (!formData.description.trim()) errs.description = 'Work order description is required.';
    if (formData.planned_start_date && formData.planned_completion_date) {
      if (formData.planned_completion_date < formData.planned_start_date) {
        errs.planned_completion_date = 'Planned completion date cannot precede planned start date.';
      }
    }
    if (formData.actual_start_date && formData.actual_completion_date) {
      if (formData.actual_completion_date < formData.actual_start_date) {
        errs.actual_completion_date = 'Actual completion date cannot precede actual start date.';
      }
    }
    if (formData.estimated_hours && parseFloat(formData.estimated_hours) < 0) {
      errs.estimated_hours = 'Estimated hours cannot be negative.';
    }
    if (formData.actual_hours && parseFloat(formData.actual_hours) < 0) {
      errs.actual_hours = 'Actual hours cannot be negative.';
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
      work_order_number: formData.work_order_number.trim().toUpperCase(),
      aircraft: parseInt(formData.aircraft, 10),
      maintenance_schedule: formData.maintenance_schedule ? parseInt(formData.maintenance_schedule, 10) : null,
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to, 10) : null,
      planned_start_date: formData.planned_start_date || null,
      planned_completion_date: formData.planned_completion_date || null,
      actual_start_date: formData.actual_start_date || null,
      actual_completion_date: formData.actual_completion_date || null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
      actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : null,
      title: formData.title.trim(),
      description: formData.description.trim(),
    };

    try {
      if (isEdit) {
        await workOrdersApi.updateWorkOrder(initialData.id, payload);
      } else {
        await workOrdersApi.createWorkOrder(payload);
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
        setErrorMsg(err.message || 'Failed to save work order.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-3xl my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? `Edit Work Order — ${initialData.work_order_number}` : 'Issue New Work Order'}
              </h2>
              <p className="text-xs text-slate-400">Maintenance Dispatch, Task Allocation & Line Card</p>
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
          {/* Work Order Number & Aircraft */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Work Order Number <span className="text-rose-400">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={generateWONumber}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Number</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="work_order_number"
                value={formData.work_order_number}
                onChange={handleChange}
                placeholder="e.g. WO-2026-0001"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.work_order_number ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm font-mono uppercase text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.work_order_number && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.work_order_number}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Aircraft Airframe <span className="text-rose-400">*</span>
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
                <option value="">-- Select Target Aircraft --</option>
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
          </div>

          {/* Title & Linked Maintenance Schedule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Order Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Replace Nose Landing Gear Hydraulic Actuator"
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.title ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Linked Schedule <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                name="maintenance_schedule"
                value={formData.maintenance_schedule}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">-- Standalone Work Order --</option>
                {scheduleList.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    #{sc.id} - {sc.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Order Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="work_order_type"
                value={formData.work_order_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {WORK_ORDER_TYPE_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Priority Dispatch <span className="text-rose-400">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {WORK_ORDER_PRIORITY_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lifecycle Status <span className="text-rose-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              >
                {WORK_ORDER_STATUS_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Planned Dates & Estimated Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Planned Start Date
              </label>
              <input
                type="date"
                name="planned_start_date"
                value={formData.planned_start_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Planned Completion Date
              </label>
              <input
                type="date"
                name="planned_completion_date"
                value={formData.planned_completion_date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.planned_completion_date ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.planned_completion_date && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.planned_completion_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estimated Labor Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                placeholder="e.g. 4.0"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Actual Execution Dates & Hours (For active or completed orders) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Actual Start Date <span className="text-slate-500 font-normal">(Execution)</span>
              </label>
              <input
                type="date"
                name="actual_start_date"
                value={formData.actual_start_date}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Actual Completion Date
              </label>
              <input
                type="date"
                name="actual_completion_date"
                value={formData.actual_completion_date}
                onChange={handleChange}
                className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                  fieldErrors.actual_completion_date ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                } text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loading}
              />
              {fieldErrors.actual_completion_date && (
                <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.actual_completion_date}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Actual Labor Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                name="actual_hours"
                value={formData.actual_hours}
                onChange={handleChange}
                placeholder="e.g. 3.5"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Assigned Technician ID */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assigned Field Technician ID <span className="text-slate-500 font-normal">(User ID)</span>
            </label>
            <input
              type="number"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={handleChange}
              placeholder="e.g. 2 (or leave unassigned)"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Instructions & Detailed Scope <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Refer to AMM chapter, inspect lines, flush fluid, torque bolts to spec..."
              className={`w-full px-3.5 py-2 rounded-xl bg-slate-950 border ${
                fieldErrors.description ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
              } text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              disabled={loading}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-[11px] text-rose-400">{fieldErrors.description}</p>
            )}
          </div>

          {/* Findings & Corrective Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Defect Observations & Findings <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                name="findings"
                rows={2}
                value={formData.findings}
                onChange={handleChange}
                placeholder="Observed minor fluid seepage near B-nut connection..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corrective Action Taken <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                name="corrective_action"
                rows={2}
                value={formData.corrective_action}
                onChange={handleChange}
                placeholder="Replaced O-ring seal, torqued to 45 in-lbs, leak check satisfactory..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
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
              <span>{isEdit ? 'Update Work Order' : 'Issue Work Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
