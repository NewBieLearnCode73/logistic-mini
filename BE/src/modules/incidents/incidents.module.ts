import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentReportEntity } from './entities/incident-report.entity';
import { ShipmentIssueEntity } from './entities/shipment-issue.entity';
import { InventoryAdjustmentEntity } from './entities/inventory-adjustment.entity';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { BrevoEmailService } from './brevo-email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentReportEntity,
      ShipmentIssueEntity,
      InventoryAdjustmentEntity,
    ]),
  ],
  controllers: [IncidentsController],
  providers: [IncidentsService, BrevoEmailService],
  exports: [IncidentsService, BrevoEmailService],
})
export class IncidentsModule {}

