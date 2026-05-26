export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Mini Logistic';

export enum RoleName {
  ADMIN = 'Admin',
  MANUFACTURER = 'Manufacturer',
  DISTRIBUTOR = 'Distributor',
  RETAILER = 'Retailer',
  CONSUMER = 'Consumer',
}

export enum BatchStatus {
  CREATED = 'CREATED',
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  SOLD = 'SOLD',
  DELAYED = 'DELAYED',
  INVESTIGATING = 'INVESTIGATING',
  LOST = 'LOST',
  DISCARDED = 'DISCARDED',
}

export enum ShipmentStatus {
  IN_TRANSIT = 'IN_TRANSIT',
  RECEIVED = 'RECEIVED',
  DELAYED = 'DELAYED',
  INVESTIGATING = 'INVESTIGATING',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

export enum NodeType {
  MANUFACTURER = 'MANUFACTURER',
  DISTRIBUTOR = 'DISTRIBUTOR',
  RETAILER = 'RETAILER',
  WAREHOUSE = 'WAREHOUSE',
}

// Muted status dot + text styling. No bg color — just a dot indicator.
export const STATUS_CONFIG: Record<string, { dot: string; text: string }> = {
  CREATED:       { dot: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-400' },
  IN_TRANSIT:    { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  RECEIVED:      { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  SOLD:          { dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  DELAYED:       { dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400' },
  INVESTIGATING: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400' },
  LOST:          { dot: 'bg-red-600', text: 'text-red-800 dark:text-red-300' },
  DISCARDED:     { dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-500' },
  CANCELLED:     { dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-500' },
  OPEN:          { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  IN_PROGRESS:   { dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400' },
  RESOLVED:      { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400' },
  CLOSED:        { dot: 'bg-gray-400', text: 'text-gray-500 dark:text-gray-500' },
};

export const NODE_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  WAREHOUSE: 'Warehouse',
};
