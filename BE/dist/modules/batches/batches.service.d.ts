import { DataSource } from 'typeorm';
import { CreateBatchDto } from './dto/create-batch.dto';
import { SellBatchDto } from './dto/sell-batch.dto';
import { BatchQrCodeEntity } from './entities/batch-qr-code.entity';
import { BatchEntity } from './entities/batch.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';
import { QrService } from './qr.service';
export declare class BatchesService {
    private readonly dataSource;
    private readonly qrService;
    constructor(dataSource: DataSource, qrService: QrService);
    create(createBatchDto: CreateBatchDto, currentUser: any): Promise<BatchEntity>;
    findById(id: string): Promise<BatchEntity>;
    findAll(query: any, currentUser: any): Promise<any>;
    findDetails(id: string, currentUser: any): Promise<any>;
    getTimeline(id: string, currentUser: any): Promise<TimelineEventEntity[]>;
    regenerateQr(id: string, currentUser: any): Promise<BatchQrCodeEntity>;
    sell(id: string, sellBatchDto: SellBatchDto, currentUser: any): Promise<void>;
}
