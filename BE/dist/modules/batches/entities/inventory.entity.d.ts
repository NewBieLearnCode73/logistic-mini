import { BatchEntity } from './batch.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
export declare class InventoryEntity {
    batchId: string;
    nodeId: string;
    quantityAvailable: number;
    lastUpdatedAt: Date;
    version: number;
    batch: BatchEntity;
    node: NodeEntity;
}
