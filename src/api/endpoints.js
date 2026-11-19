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
  },

  EQUIPMENT: {
    LIST: '/equipment/',
    DETAIL: (id) => `/equipment/${id}/`,
  },

  MAINTENANCE: {
    SCHEDULES: '/maintenance/schedules/',
    SCHEDULE_DETAIL: (id) => `/maintenance/schedules/${id}/`,
    TASKS: '/maintenance/tasks/',
    TASK_DETAIL: (id) => `/maintenance/tasks/${id}/`,
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
    RECORDS: '/compliance/records/',
    RECORD_DETAIL: (id) => `/compliance/records/${id}/`,
    OVERDUE: '/compliance/requirements/overdue/',
  },

  SUPPLY_CHAIN: {
    SUPPLIERS: '/supply-chain/suppliers/',
    SUPPLIER_DETAIL: (id) => `/supply-chain/suppliers/${id}/`,
    PURCHASE_ORDERS: '/supply-chain/purchase-orders/',
    PO_DETAIL: (id) => `/supply-chain/purchase-orders/${id}/`,
    PO_RECEIVE: (id) => `/supply-chain/purchase-orders/${id}/receive/`,
    PO_ITEMS: '/supply-chain/purchase-order-items/',
    PO_ITEM_DETAIL: (id) => `/supply-chain/purchase-order-items/${id}/`,
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
    MAINTENANCE_SUMMARY: '/analytics/maintenance-summary/',
    AIRCRAFT_SUMMARY: '/analytics/aircraft-summary/',
    INVENTORY_SUMMARY: '/analytics/inventory-summary/',
    COMPLIANCE_SUMMARY: '/analytics/compliance-summary/',
    SUPPLY_CHAIN_SUMMARY: '/analytics/supply-chain-summary/',
    TECHNICIAN_PERFORMANCE: '/analytics/technician-performance/',
    // Backwards-compatible aliases
    FLEET_STATUS: '/analytics/aircraft-summary/',
    MAINTENANCE_METRICS: '/analytics/maintenance-summary/',
  },
};

export default ENDPOINTS;
