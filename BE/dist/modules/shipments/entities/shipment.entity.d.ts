import { BatchEntity } from '../../batches/entities/batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { ShipmentStatus } from '../../../common/enums/shipment-status.enum';
export declare class ShipmentEntity {
    id: string;
    trackingCode: string;
    batchId: string;
    sourceNodeId: string;
    destinationNodeId: string;
    quantityShipped: number;
    status: ShipmentStatus;
    shippedAt: Date;
    expectedDeliveryDate: Date | null;
    actualDeliveryDate: Date | null;
    notes: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    batch: BatchEntity;
    sourceNode: NodeEntity;
    destinationNode: NodeEntity;
    creator: UserEntity;
}
