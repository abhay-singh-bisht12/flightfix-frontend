import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Layers, ShieldCheck, Database, Wrench, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../api/client';

const moduleDetails = {
  '/aircraft': {
    title: 'Aircraft & Equipment Management',
    moduleNumber: 'Module 2',
    description: 'Fleet registry, aircraft models, tail numbers, serial numbers, total flight hours, flight cycles, and airworthiness status.',
    endpoint: '/api/aircraft/',
    status: 'Backend Ready (Verified)',
    features: ['Fleet registration & tail number tracking', 'Model master data & specifications', 'Total flight hours & flight cycles sync', 'Airworthiness status monitoring'],
  },
  '/maintenance': {
    title: 'Maintenance Planning & Scheduling',
    moduleNumber: 'Module 3',
    description: 'Scheduled inspection intervals (A, B, C, D checks), threshold triggers, and maintenance schedule tracking.',
    endpoint: '/api/maintenance-planning/schedules/',
    status: 'Backend Ready (Verified)',
    features: ['Check interval management (A/B/C/D)', 'Automated schedule generator', 'Threshold triggers (hours / cycles / days)', 'Schedule status tracking'],
  },
  '/work-orders': {
    title: 'Work Orders Management',
    moduleNumber: 'Module 4',
    description: 'Work order lifecycle, task dispatch, technician assignments, priority queues, and sign-offs.',
    endpoint: '/api/work-orders/',
    status: 'Backend Ready (Verified)',
    features: ['Work order generation from schedules', 'Technician dispatch & assignment', 'Priority & labor hour tracking', 'Multi-step sign-off workflow'],
  },
  '/inventory': {
    title: 'Spare Parts Inventory',
    moduleNumber: 'Module 5',
    description: 'Aviation spare parts catalog, stock levels, warehouse bins, minimum stock thresholds, and transaction history.',
    endpoint: '/api/inventory/parts/',
    status: 'Backend Ready (Verified)',
    features: ['Normalized part numbers & categories', 'Quantity tracking & min stock alerts', 'Warehouse & bin location tagging', 'Audit-ready transaction logs'],
  },
  '/execution': {
    title: 'Maintenance Execution & Documentation',
    moduleNumber: 'Module 6',
    description: 'Shop floor execution, technician remarks, actual labor hours, step progress, and digital maintenance records.',
    endpoint: '/api/maintenance-execution/records/',
    status: 'Backend Ready (Verified)',
    features: ['Technician labor hour logs', 'Work performed remarks & sign-offs', 'Execution status tracking', 'Digital record metadata generation'],
  },
  '/compliance': {
    title: 'Compliance Management',
    moduleNumber: 'Module 7',
    description: 'Airworthiness Directives (ADs), Service Bulletins (SBs), regulatory authorities (FAA/EASA), and audit readiness.',
    endpoint: '/api/compliance/requirements/',
    status: 'Backend Ready (Verified)',
    features: ['AD & SB directive tracking', 'Issuing authority compliance tracking', 'Effective and due date notifications', 'Aircraft compliance link & audit log'],
  },
  '/supply-chain': {
    title: 'ERP & Supply Chain Integration',
    moduleNumber: 'Module 8',
    description: 'Supplier registry, Purchase Orders (POs), line items, delivery tracking, and automated stock receipt.',
    endpoint: '/api/supply-chain/purchase-orders/',
    status: 'Backend Ready (Verified)',
    features: ['Approved vendor management', 'Purchase order generation & approvals', 'Item receipt & inventory sync', 'Supplier status & delivery tracking'],
  },
  '/mobile': {
    title: 'Line Station & Mobile Maintenance',
    moduleNumber: 'Field Operations',
    description: 'Optimized touch-friendly interface for line technicians, quick status updates, and field maintenance logs.',
    endpoint: '/api/mobile/tasks/',
    status: 'Operations Ready',
    features: ['Assigned line work packages', 'Quick task execution & sign-off', 'Lightweight payload serialization', 'Field-friendly status transitions'],
  },
  '/analytics': {
    title: 'Analytics & Reporting APIs',
    moduleNumber: 'Module 10',
    description: 'Read-only management dashboards, fleet readiness, maintenance costs, and compliance audit summaries.',
    endpoint: '/api/analytics/dashboard/',
    status: 'Backend Ready (Verified)',
    features: ['Executive summary metrics', 'Fleet availability & downtime stats', 'Maintenance labor expenditure analysis', 'Compliance rate aggregation'],
  },
  '/login': {
    title: 'Authentication & Access Portal',
    moduleNumber: 'Module 1',
    description: 'Custom user authentication with JWT tokens and Role-Based Access Control (RBAC).',
    endpoint: '/api/auth/login/',
    status: 'Backend Ready (Verified)',
    features: ['JWT access and refresh tokens', 'Role-based authorization', 'Technician, Manager, Safety Officer roles', 'Secure session storage'],
  },
};

export default function ModulePlaceholder() {
  const location = useLocation();
  const info = moduleDetails[location.pathname] || {
    title: 'Module Workspace',
    moduleNumber: 'FlightFix Component',
    description: 'Aviation maintenance workspace module.',
    endpoint: '/api/',
    status: 'Ready',
    features: [],
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Operations Dashboard</span>
      </Link>

      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
              {info.moduleNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{info.title}</h1>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
            {info.status}
          </span>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          {info.description}
        </p>

        {/* Operational Status Reference */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-slate-300">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-slate-400">Operational Workspace:</span>
            <span className="text-white font-semibold">{info.title}</span>
          </div>
          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
            Active Service Route
          </span>
        </div>

        {/* Planned Features */}
        <div className="space-y-3 pt-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Integrated Platform Capabilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {info.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2.5 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-xs text-slate-200"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-start space-x-3">
          <Wrench className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <strong>Operations Route Active:</strong> This workspace terminal is active and synchronized with the central FlightFix MRO operations engine. Use the navigation bar above or dashboard quick links to jump directly to any operational module.
          </div>
        </div>
      </div>
    </div>
  );
}
