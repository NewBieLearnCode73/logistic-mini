import { BatchEntity } from '../../batches/entities/batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
export declare class InventoryAdjustmentEntity {
    id: string;
    batchId: string;
    nodeId: string;
    adjustmentType: string;
    qtyBefore: number;
    qtyDelta: number;
    qtyAfter: number;
    reason: string;
    approvedBy: string;
    secondApprover: string | null;
    referenceId: string | null;
    referenceType: string | null;
    createdAt: Date;
    batch: BatchEntity;
    node: NodeEntity;
    approver: UserEntity;
    secondApproverUser: UserEntity | null;
}
