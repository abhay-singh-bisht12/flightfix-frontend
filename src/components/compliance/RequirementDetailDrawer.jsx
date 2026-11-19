import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Plane,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileCheck,
  Edit2,
  Trash2,
  Plus,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import LoadingSpinner from '../common/LoadingSpinner';
import complianceApi from '../../api/compliance';

export default function RequirementDetailDrawer({
  requirementId,
  onClose,
  onEdit,
  onDelete,
  onVerify,
  canModify = false,
  canDelete = false,
  canVerify = false,
}) {
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetail = () => {
    if (!requirementId) return;
    setLoading(true);
    setError(null);
    complianceApi
      .getRequirementDetail(requirementId)
      .then((data) => setRequirement(data))
      .catch((err) => setError(err.message || 'Failed to load compliance requirement dossier.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
  }, [requirementId]);

  if (!requirementId) return null;

  const isOverdue =
    requirement?.due_date &&
    new Date(requirement.due_date) < new Date() &&
    requirement.status !== 'COMPLIANT';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  {requirement?.requirement_code || 'Loading...'}
                </span>
                {requirement?.status && <StatusBadge status={requirement.status} />}
                {requirement?.priority && <StatusBadge status={requirement.priority} />}
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{requirement?.title || '...'}</p>
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
              <LoadingSpinner message="Loading airworthiness compliance records..." />
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          ) : requirement ? (
            <>
              {/* Overdue Alert Banner */}
              {isOverdue && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-semibold block text-sm">Regulatory Mandate Overdue</span>
                    Compliance due date ({requirement.due_date}) has passed without recorded verification. Continued operation without compliance may violate airworthiness standards.
                  </div>
                </div>
              )}

              {/* Core Information Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Aircraft Tail</span>
                  <div className="flex items-center space-x-1.5 text-white font-semibold">
                    <Plane className="w-3.5 h-3.5 text-blue-400" />
                    <span>{requirement.aircraft_registration}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Regulation Type</span>
                  <span className="font-medium text-slate-200">
                    {requirement.regulation_type_display || requirement.regulation_type}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Issuing Authority</span>
                  <span className="font-medium text-slate-200">
                    {requirement.issuing_authority}
                  </span>
                </div>

                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block mb-1">Compliance Due</span>
                  <div className={`font-semibold flex items-center space-x-1 ${isOverdue ? 'text-rose-400' : 'text-slate-200'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{requirement.due_date}</span>
                  </div>
                </div>
              </div>

              {/* Regulatory Scope and Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Regulatory Mandate Scope & Directive
                </h4>
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {requirement.description}
                </div>
              </div>

              {/* Engineering Implementation Notes */}
              {requirement.notes && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Implementation / Engineering Instructions
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-800/20 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {requirement.notes}
                  </div>
                </div>
              )}

              {/* Verification Audit Records */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Compliance Verification & Evidence History</span>
                  </h4>

                  {canVerify && requirement.status !== 'COMPLIANT' && (
                    <button
                      onClick={() => onVerify?.(requirement)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition flex items-center space-x-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Record Verification</span>
                    </button>
                  )}
                </div>

                {requirement.compliance_records && requirement.compliance_records.length > 0 ? (
                  <div className="space-y-2">
                    {requirement.compliance_records.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">
                              Evidence Ref: {rec.evidence_reference}
                            </span>
                            <StatusBadge status={rec.verification_status} />
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {rec.verified_at ? new Date(rec.verified_at).toLocaleDateString() : 'Pending'}
                          </span>
                        </div>
                        {rec.verified_by_username && (
                          <p className="text-[11px] text-slate-400">
                            Verified by: <span className="text-slate-300">{rec.verified_by_username}</span>
                          </p>
                        )}
                        {rec.findings && (
                          <p className="text-[11px] text-amber-300/90 pt-1">
                            Findings: {rec.findings}
                          </p>
                        )}
                        {rec.corrective_action && (
                          <p className="text-[11px] text-emerald-300/90">
                            Action Taken: {rec.corrective_action}
                          </p>
                        )}
                        {rec.remarks && (
                          <p className="text-[11px] text-slate-400 italic pt-1">
                            "{rec.remarks}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-800/20 border border-slate-800/60 text-slate-500 text-xs">
                    No physical verification records or conformity audits logged yet for this mandate.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer actions */}
        {requirement && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            {canDelete && (
              <button
                onClick={() => onDelete?.(requirement)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Mandate</span>
              </button>
            )}

            <div className="flex items-center space-x-2 ml-auto">
              {canVerify && requirement.status !== 'COMPLIANT' && (
                <button
                  onClick={() => onVerify?.(requirement)}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verify Compliance</span>
                </button>
              )}

              {canModify && (
                <button
                  onClick={() => onEdit?.(requirement)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-purple-600 hover:bg-purple-500 transition shadow-md shadow-purple-500/20 flex items-center space-x-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Mandate</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
