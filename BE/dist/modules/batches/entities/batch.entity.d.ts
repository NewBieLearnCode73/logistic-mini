import { ProductEntity } from '../../products/entities/product.entity';
import { NodeEntity } from '../../nodes/entities/node.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { BatchStatus } from '../../../common/enums/batch-status.enum';
export declare class BatchEntity {
    id: string;
    batchCode: string;
    productId: string;
    originNodeId: string;
    currentNodeId: string;
    quantity: number;
    unit: string;
    manufactureDate: Date | string;
    expiryDate: Date | string;
    status: BatchStatus;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    product: ProductEntity;
    originNode: NodeEntity;
    currentNode: NodeEntity;
    creator: UserEntity;
}
