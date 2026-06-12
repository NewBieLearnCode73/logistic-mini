import type { Node } from './node.types';
import type { Product } from './product.types';

export interface Batch {
  id: string;
  batchCode: string;
  productId: string;
  originNodeId: string;
  currentNodeId: string;
  quantity: number;
  unit: string;
  totalValue: number;
  manufactureDate: string;
  expiryDate: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  product?: Product;
  originNode?: Node;
  currentNode?: Node;
  localInventory?: {
    batchId: string;
    nodeId: string;
    quantityAvailable: number;
    lastUpdatedAt: string;
    version: number;
  } | null;
  inventories?: Array<{
    batchId: string;
    nodeId: string;
    quantityAvailable: number;
    lastUpdatedAt: string;
    version: number;
    node?: Node;
  }>;
}

export interface BatchQrCode {
  id: string;
  batchId: string;
  qrData: string;
  svgData: string;
  qrImageUrl: string; // Base64 PNG data URL
  generatedBy: string;
  generatedAt: string;
}

export interface TimelineEvent {
  id: string;
  batchId: string;
  eventType: string;
  nodeId: string;
  actorId: string;
  quantityDelta: number | null;
  notes: string | null;
  occurredAt: string;
  node?: Node;
  actor?: {
    id: string;
    email: string;
    fullName: string;
  };
  metadata?: any;
}

export interface CreateBatchDto {
  productId: string;
  quantity: number;
  unit?: string;
  manufactureDate: string;
  expiryDate: string;
  originNodeId?: string; // Optional for Manufacturer, required for Admin
}

export interface SellBatchDto {
  quantity: number;
}
