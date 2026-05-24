import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentReportEntity } from './entities/incident-report.entity';
import { ShipmentIssueEntity } from './entities/shipment-issue.entity';
import { InventoryAdjustmentEntity } from './entities/inventory-adjustment.entity';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentReportEntity,
      ShipmentIssueEntity,
      InventoryAdjustmentEntity,
    ]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService],
  exports: [IncidentsService],
})
export class IncidentsModule {}
