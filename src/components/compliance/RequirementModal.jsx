import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, Plane, Calendar } from 'lucide-react';
import complianceApi from '../../api/compliance';
import aircraftApi from '../../api/aircraft';

export const REGULATION_TYPE_CHOICES = [
  { value: 'AIRWORTHINESS_DIRECTIVE', label: 'Airworthiness Directive (AD)' },
  { value: 'SERVICE_BULLETIN', label: 'Service Bulletin (SB)' },
  { value: 'INSPECTION_REQUIREMENT', label: 'Inspection Requirement' },
  { value: 'SAFETY_REQUIREMENT', label: 'Safety Requirement' },
  { value: 'INTERNAL_POLICY', label: 'Internal Airline Policy' },
  { value: 'OTHER', label: 'Other Regulatory Mandate' },
];

export const REQUIREMENT_PRIORITY_CHOICES = [
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical / Immediate Grounding' },
];

export const REQUIREMENT_STATUS_CHOICES = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLIANT', label: 'Compliant' },
  { value: 'NON_COMPLIANT', label: 'Non-Compliant' },
  { value: 'EXPIRED', label: 'Expired' },
];

export default function RequirementModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    requirement_code: '',
    title: '',
    description: '',
    regulation_type: 'AIRWORTHINESS_DIRECTIVE',
    issuing_authority: 'FAA / EASA / DGCA',
    aircraft: '',
    effective_date: '',
    due_date: '',
    priority: 'HIGH',
    status: 'OPEN',
    notes: '',
  });

  const [aircraftList, setAircraftList] = useState([]);
  const [loadingAircraft, setLoadingAircraft] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Load aircraft options
  useEffect(() => {
    if (isOpen) {
      setLoadingAircraft(true);
      aircraftApi
        .getAircraftList({ page_size: 100 })
        .then((res) => {
          if (res.results) setAircraftList(res.results);
        })
        .catch(() => {})
        .finally(() => setLoadingAircraft(false));
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        requirement_code: initialData.requirement_code || '',
        title: initialData.title || '',
        description: initialData.description || '',
        regulation_type: initialData.regulation_type || 'AIRWORTHINESS_DIRECTIVE',
        issuing_authority: initialData.issuing_authority || 'FAA',
        aircraft: initialData.aircraft || '',
        effective_date: initialData.effective_date || '',
        due_date: initialData.due_date || '',
        priority: initialData.priority || 'HIGH',
        status: initialData.status || 'OPEN',
        notes: initialData.notes || '',
      });
    } else {
      const today = new Date().toISOString().slice(0, 10);
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      setFormData({
        requirement_code: '',
        title: '',
        description: '',
        regulation_type: 'AIRWORTHINESS_DIRECTIVE',
        issuing_authority: 'FAA / EASA / DGCA',
        aircraft: '',
        effective_date: today,
        due_date: nextMonth,
        priority: 'HIGH',
        status: 'OPEN',
        notes: '',
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

  const autoGenerateCode = () => {
    const prefix = formData.regulation_type === 'AIRWORTHINESS_DIRECTIVE' ? 'AD' : 'SB';
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, requirement_code: `${prefix}-${year}-FAA-${rand}` }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.requirement_code.trim()) {
      newErrors.requirement_code = 'Requirement code is required';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Regulatory description and scope are required';
    }
    if (!formData.issuing_authority.trim()) {
      newErrors.issuing_authority = 'Issuing authority is required';
    }
    if (!formData.aircraft) {
      newErrors.aircraft = 'Target aircraft is required';
    }
    if (!formData.effective_date) {
      newErrors.effective_date = 'Effective date is required';
    }
    if (!formData.due_date) {
      newErrors.due_date = 'Compliance due date is required';
    }
    if (formData.effective_date && formData.due_date && formData.due_date < formData.effective_date) {
      newErrors.due_date = 'Compliance due date cannot be prior to effective date';
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
      ...formData,
      requirement_code: formData.requirement_code.trim().toUpperCase(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      issuing_authority: formData.issuing_authority.trim(),
      aircraft: Number(formData.aircraft),
      notes: formData.notes.trim(),
    };

    try {
      if (isEdit) {
        await complianceApi.updateRequirement(initialData.id, payload);
      } else {
        await complianceApi.createRequirement(payload);
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
        setServerError(generalMsg || 'Please review highlighted fields.');
      } else {
        setServerError(err.message || 'Failed to save compliance requirement.');
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
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? 'Edit Compliance Mandate' : 'Issue Airworthiness Directive / Mandate'}
              </h2>
              <p className="text-xs text-slate-400">
                Register mandatory safety directives, service bulletins, or internal airworthiness policies
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
          {/* Row 1: Code & Auto-generate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">
                  Requirement Code <span className="text-rose-400">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={autoGenerateCode}
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto Generate</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                name="requirement_code"
                value={formData.requirement_code}
                onChange={handleChange}
                placeholder="e.g. AD-2026-FAA-01"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white uppercase placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.requirement_code ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.requirement_code && <p className="text-xs text-rose-400 mt-1">{errors.requirement_code}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Regulation Type <span className="text-rose-400">*</span>
              </label>
              <select
                name="regulation_type"
                value={formData.regulation_type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {REGULATION_TYPE_CHOICES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Directive / Requirement Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Mandatory Ultrasonic Inspection of Main Landing Gear Trunnion Pins"
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? 'border-rose-500' : 'border-slate-700'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Row 3: Target Aircraft & Issuing Authority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Target Aircraft <span className="text-rose-400">*</span>
              </label>
              <select
                name="aircraft"
                value={formData.aircraft}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.aircraft ? 'border-rose-500' : 'border-slate-700'
                }`}
              >
                <option value="">Select Aircraft Tail...</option>
                {aircraftList.map((ac) => (
                  <option key={ac.id} value={ac.id}>
                    {ac.registration_number} — {ac.model} ({ac.aircraft_type})
                  </option>
                ))}
              </select>
              {errors.aircraft && <p className="text-xs text-rose-400 mt-1">{errors.aircraft}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Issuing Regulatory Authority <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="issuing_authority"
                value={formData.issuing_authority}
                onChange={handleChange}
                placeholder="e.g. FAA / EASA / DGCA / Boeing"
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.issuing_authority ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.issuing_authority && <p className="text-xs text-rose-400 mt-1">{errors.issuing_authority}</p>}
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Effective Binding Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="effective_date"
                value={formData.effective_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.effective_date ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.effective_date && <p className="text-xs text-rose-400 mt-1">{errors.effective_date}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Compliance Due Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.due_date ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.due_date && <p className="text-xs text-rose-400 mt-1">{errors.due_date}</p>}
            </div>
          </div>

          {/* Row 5: Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Priority Level <span className="text-rose-400">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {REQUIREMENT_PRIORITY_CHOICES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Compliance Status <span className="text-rose-400">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {REQUIREMENT_STATUS_CHOICES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 6: Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Regulatory Scope & Instructions <span className="text-rose-400">*</span>
            </label>
            <textarea
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed regulatory mandate specifications, technical instructions, affected serial numbers..."
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.description ? 'border-rose-500' : 'border-slate-700'
              }`}
            ></textarea>
            {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Engineering Implementation Notes
            </label>
            <textarea
              name="notes"
              rows="2"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Special tools required, parts kits, downtime requirements, engineering references..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Issue Mandate'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
