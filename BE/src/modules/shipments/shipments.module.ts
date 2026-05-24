import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentEntity } from './entities/shipment.entity';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { BatchesModule } from '../batches/batches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShipmentEntity]),
    BatchesModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  exports: [ShipmentsService, TypeOrmModule],
})
export class ShipmentsModule {}
