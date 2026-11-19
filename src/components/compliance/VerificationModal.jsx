import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck, FileCheck } from 'lucide-react';
import complianceApi from '../../api/compliance';

export const VERIFICATION_STATUS_CHOICES = [
  { value: 'VERIFIED', label: 'Verified / Airworthy (Compliant)' },
  { value: 'PENDING', label: 'Pending Physical Audit' },
  { value: 'FAILED', label: 'Failed Inspection (Discrepant)' },
  { value: 'WAIVED', label: 'Waived / Exemption Granted' },
];

export default function VerificationModal({
  isOpen,
  onClose,
  requirement,
  initialData = null,
  currentUserId = null,
  onSuccess,
}) {
  const isEdit = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    verification_status: 'VERIFIED',
    evidence_reference: '',
    findings: '',
    corrective_action: '',
    remarks: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        verification_status: initialData.verification_status || 'VERIFIED',
        evidence_reference: initialData.evidence_reference || '',
        findings: initialData.findings || '',
        corrective_action: initialData.corrective_action || '',
        remarks: initialData.remarks || '',
      });
    } else {
      setFormData({
        verification_status: 'VERIFIED',
        evidence_reference: '',
        findings: '',
        corrective_action: '',
        remarks: 'Physical inspection completed and conformity verified against airworthiness standards.',
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, requirement, isOpen]);

  if (!isOpen || !requirement) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.evidence_reference.trim()) {
      newErrors.evidence_reference = 'Evidence reference (Logbook entry, CRS cert #, or DMS URL) is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    const isVerified = formData.verification_status === 'VERIFIED';

    const payload = {
      requirement: requirement.id,
      verification_status: formData.verification_status,
      evidence_reference: formData.evidence_reference.trim(),
      findings: formData.findings.trim(),
      corrective_action: formData.corrective_action.trim(),
      remarks: formData.remarks.trim(),
      ...(isVerified && currentUserId
        ? { verified_by: currentUserId, verified_at: new Date().toISOString() }
        : {}),
    };

    try {
      if (isEdit) {
        await complianceApi.updateRecord(initialData.id, payload);
      } else {
        await complianceApi.createRecord(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(' ') : v}`)
          .join(' | ');
        setServerError(msg);
      } else {
        setServerError(err.message || 'Failed to record compliance verification.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Record Compliance Verification</h2>
              <p className="text-xs text-slate-400 font-mono">
                {requirement.requirement_code} • Tail {requirement.aircraft_registration}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Verification Result <span className="text-rose-400">*</span>
            </label>
            <select
              name="verification_status"
              value={formData.verification_status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {VERIFICATION_STATUS_CHOICES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Evidence Reference */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Evidence Reference / Audit Proof <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="evidence_reference"
              value={formData.evidence_reference}
              onChange={handleChange}
              placeholder="e.g. CRS-2026-6165, Logbook Entry #412, FAA Form 8130-3"
              className={`w-full px-3 py-2 bg-slate-800/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.evidence_reference ? 'border-rose-500' : 'border-slate-700'
              }`}
            />
            {errors.evidence_reference && (
              <p className="text-xs text-rose-400 mt-1">{errors.evidence_reference}</p>
            )}
          </div>

          {/* Findings */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Audit Findings / Observations
            </label>
            <textarea
              name="findings"
              rows="2"
              value={formData.findings}
              onChange={handleChange}
              placeholder="Dimensional measurements, clearance checks, or material observations..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Corrective Action */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Corrective Action (if initial deviation observed)
            </label>
            <textarea
              name="corrective_action"
              rows="2"
              value={formData.corrective_action}
              onChange={handleChange}
              placeholder="Remediation steps taken prior to airworthiness verification..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Certifier Compliance Statement / Remarks
            </label>
            <textarea
              name="remarks"
              rows="2"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Formal release statement confirming complete regulatory adherence..."
              className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Confirm Verification</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
