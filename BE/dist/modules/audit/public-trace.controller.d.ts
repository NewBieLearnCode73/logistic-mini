import { AuditService } from './audit.service';
export declare class PublicTraceController {
    private readonly auditService;
    constructor(auditService: AuditService);
    getTrace(batchCode: string, req: any, latStr?: string, lngStr?: string): Promise<{
        batch: {
            batchCode: string;
            manufactureDate: string | Date;
            expiryDate: string | Date;
            status: import("../../common/enums/batch-status.enum").BatchStatus;
            product: {
                name: string;
                sku: string;
                unit: string;
                description: string | null;
                category: string | null;
            } | null;
            originNode: {
                name: string;
                nodeType: import("../../common/enums/node-type.enum").NodeType;
                address: string | null;
                latitude: number | null;
                longitude: number | null;
            } | null;
            currentNode: {
                name: string;
                nodeType: import("../../common/enums/node-type.enum").NodeType;
                address: string | null;
                latitude: number | null;
                longitude: number | null;
            } | null;
        };
        timelineEvents: {
            eventType: import("../../common/enums/timeline-event-type.enum").TimelineEventType;
            notes: string | null;
            occurredAt: Date;
            node: {
                name: string;
                nodeType: import("../../common/enums/node-type.enum").NodeType;
                address: string | null;
                latitude: number | null;
                longitude: number | null;
            } | null;
            actor: {
                fullName: string;
            } | null;
        }[];
    }>;
}
