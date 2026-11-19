import React, { useState, useEffect } from 'react';
import { X, Wrench, AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import executionApi from '../../api/execution';
import workOrdersApi from '../../api/workOrders';

export const EXECUTION_STATUS_CHOICES = [
  { value: 'PENDING', label: 'Pending Start' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PAUSED', label: 'Paused / Awaiting Parts' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ExecutionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  currentUserId = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    work_order: '',
    maintenance_task: '',
    status: 'IN_PROGRESS',
    started_at: '',
    completed_at: '',
    actual_labor_hours: '0.00',
    work_performed: '',
    findings: '',
    corrective_actions: '',
    remarks: '',
  });

  const [workOrdersList, setWorkOrdersList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Preload Work Orders for dropdown
  useEffect(() => {
    if (isOpen) {
      setLoadingOptions(true);
      workOrdersApi
        .getWorkOrders({ page_size: 100 })
        .then((res) => {
          if (res.results) setWorkOrdersList(res.results);
        })
        .catch(() => {})
        .finally(() => setLoadingOptions(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        work_order: initialData.work_order || '',
        maintenance_task: initialData.maintenance_task || '',
        status: initialData.status || 'IN_PROGRESS',
        started_at: initialData.started_at ? initialData.started_at.slice(0, 16) : '',
        completed_at: initialData.completed_at ? initialData.completed_at.slice(0, 16) : '',
        actual_labor_hours: initialData.actual_labor_hours || '0.00',
        work_performed: initialData.work_performed || '',
        findings: initialData.findings || '',
        corrective_actions: initialData.corrective_actions || '',
        remarks: initialData.remarks || '',
      });
    } else {
      const nowIso = new Date().toISOString().slice(0, 16);
      setFormData({
        work_order: '',
        maintenance_task: '',
        status: 'IN_PROGRESS',
        started_at: nowIso,
        completed_at: '',
        actual_labor_hours: '0.00',
        work_performed: '',
        findings: '',
        corrective_actions: '',
        remarks: '',
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.work_order) {
      newErrors.work_order = 'Governing Work Order is required';
    }
    if (!formData.work_performed.trim()) {
      newErrors.work_performed = 'Technical narrative of work performed is required';
    }
    if (parseFloat(formData.actual_labor_hours) < 0 || isNaN(parseFloat(formData.actual_labor_hours))) {
      newErrors.actual_labor_hours = 'Actual labor hours must be a valid non-negative number';
    }
    if (formData.started_at && formData.completed_at && formData.completed_at < formData.started_at) {
      newErrors.completed_at = 'Completion timestamp cannot precede start timestamp';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    const payload = {
      work_order: Number(formData.work_order),
      executed_by: currentUserId,
      maintenance_task: formData.maintenance_task ? Number(formData.maintenance_task) : null,
      status: formData.status,
      started_at: formData.started_at ? new Date(formData.started_at).toISOString() : null,
      completed_at: formData.completed_at ? new Date(formData.completed_at).toISOString() : null,
      actual_labor_hours: parseFloat(formData.actual_labor_hours).toFixed(2),
      work_performed: formData.work_performed.trim(),
      findings: formData.findings.trim(),
      corrective_actions: formData.corrective_actions.trim(),
      remarks: formData.remarks.trim(),
    };

    try {
      if (isEdit) {
        await executionApi.updateExecutionRecord(initialData.id, payload);
      } else {
        await executionApi.createExecutionRecord(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const fieldErrors = {};
        let generalMsg = '';
        Object.entries(data).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(' ') : String(val);
          if (key in formData) {
            fieldErrors[key] = message;
          } else {
            generalMsg += `${key}: ${message} `;
          }
        });
        setErrors(fieldErrors);
        setServerError(generalMsg || 'Please review the highlighted fields.');
      } else {
        setServerError(err.message || 'Failed to save maintenance execution log.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? 'Update Maintenance Execution Log' : 'Log Maintenance Execution'}
              </h2>
              <p className="text-xs text-slate-400">
                Record technician actions, labor hours, findings, and corrective measures
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

        {/* Server error */}
        {serverError && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Work Order & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Governing Work Order <span className="text-rose-400">*</span>
              </label>
              <select
                name="work_order"
                value={formData.work_order}
                onChange={handleChange}
                disabled={isEdit}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.work_order ? 'border-rose-500' : 'border-slate-700'
                }`}
              >
                <option value="">Select Work Order...</option>
                {workOrdersList.map((wo) => (
                  <option key={wo.id} value={wo.id}>
                    {wo.work_order_number} — {wo.title}
                  </option>
                ))}
              </select>
              {errors.work_order && <p className="text-xs text-rose-400 mt-1">{errors.work_order}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Execution Status <span className="text-rose-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {EXECUTION_STATUS_CHOICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timestamps & Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Started At Timestamp
              </label>
              <input
                type="datetime-local"
                name="started_at"
                value={formData.started_at}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Completed At Timestamp
              </label>
              <input
                type="datetime-local"
                name="completed_at"
                value={formData.completed_at}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.completed_at ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.completed_at && <p className="text-xs text-rose-400 mt-1">{errors.completed_at}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Actual Labor Hours
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                name="actual_labor_hours"
                value={formData.actual_labor_hours}
                onChange={handleChange}
                placeholder="0.00"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.actual_labor_hours ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.actual_labor_hours && <p className="text-xs text-rose-400 mt-1">{errors.actual_labor_hours}</p>}
            </div>
          </div>

          {/* Work Performed Narrative */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Work Performed (Technical Log) <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="work_performed"
              rows="3"
              value={formData.work_performed}
              onChange={handleChange}
              placeholder="Detailed description of disassembly, component replacement, torquing, tests, and restoration..."
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.work_performed ? 'border-rose-500' : 'border-slate-700'
              }`}
            ></textarea>
            {errors.work_performed && <p className="text-xs text-rose-400 mt-1">{errors.work_performed}</p>}
          </div>

          {/* Findings & Discrepancies */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Inspection Findings & Discrepancies
            </label>
            <textarea
              name="findings"
              rows="2"
              value={formData.findings}
              onChange={handleChange}
              placeholder="Observed wear, corrosion, leaks, or defects encountered during maintenance..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          {/* Corrective Actions */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Corrective Actions Taken
            </label>
            <textarea
              name="corrective_actions"
              rows="2"
              value={formData.corrective_actions}
              onChange={handleChange}
              placeholder="Specific engineering steps taken to rectify observed discrepancies..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          {/* Handover Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Technician Remarks / Shift Handover Notes
            </label>
            <textarea
              name="remarks"
              rows="2"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Tool calibration serial numbers, safety warnings, or follow-up suggestions..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-sky-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Log Execution'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
