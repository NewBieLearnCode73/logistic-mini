import type { Node } from './node.types';
import type { Batch } from './batch.types';

export interface Shipment {
  id: string;
  trackingCode: string;
  batchId: string;
  sourceNodeId: string;
  destinationNodeId: string;
  quantityShipped: number;
  quantityReceived: number | null;
  status: string;
  createdBy: string;
  notes: string | null;
  shippedAt: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  createdAt: string;
  batch?: Batch;
  sourceNode?: Node;
  destinationNode?: Node;
  creator?: {
    id: string;
    email: string;
    fullName: string;
  };
  receiver?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
  issues?: ShipmentIssue[];
}

export interface ShipmentIssue {
  id: string;
  shipmentId: string;
  reporterId: string;
  description: string;
  createdAt: string;
  reporter?: {
    id: string;
    email: string;
    fullName: string;
  };
  incidentReport?: any;
}

export interface CreateShipmentDto {
  batchId: string;
  destinationNodeId: string;
  quantityShipped: number;
  notes?: string;
  sourceNodeId?: string;
  expectedDeliveryDate?: string;
}
