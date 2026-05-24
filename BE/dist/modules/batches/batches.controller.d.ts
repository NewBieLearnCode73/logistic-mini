import { BatchesService } from './batches.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { SellBatchDto } from './dto/sell-batch.dto';
import { BatchEntity } from './entities/batch.entity';
import { BatchQrCodeEntity } from './entities/batch-qr-code.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';
export declare class BatchesController {
    private readonly batchesService;
    constructor(batchesService: BatchesService);
    create(createBatchDto: CreateBatchDto, req: any): Promise<BatchEntity>;
    findAll(query: any, req: any): Promise<any>;
    findDetails(id: string, req: any): Promise<any>;
    getTimeline(id: string, req: any): Promise<TimelineEventEntity[]>;
    sell(id: string, sellBatchDto: SellBatchDto, req: any): Promise<void>;
    regenerateQr(id: string, req: any): Promise<BatchQrCodeEntity>;
}
