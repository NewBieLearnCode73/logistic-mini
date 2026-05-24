import { BatchEntity } from '../../batches/entities/batch.entity';
import { BatchQrCodeEntity } from '../../batches/entities/batch-qr-code.entity';
import { UserEntity } from '../../users/entities/user.entity';
export declare class ScanLogEntity {
    id: string;
    batchId: string;
    qrCodeId: string | null;
    scannedBy: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    latitude: number | null;
    longitude: number | null;
    scannedAt: Date;
    batch: BatchEntity;
    qrCode: BatchQrCodeEntity | null;
    scanner: UserEntity | null;
}
