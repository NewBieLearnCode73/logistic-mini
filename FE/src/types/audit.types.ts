export interface AuditLog {
  id: string;
  actorId: string | null;
  action: string; // CREATE | UPDATE | DELETE | LOGIN...
  entityType: string;
  entityId: string | null;
  oldValues: any;
  newValues: any;
  ipAddress: string | null;
  userAgent: string | null;
  occurredAt: string;
  actor?: {
    id: string;
    email: string;
    fullName: string;
  } | null;
}

export interface ScanLog {
  id: string;
  batchId: string;
  scannedBy: string | null;
  scannedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  latitude: number | null;
  longitude: number | null;
  batchCode?: string;
}
