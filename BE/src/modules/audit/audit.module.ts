import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './entities/audit-log.entity';
import { ScanLogEntity } from './entities/scan-log.entity';
import { AuditService } from './audit.service';
import { PublicTraceController } from './public-trace.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLogEntity, ScanLogEntity]),
    AuthModule,
  ],
  controllers: [PublicTraceController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
