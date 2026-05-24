import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchEntity } from './entities/batch.entity';
import { BatchQrCodeEntity } from './entities/batch-qr-code.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';
import { BatchesService } from './batches.service';
import { QrService } from './qr.service';
import { BatchesController } from './batches.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BatchEntity,
      BatchQrCodeEntity,
      InventoryEntity,
      TimelineEventEntity,
    ]),
  ],
  controllers: [BatchesController],
  providers: [BatchesService, QrService],
  exports: [BatchesService, TypeOrmModule],
})
export class BatchesModule {}
