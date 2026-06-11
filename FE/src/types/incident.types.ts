import type { Shipment } from './shipment.types';
import type { Batch } from './batch.types';

export interface IncidentReport {
  id: string;
  incidentCode: string;
  shipmentId: string;
  batchId: string;
  incidentType: string; // OVERDUE | MISSING | DAMAGED | FRAUD | OTHER
  status: string; // OPEN | IN_PROGRESS | RESOLVED | CLOSED
  priority: string; // LOW | MEDIUM | HIGH | CRITICAL
  reportedBy: string;
  assignedTo: string | null;
  description: string;
  resolution: string | null;
  resolutionType: string | null;
  firstApprovedBy: string | null;
  approvedBy: string | null;
  evidenceJsonb: any;
  openedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  version: number;
  shipment?: Shipment;
  batch?: Batch;
  reporter?: {
    id: string;
    email: string;
    fullName: string;
  };
  assignee?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  approver?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export interface CreateIncidentDto {
  shipmentId: string;
  incidentType: string;
  description: string;
  priority?: string;
}
