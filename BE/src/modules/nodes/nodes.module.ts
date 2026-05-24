import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeEntity } from './entities/node.entity';
import { NodesService } from './nodes.service';
import { NodesController } from './nodes.controller';
import { InventoryEntity } from '../batches/entities/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NodeEntity, InventoryEntity])],
  controllers: [NodesController],
  providers: [NodesService],
  exports: [NodesService, TypeOrmModule],
})
export class NodesModule {}
