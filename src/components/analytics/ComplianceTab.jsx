import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  AlertOctagon,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { DonutChart, HorizontalBarMeter, KpiCard, SegmentedProgressBar, CHART_COLORS } from './AnalyticsCharts';

const COMPLIANCE_STATUS_COLORS = {
  COMPLIANT: CHART_COLORS.emerald,
  OPEN: CHART_COLORS.blue,
  IN_PROGRESS: CHART_COLORS.amber,
  NON_COMPLIANT: CHART_COLORS.rose,
  EXPIRED: CHART_COLORS.purple,
};

const REGULATION_TYPE_COLORS = {
  AIRWORTHINESS_DIRECTIVE: CHART_COLORS.rose,
  SERVICE_BULLETIN: CHART_COLORS.blue,
  REGULATORY_AUDIT: CHART_COLORS.amber,
  INTERNAL_POLICY: CHART_COLORS.indigo,
  MAINTENANCE_DIRECTIVE: CHART_COLORS.cyan,
};

const PRIORITY_COLORS = {
  LOW: CHART_COLORS.slate,
  MEDIUM: CHART_COLORS.blue,
  HIGH: CHART_COLORS.amber,
  CRITICAL: CHART_COLORS.rose,
};

export default function ComplianceTab({ data }) {
  if (!data) return null;

  const {
    requirements_by_status = {},
    requirements_by_priority = {},
    requirements_by_regulation_type = {},
    overdue_expired_compliance_requirements = 0,
    compliant_vs_non_compliant_counts = {},
    compliance_records_by_verification_status = {},
  } = data;

  const totalReqs = Object.values(requirements_by_status).reduce((a, b) => a + Number(b), 0);
  const compliantCount = compliant_vs_non_compliant_counts?.compliant || 0;
  const nonCompliantCount = (compliant_vs_non_compliant_counts?.non_compliant || 0) + (compliant_vs_non_compliant_counts?.expired || 0);
  const openCount = compliant_vs_non_compliant_counts?.open_or_in_progress || 0;
  const complianceRate = totalReqs > 0 ? Math.round((compliantCount / totalReqs) * 100) : 100;

  const totalAuditRecords = Object.values(compliance_records_by_verification_status).reduce(
    (a, b) => a + Number(b),
    0
  );

  return (
    <div className="space-y-6">
      {/* Compliance Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Airworthiness Directives & Mandates"
          value={totalReqs}
          subtext="Total regulatory mandates tracked"
          icon={ShieldCheck}
          color="blue"
        />
        <KpiCard
          title="Compliant Directives"
          value={compliantCount}
          subtext={`${complianceRate}% regulatory compliance rate`}
          icon={CheckCircle2}
          color="emerald"
          badge={`${complianceRate}% Compliant`}
          badgeType={complianceRate >= 90 ? 'success' : 'warning'}
        />
        <KpiCard
          title="Open / In Verification"
          value={openCount}
          subtext="Directives undergoing conformity checks"
          icon={Clock}
          color="amber"
        />
        <KpiCard
          title="Overdue / Expired Directives"
          value={overdue_expired_compliance_requirements}
          subtext={
            overdue_expired_compliance_requirements > 0
              ? 'Grounding risk: non-compliant airframes'
              : 'Zero overdue regulatory directives'
          }
          icon={AlertOctagon}
          color={overdue_expired_compliance_requirements > 0 ? 'rose' : 'emerald'}
          badge={overdue_expired_compliance_requirements > 0 ? 'Urgent' : 'All Clear'}
          badgeType={overdue_expired_compliance_requirements > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Visual Distribution Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DonutChart
          title="Requirements Compliance Status"
          subtitle="Airworthiness directives by regulatory conformity status"
          data={requirements_by_status}
          colorMap={COMPLIANCE_STATUS_COLORS}
          centerLabel="Mandates"
        />
        <HorizontalBarMeter
          title="Requirements by Regulation Type"
          subtitle="Mandates grouped by FAA/EASA ADs, SBs, and audit criteria"
          data={requirements_by_regulation_type}
          colorMap={REGULATION_TYPE_COLORS}
        />
        <HorizontalBarMeter
          title="Requirements by Priority"
          subtitle="Mandates classified by operational severity and criticality"
          data={requirements_by_priority}
          colorMap={PRIORITY_COLORS}
        />
      </div>

      {/* Verification Audit Records Progress */}
      <SegmentedProgressBar
        title="Physical Verification Audit Sign-off Distribution"
        totalLabel="Verification Records"
        segments={[
          {
            label: 'Verified & Approved',
            value: compliance_records_by_verification_status.VERIFIED || 0,
            color: CHART_COLORS.emerald,
          },
          {
            label: 'Pending Review',
            value: compliance_records_by_verification_status.PENDING_REVIEW || 0,
            color: CHART_COLORS.blue,
          },
          {
            label: 'Waived with Deviation',
            value: compliance_records_by_verification_status.WAIVED || 0,
            color: CHART_COLORS.amber,
          },
          {
            label: 'Rejected Non-Conformity',
            value: compliance_records_by_verification_status.REJECTED || 0,
            color: CHART_COLORS.rose,
          },
        ]}
      />
    </div>
  );
}
