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
  CREATED:       { dot: 'bg-status-created-dot', text: 'text-status-created-text' },
  IN_TRANSIT:    { dot: 'bg-status-intransit-dot', text: 'text-status-intransit-text' },
  RECEIVED:      { dot: 'bg-status-received-dot', text: 'text-status-received-text' },
  SOLD:          { dot: 'bg-status-sold-dot', text: 'text-status-sold-text' },
  DELAYED:       { dot: 'bg-status-lost-dot', text: 'text-status-lost-text' },
  INVESTIGATING: { dot: 'bg-status-discarded-dot', text: 'text-status-discarded-text' },
  LOST:          { dot: 'bg-status-lost-dot', text: 'text-status-lost-text' },
  DISCARDED:     { dot: 'bg-status-discarded-dot', text: 'text-status-discarded-text' },
  CANCELLED:     { dot: 'bg-status-created-dot', text: 'text-status-created-text' },
  OPEN:          { dot: 'bg-status-lost-dot', text: 'text-status-lost-text' },
  IN_PROGRESS:   { dot: 'bg-status-intransit-dot', text: 'text-status-intransit-text' },
  RESOLVED:      { dot: 'bg-status-received-dot', text: 'text-status-received-text' },
  CLOSED:        { dot: 'bg-status-created-dot', text: 'text-status-created-text' },
};

export const NODE_TYPE_LABELS: Record<string, string> = {
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  RETAILER: 'Retailer',
  WAREHOUSE: 'Warehouse',
};
