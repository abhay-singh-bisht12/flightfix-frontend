/**
 * FlightFix API Endpoints Registry
 * Centralized mapping of all backend endpoints for the 10 core modules.
 */

export const ENDPOINTS = {
  HEALTH: '/health/',

  AUTH: {
    LOGIN: '/auth/login/',
    REGISTER: '/auth/register/',
    REFRESH: '/auth/refresh/',
    ME: '/auth/me/',
  },

  AIRCRAFT: {
    LIST: '/aircraft/',
    DETAIL: (id) => `/aircraft/${id}/`,
    MODELS: '/aircraft/models/',
  },

  MAINTENANCE_PLANNING: {
    SCHEDULES: '/maintenance-planning/schedules/',
    SCHEDULE_DETAIL: (id) => `/maintenance-planning/schedules/${id}/`,
    TASKS: '/maintenance-planning/tasks/',
    TASK_DETAIL: (id) => `/maintenance-planning/tasks/${id}/`,
  },

  WORK_ORDERS: {
    LIST: '/work-orders/',
    DETAIL: (id) => `/work-orders/${id}/`,
    TASKS: (id) => `/work-orders/${id}/tasks/`,
  },

  INVENTORY: {
    PARTS: '/inventory/parts/',
    PART_DETAIL: (id) => `/inventory/parts/${id}/`,
    TRANSACTIONS: '/inventory/transactions/',
    LOW_STOCK_ALERTS: '/inventory/parts/low-stock/',
  },

  MAINTENANCE_EXECUTION: {
    RECORDS: '/maintenance-execution/records/',
    RECORD_DETAIL: (id) => `/maintenance-execution/records/${id}/`,
    DOCUMENTATION: '/maintenance-execution/documentation/',
    DOCUMENTATION_DETAIL: (id) => `/maintenance-execution/documentation/${id}/`,
  },

  COMPLIANCE: {
    REQUIREMENTS: '/compliance/requirements/',
    REQUIREMENT_DETAIL: (id) => `/compliance/requirements/${id}/`,
    OVERDUE: '/compliance/requirements/overdue/',
  },

  SUPPLY_CHAIN: {
    SUPPLIERS: '/supply-chain/suppliers/',
    SUPPLIER_DETAIL: (id) => `/supply-chain/suppliers/${id}/`,
    PURCHASE_ORDERS: '/supply-chain/purchase-orders/',
    PO_DETAIL: (id) => `/supply-chain/purchase-orders/${id}/`,
  },

  MOBILE: {
    DASHBOARD: '/mobile/dashboard/',
    MY_TASKS: '/mobile/my-tasks/',
    MY_WORK_ORDERS: '/mobile/my-work-orders/',
    MY_EXECUTIONS: '/mobile/my-executions/',
    MY_AIRCRAFT: '/mobile/my-aircraft/',
    MY_COMPLIANCE: '/mobile/my-compliance/',
    AVAILABLE_PARTS: '/mobile/available-parts/',
  },

  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard/',
    FLEET_STATUS: '/analytics/fleet-status/',
    MAINTENANCE_METRICS: '/analytics/maintenance-metrics/',
    COMPLIANCE_SUMMARY: '/analytics/compliance-summary/',
  },
};

export default ENDPOINTS;
