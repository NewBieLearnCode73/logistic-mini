import { BatchEntity } from './batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { TimelineEventType } from '../../../common/enums/timeline-event-type.enum';
export declare class TimelineEventEntity {
    id: string;
    batchId: string;
    eventType: TimelineEventType;
    nodeId: string | null;
    actorId: string | null;
    shipmentId: string | null;
    quantityDelta: number | null;
    notes: string | null;
    occurredAt: Date;
    metadata: any;
    batch: BatchEntity;
    node: NodeEntity | null;
    actor: UserEntity | null;
}
