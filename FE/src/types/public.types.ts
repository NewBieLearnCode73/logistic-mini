export interface PublicTraceNode {
  name: string;
  nodeType: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PublicTraceBatch {
  batchCode: string;
  manufactureDate: string;
  expiryDate: string;
  status: string;
  product: {
    name: string;
    sku: string;
    unit: string;
    description: string | null;
    category: string;
  } | null;
  originNode: PublicTraceNode | null;
  currentNode: PublicTraceNode | null;
}

export interface PublicTraceEvent {
  eventType: string;
  notes: string | null;
  occurredAt: string;
  node: PublicTraceNode | null;
  actor: {
    fullName: string;
  } | null;
}

export interface PublicTraceResponse {
  batch: PublicTraceBatch;
  timelineEvents: PublicTraceEvent[];
}
