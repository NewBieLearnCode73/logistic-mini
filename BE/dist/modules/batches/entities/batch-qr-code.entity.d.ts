import { BatchEntity } from './batch.entity';
import { UserEntity } from '../../users/entities/user.entity';
export declare class BatchQrCodeEntity {
    id: string;
    batchId: string;
    qrData: string;
    svgData: string | null;
    qrImageUrl: string | null;
    generatedAt: Date;
    generatedBy: string;
    batch: BatchEntity;
    generator: UserEntity;
}
