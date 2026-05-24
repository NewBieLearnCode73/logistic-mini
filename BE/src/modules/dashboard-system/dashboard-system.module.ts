import { Module } from '@nestjs/common';
import { DashboardSystemController } from './dashboard-system.controller';
import { DashboardSystemService } from './dashboard-system.service';

@Module({
  controllers: [DashboardSystemController],
  providers: [DashboardSystemService],
})
export class DashboardSystemModule {}
